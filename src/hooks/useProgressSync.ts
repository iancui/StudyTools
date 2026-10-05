// 墨韵中文 前端 学习进度云同步 Hook
// ============================================================
//
// 设计原则 (按施工单 03 要求):
//   1. 学习时继续立即保存 localStorage (App.tsx 已有的 useEffect 完成)
//   2. 云端异步保存 (本 hook 负责防抖 PUT)
//   3. 云端失败不能影响学习 (本 hook 全部 try/catch + console.warn)
//   4. 登录后从服务器恢复有效进度 (本 hook 在 isAuthenticated 切换为 true
//      时调用 GET /progress, 若服务器有有效数据则把摘要字段合并回本地)
//   5. 如果服务器没有有效数据, 则把本地进度上传 (本 hook 在 GET 返回 null
//      或全 0 时调用 PUT)
//   6. 不删除现有 localStorage 数据 (本 hook 不动 localStorage 中除
//      moyun_chinese_learning_v1 之外的内容; 合并后调用 saveProgress 写回
//      该 key, 与现有 storage.ts 行为一致)
//   7. 不覆盖数据库不存在的前端字段 (本 hook 只上传 user_progress 表实际
//      字段: inkDrops / streakDays / lastCheckinDate / 各 *_count; 数组内容
//      不上传, 仅上传其 length 作为 count)
//
// 重要限制 (MVP):
//   - user_progress 表只有摘要字段, 详细数组仍由 localStorage 维护.
//   - 跨浏览器恢复时只能恢复摘要, 数组内容不会自动同步.

import { useEffect, useRef } from "react";

import {
  useAuth,
  useAuthenticatedRequest,
} from "../contexts/AuthContext";
import {
  getProgress,
  updateProgress,
  ProgressDTO,
  UpdateProgressBody,
} from "../api/progress";
import { saveProgress } from "../utils/storage";
import { UserProgress } from "../types/progress";

// 合并保护窗口: 刚从服务器合并数据进本地后, 这段时间内不允许触发 PUT,
// 防止本地默认数组 (短) 立刻覆盖服务器端有效摘要.
const MERGE_PROTECT_MS = 2000;

// PUT 防抖时间, 500~1000ms 范围内.
const DEBOUNCE_MS = 1000;

// ------------------------------------------------------------
// 日期格式转换工具
// ------------------------------------------------------------

// 前端 lastCheckInDate 形如 "2026/10/5" (来自 toLocaleDateString("zh-CN")),
// 也可能已经是 "2026-10-05"; 统一转成 MySQL DATE 接受的 "YYYY-MM-DD".
function normalizeToISO(
  s: string | null | undefined
): string | null {
  if (!s) return null;
  const parts = s.split(/[\/\-]/);
  if (parts.length !== 3) return null;
  const y = parts[0].padStart(4, "0");
  const m = parts[1].padStart(2, "0");
  const d = parts[2].padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 服务器返回 "YYYY-MM-DD", 转回前端使用的 zh-CN 形式 "yyyy/M/d",
// 这样 lastCheckInDate 与 checkInHistory 数组的格式保持一致.
function isoToZhCN(iso: string | null): string {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  return `${y}/${m}/${d}`;
}

function toUpdateBody(
  p: UserProgress
): UpdateProgressBody {
  return {
    inkDrops: p.inkDrops,
    streakDays: p.streakDays,
    lastCheckinDate: normalizeToISO(
      p.lastCheckInDate
    ),
    previewCount: p.previewedItemIds.length,
    masteredCharacterCount:
      p.masteredCharacterIds.length,
    masteredWordCount: p.masteredWordIds.length,
    completedSentenceCount:
      p.completedSentenceIds.length,
  };
}

// 服务器是否有"有效"数据: 任意摘要字段非 0 / 非 null 即视为有效.
function hasValidServerData(
  s: ProgressDTO
): boolean {
  return (
    s.inkDrops > 0 ||
    s.streakDays > 0 ||
    !!s.lastCheckinDate ||
    s.previewCount > 0 ||
    s.masteredCharacterCount > 0 ||
    s.masteredWordCount > 0 ||
    s.completedSentenceCount > 0
  );
}

// ------------------------------------------------------------
// Hook
// ------------------------------------------------------------

export interface UseProgressSyncArgs {
  progress: UserProgress;
  setProgress: React.Dispatch<
    React.SetStateAction<UserProgress>
  >;
}

export function useProgressSync({
  progress,
  setProgress,
}: UseProgressSyncArgs): void {
  // 工单 12: 取 user.id 用于按用户隔离 localStorage 写回.
  const { isAuthenticated, user } = useAuth();
  const authReq = useAuthenticatedRequest();

  // 是否已完成本次会话的初始同步 (登录后 GET + 合并/上传).
  // 用户登出时重置为 false, 下次登录重新跑.
  const initialSyncDoneRef = useRef(false);
  // 最近一次"从服务器合并到本地"的时间戳, 用于短暂保护期.
  const lastMergeAtRef = useRef(0);
  // 防抖定时器.
  const debounceRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  // 登出时重置内部状态
  useEffect(() => {
    if (!isAuthenticated) {
      initialSyncDoneRef.current = false;
      lastMergeAtRef.current = 0;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    }
  }, [isAuthenticated]);

  // 初始同步: isAuthenticated 由 false 变 true 时执行一次.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (initialSyncDoneRef.current) return;
    initialSyncDoneRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        const server = await authReq(
          (token) => getProgress(token)
        );
        if (cancelled) return;

        if (
          server &&
          hasValidServerData(server)
        ) {
          // 服务器有有效数据: 把摘要字段合并回本地.
          // 数组内容 (previewedItemIds / masteredCharacterIds 等) 不动,
          // 因为数据库没有对应字段.
          lastMergeAtRef.current = Date.now();
          setProgress((prev) => {
            const merged: UserProgress = {
              ...prev,
              inkDrops: server.inkDrops,
              streakDays: server.streakDays,
              lastCheckInDate: isoToZhCN(
                server.lastCheckinDate
              ),
            };
            // 工单 12: 写回该用户专属 localStorage key
            saveProgress(merged, user?.id);
            return merged;
          });
        } else {
          // 服务器没有有效数据 (新用户/未初始化): 上传本地.
          const body = toUpdateBody(progress);
          await authReq((token) =>
            updateProgress(token, body)
          );
        }
      } catch (err) {
        // 云端失败不能影响学习, 只记录日志.
        console.warn(
          "进度初始同步失败 (不影响本地学习):",
          err
        );
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // 防抖 PUT: progress 任何变化都延迟 1s 后 PUT 到服务器.
  useEffect(() => {
    if (!isAuthenticated) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;

      // 合并保护窗口内不触发 PUT, 避免本地默认数组立刻覆盖服务器摘要.
      if (
        Date.now() - lastMergeAtRef.current <
        MERGE_PROTECT_MS
      ) {
        return;
      }

      (async () => {
        try {
          const body = toUpdateBody(progress);
          await authReq((token) =>
            updateProgress(token, body)
          );
        } catch (err) {
          console.warn(
            "进度上传失败 (不影响本地学习):",
            err
          );
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, isAuthenticated]);
}
