// 墨韵中文 前端 学习进度同步 API Client
// ============================================================
//
// 仅封装后端 user_progress 表的两个接口:
//   GET /api/progress  -> 返回当前登录用户的进度摘要 (可能为 null)
//   PUT /api/progress  -> 用本地进度摘要 upsert 服务器行
//
// 字段严格按 user_progress 实际列做映射:
//   inkDrops / streakDays / lastCheckinDate (YYYY-MM-DD) /
//   previewCount / masteredCharacterCount / masteredWordCount /
//   completedSentenceCount
//
// 不在此表中的前端字段 (selectedGrade / 详细数组 / 错题本 / 作文 / 测验 /
// 徽章) 不上传到 server, 仍由 localStorage 维护.

import { apiGet, apiPut } from "./client";

export interface ProgressDTO {
  userId: number;
  inkDrops: number;
  streakDays: number;
  /** ISO 短日期 "YYYY-MM-DD", 未签到时为 null */
  lastCheckinDate: string | null;
  previewCount: number;
  masteredCharacterCount: number;
  masteredWordCount: number;
  completedSentenceCount: number;
  /** 服务器最近一次更新时间 (ISO) */
  updatedAt: string;
}

export interface UpdateProgressBody {
  inkDrops: number;
  streakDays: number;
  /** 必须为 "YYYY-MM-DD", 未签到时传 null */
  lastCheckinDate: string | null;
  previewCount: number;
  masteredCharacterCount: number;
  masteredWordCount: number;
  completedSentenceCount: number;
}

/**
 * 拉取当前登录用户的学习进度摘要
 * GET /api/progress
 * 未登录 / token 失效时由调用方处理 (AuthContext 会自动 refresh)
 */
export function getProgress(
  accessToken: string
): Promise<ProgressDTO | null> {
  return apiGet<ProgressDTO | null>("/progress", {
    accessToken,
  });
}

/**
 * 同步本地学习进度摘要到服务器
 * PUT /api/progress
 */
export function updateProgress(
  accessToken: string,
  body: UpdateProgressBody
): Promise<ProgressDTO> {
  return apiPut<ProgressDTO>("/progress", body, {
    accessToken,
  });
}
