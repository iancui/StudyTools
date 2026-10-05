// 墨韵中文 前端 考试记录 API Client
// ============================================================
//
// 对应后端 POST /api/exams/records (工单 11).
// 写入 exam_records 表, user_id 强制由后端从 JWT 提取,
// 客户端 payload 不允许包含 user_id.
//
// 设计原则:
//   - 仅 fetch, 无第三方依赖
//   - 复用 src/api/client.ts 的 apiPost + ApiEnvelope 解析
//   - answers 字段由前端构建, 只含 questionId/userAnswer/isCorrect,
//     不暴露 correctAnswer 给后端

import { apiPost } from "./client";

// 客户端提交的单题答案
export interface ExamAnswerPayload {
  questionId: string;
  userAnswer: string | number | null;
  isCorrect: boolean;
}

// 客户端提交的考试结果 payload
export interface SaveExamRecordPayload {
  examId: string;
  examName: string;
  grade: string;
  totalQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  score: number;
  durationSeconds: number;
  answers: ExamAnswerPayload[];
  startedAt: string;
  completedAt: string;
}

// 后端写库返回 DTO
export interface SavedExamRecordDTO {
  id: number;
  userId: number;
  examId: string | null;
  examName: string | null;
  grade: string | null;
  totalQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  score: number;
  durationSeconds: number;
  startedAt: string | null;
  completedAt: string | null;
}

/**
 * POST /api/exams/records
 *
 * 保存一次考试结果到 exam_records 表.
 * accessToken 必传, 后端用 JWT 解析 user_id, 不接受客户端传入 user_id.
 */
export function saveExamRecord(
  accessToken: string,
  payload: SaveExamRecordPayload
): Promise<SavedExamRecordDTO> {
  return apiPost<SavedExamRecordDTO>(
    "/exams/records",
    payload,
    { accessToken }
  );
}
