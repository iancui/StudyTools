// 墨韵中文 前端 详细学习记录云同步 Hook
// ============================================================
//
// 负责三张详细表的初始恢复 + 防抖 PUT.
// 与 useProgressSync (摘要表) 互补, 处理 masteredCharacterIds /
// masteredWordIds / completedSentenceIds 三个数组的云端同步.
//
// 设计原则 (与 useProgressSync 一致):
//   1. localStorage 立即保存 (App.tsx 已有的 useEffect 完成)
//   2. 云端异步保存 (本 hook 1000ms 防抖)
//   3. 云端失败不影响学习 (全部 try/catch + console.warn)
//   4. 登录后从服务器恢复有效数据 (替换本地三个数组)
//   5. 服务器没数据时把本地数组上传
//   6. 不删除 localStorage 数据 (合并时 saveProgress 写回)

import { useEffect, useRef } from "react";

import {
  useAuth,
  useAuthenticatedRequest,
} from "../contexts/AuthContext";
import {
  getCharacterProgress,
  updateCharacterProgress,
  getWordProgress,
  updateWordProgress,
  getSentenceProgress,
  updateSentenceProgress,
} from "../api/detailedProgress";
import { saveProgress } from "../utils/storage";
import { DetailedStats, UserProgress } from "../types/progress";

const DEBOUNCE_MS = 1000;
const MERGE_PROTECT_MS = 2000;

export interface UseDetailedProgressSyncArgs {
  progress: UserProgress;
  setProgress: React.Dispatch<
    React.SetStateAction<UserProgress>
  >;
}

export function useDetailedProgressSync({
  progress,
  setProgress,
}: UseDetailedProgressSyncArgs): void {
  // 工单 12: 取 user.id 用于按用户隔离 localStorage 写回.
  const { isAuthenticated, user } = useAuth();
  const authReq = useAuthenticatedRequest();

  const initialSyncDoneRef = useRef(false);
  const lastMergeAtRef = useRef(0);

  // 三个独立防抖定时器, 互不影响.
  const charDebounceRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);
  const wordDebounceRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);
  const sentenceDebounceRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  // 上次 PUT 时使用的快照, 用来判断本次 progress 是否真的变化,
  // 避免数组内容相同时重复 PUT.
  const lastUploadedCharRef = useRef<string[]>([]);
  const lastUploadedWordRef = useRef<string[]>([]);
  const lastUploadedSentenceRef = useRef<string[]>([]);

  // 登出时重置内部状态
  useEffect(() => {
    if (!isAuthenticated) {
      initialSyncDoneRef.current = false;
      lastMergeAtRef.current = 0;
      lastUploadedCharRef.current = [];
      lastUploadedWordRef.current = [];
      lastUploadedSentenceRef.current = [];
      for (const r of [
        charDebounceRef,
        wordDebounceRef,
        sentenceDebounceRef,
      ]) {
        if (r.current) {
          clearTimeout(r.current);
          r.current = null;
        }
      }
    }
  }, [isAuthenticated]);

  // ------------------------------------------------------------
  // 初始同步: 登录后 GET 三张表, 合并到本地或上传本地默认值.
  // ------------------------------------------------------------
  useEffect(() => {
    if (!isAuthenticated) return;
    if (initialSyncDoneRef.current) return;
    initialSyncDoneRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        const [chars, words, sentences] = await Promise.all([
          authReq((t) => getCharacterProgress(t)),
          authReq((t) => getWordProgress(t)),
          authReq((t) => getSentenceProgress(t)),
        ]);
        if (cancelled) return;

        const hasCharData = chars.some((c) => c.isMastered);
        const hasWordData = words.some((w) => w.isMastered);
        const hasSentenceData = sentences.some(
          (s) => s.isCompleted
        );

        const hasAnyServerData =
          hasCharData || hasWordData || hasSentenceData;

        if (hasAnyServerData) {
          // 服务器有有效数据: 用服务器数据替换本地三个数组.
          // 不动 inkDrops/streakDays 等摘要字段 (由 useProgressSync 处理).
          lastMergeAtRef.current = Date.now();
          const serverCharIds = chars
            .filter((c) => c.isMastered)
            .map((c) => c.characterId);
          const serverWordIds = words
            .filter((w) => w.isMastered)
            .map((w) => w.wordId);
          const serverSentenceIds = sentences
            .filter((s) => s.isCompleted)
            .map((s) => s.sentenceId);

          // 工单 17: 把服务器返回的 DTO 完整统计 (practiceCount /
          // correctCount / wrongCount / lastPracticedAt) 转成 itemId ->
          // DetailedStats map 写入 UserProgress, 供数据驱动复习算法使用.
          // 只覆盖有统计记录的 item; 没有 DTO 的 item 自然不在 map 里,
          // 复习算法把它视作"从未练习过" (P4).
          const serverCharStats = toDetailedStatsMap(
            chars,
            (c) => c.characterId,
            (c) => ({
              practiceCount: c.practiceCount,
              correctCount: c.correctCount,
              wrongCount: c.wrongCount,
              lastPracticedAt: c.lastPracticedAt,
            })
          );
          const serverWordStats = toDetailedStatsMap(
            words,
            (w) => w.wordId,
            (w) => ({
              practiceCount: w.practiceCount,
              correctCount: w.correctCount,
              wrongCount: w.wrongCount,
              lastPracticedAt: w.lastPracticedAt,
            })
          );
          const serverSentenceStats = toDetailedStatsMap(
            sentences,
            (s) => s.sentenceId,
            (s) => ({
              practiceCount: s.practiceCount,
              correctCount: s.correctCount,
              wrongCount: s.wrongCount,
              lastPracticedAt: s.lastPracticedAt,
            })
          );

          // 记录已合并的快照, 避免立刻又触发 PUT.
          lastUploadedCharRef.current = serverCharIds;
          lastUploadedWordRef.current = serverWordIds;
          lastUploadedSentenceRef.current = serverSentenceIds;

          setProgress((prev) => {
            const merged: UserProgress = {
              ...prev,
              masteredCharacterIds: serverCharIds,
              masteredWordIds: serverWordIds,
              completedSentenceIds: serverSentenceIds,
              detailedCharStats: serverCharStats,
              detailedWordStats: serverWordStats,
              detailedSentenceStats: serverSentenceStats,
            };
            // 工单 12: 写回该用户专属 localStorage key
            saveProgress(merged, user?.id);
            return merged;
          });
        } else {
          // 服务器没有任何有效记录: 把本地默认/已学数据上传.
          await Promise.all([
            authReq((t) =>
              updateCharacterProgress(
                t,
                progress.masteredCharacterIds
              )
            ),
            authReq((t) =>
              updateWordProgress(
                t,
                progress.masteredWordIds
              )
            ),
            authReq((t) =>
              updateSentenceProgress(
                t,
                progress.completedSentenceIds
              )
            ),
          ]);
          lastUploadedCharRef.current =
            progress.masteredCharacterIds;
          lastUploadedWordRef.current =
            progress.masteredWordIds;
          lastUploadedSentenceRef.current =
            progress.completedSentenceIds;

          // 工单 17: 服务器无详细记录, 把已加载的 DTO 转成
          // DetailedStats map 写入本地状态 (PUT masterId 数组时
          // 后端会重置统计, 这里仅取刚 GET 的初始状态作为快照).
          const localCharStats = toDetailedStatsMap(
            chars,
            (c) => c.characterId,
            (c) => ({
              practiceCount: c.practiceCount,
              correctCount: c.correctCount,
              wrongCount: c.wrongCount,
              lastPracticedAt: c.lastPracticedAt,
            })
          );
          const localWordStats = toDetailedStatsMap(
            words,
            (w) => w.wordId,
            (w) => ({
              practiceCount: w.practiceCount,
              correctCount: w.correctCount,
              wrongCount: w.wrongCount,
              lastPracticedAt: w.lastPracticedAt,
            })
          );
          const localSentenceStats = toDetailedStatsMap(
            sentences,
            (s) => s.sentenceId,
            (s) => ({
              practiceCount: s.practiceCount,
              correctCount: s.correctCount,
              wrongCount: s.wrongCount,
              lastPracticedAt: s.lastPracticedAt,
            })
          );
          setProgress((prev) => ({
            ...prev,
            detailedCharStats: localCharStats,
            detailedWordStats: localWordStats,
            detailedSentenceStats: localSentenceStats,
          }));
        }
      } catch (err) {
        console.warn(
          "详细进度初始同步失败 (不影响本地学习):",
          err
        );
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ------------------------------------------------------------
  // 防抖 PUT: 监听三个数组变化.
  // ------------------------------------------------------------
  const now = Date.now();
  const inMergeProtect =
    now - lastMergeAtRef.current < MERGE_PROTECT_MS;

  // Character
  useEffect(() => {
    if (!isAuthenticated) return;
    if (inMergeProtect) return;

    const current = progress.masteredCharacterIds;
    // 浅比较: 长度 + 每个 ID (顺序无关)
    if (
      !arrChanged(current, lastUploadedCharRef.current)
    ) {
      return;
    }

    if (charDebounceRef.current) {
      clearTimeout(charDebounceRef.current);
    }
    charDebounceRef.current = setTimeout(() => {
      charDebounceRef.current = null;
      (async () => {
        try {
          await authReq((t) =>
            updateCharacterProgress(t, current)
          );
          lastUploadedCharRef.current = current;
        } catch (err) {
          console.warn(
            "生字进度上传失败 (不影响本地学习):",
            err
          );
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      if (charDebounceRef.current) {
        clearTimeout(charDebounceRef.current);
        charDebounceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.masteredCharacterIds, isAuthenticated]);

  // Word
  useEffect(() => {
    if (!isAuthenticated) return;
    if (inMergeProtect) return;

    const current = progress.masteredWordIds;
    if (
      !arrChanged(current, lastUploadedWordRef.current)
    ) {
      return;
    }

    if (wordDebounceRef.current) {
      clearTimeout(wordDebounceRef.current);
    }
    wordDebounceRef.current = setTimeout(() => {
      wordDebounceRef.current = null;
      (async () => {
        try {
          await authReq((t) =>
            updateWordProgress(t, current)
          );
          lastUploadedWordRef.current = current;
        } catch (err) {
          console.warn(
            "词语进度上传失败 (不影响本地学习):",
            err
          );
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      if (wordDebounceRef.current) {
        clearTimeout(wordDebounceRef.current);
        wordDebounceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.masteredWordIds, isAuthenticated]);

  // Sentence
  useEffect(() => {
    if (!isAuthenticated) return;
    if (inMergeProtect) return;

    const current = progress.completedSentenceIds;
    if (
      !arrChanged(
        current,
        lastUploadedSentenceRef.current
      )
    ) {
      return;
    }

    if (sentenceDebounceRef.current) {
      clearTimeout(sentenceDebounceRef.current);
    }
    sentenceDebounceRef.current = setTimeout(() => {
      sentenceDebounceRef.current = null;
      (async () => {
        try {
          await authReq((t) =>
            updateSentenceProgress(t, current)
          );
          lastUploadedSentenceRef.current = current;
        } catch (err) {
          console.warn(
            "句子进度上传失败 (不影响本地学习):",
            err
          );
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      if (sentenceDebounceRef.current) {
        clearTimeout(sentenceDebounceRef.current);
        sentenceDebounceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.completedSentenceIds, isAuthenticated]);
}

// ------------------------------------------------------------
// 工具函数
// ------------------------------------------------------------

// 用 Set 比较两个 ID 数组是否内容一致 (顺序无关).
function arrChanged(
  a: string[],
  b: string[]
): boolean {
  if (a.length !== b.length) return true;
  const setB = new Set(b);
  for (const id of a) {
    if (!setB.has(id)) return true;
  }
  return false;
}

// 工单 17: 把 DTO 数组转成 itemId -> DetailedStats 的 map.
// 仅保留有统计意义的项 (practiceCount > 0 或 wrongCount > 0
// 或 lastPracticedAt 不为 null), 服务器从未返回过该 item 时
// 该 itemId 自然不在 map 中, 复习算法据此识别为"从未练习".
function toDetailedStatsMap<T extends { updatedAt?: string }>(
  items: T[],
  getId: (item: T) => string,
  pickStats: (item: T) => {
    practiceCount: number;
    correctCount: number;
    wrongCount: number;
    lastPracticedAt: string | null;
  }
): Record<string, DetailedStats> {
  const map: Record<string, DetailedStats> = {};
  for (const item of items) {
    const itemId = getId(item);
    if (!itemId) continue;
    const s = pickStats(item);
    // 只要有任何练习记录就写入 map; 没有任何记录的项
    // 留给"不在 map 里"的语义, 算法当作"从未练习"处理.
    if (
      s.practiceCount === 0 &&
      s.wrongCount === 0 &&
      s.lastPracticedAt == null
    ) {
      continue;
    }
    map[itemId] = {
      itemId,
      practiceCount: s.practiceCount,
      correctCount: s.correctCount,
      wrongCount: s.wrongCount,
      lastPracticedAt: s.lastPracticedAt,
    };
  }
  return map;
}
