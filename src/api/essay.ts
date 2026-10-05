// 墨韵中文 前端 句子仿写 API Client
// ============================================================
//
// 对应后端 POST /api/essays/practices (工单 12).
// 提交句子仿写, 后端规则批改后写入 essay_practices 表.
// user_id 强制由后端从 JWT 提取, 客户端 payload 不允许包含 user_id.

import { apiPost } from "./client";

// 客户端提交的仿写 payload
export interface SaveEssayPracticePayload {
  title?: string | null; // 仿写题目标题 (如 "句子仿写")
  prompt?: string | null; // 原句 / 仿写要求
  content: string; // 用户输入的仿写内容
}

// 后端批改后返回 DTO
export interface SavedEssayPracticeDTO {
  id: number;
  userId: number;
  title: string | null;
  prompt: string | null;
  content: string;
  wordCount: number;
  score: number;
  feedback: string;
  status: string;
  createdAt: string;
}

/**
 * POST /api/essays/practices
 *
 * 提交一次句子仿写, 后端规则批改后返回评分 + 反馈.
 * accessToken 必传, 后端用 JWT 解析 user_id, 不接受客户端传入 user_id.
 */
export function saveEssayPractice(
  accessToken: string,
  payload: SaveEssayPracticePayload
): Promise<SavedEssayPracticeDTO> {
  return apiPost<SavedEssayPracticeDTO>(
    "/essays/practices",
    payload,
    { accessToken }
  );
}
