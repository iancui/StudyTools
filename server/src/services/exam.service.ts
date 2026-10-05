// 教材考试记录 service
// ------------------------------------------------------------
// 校验客户端提交的考试结果, 写入 exam_records 表.
// user_id 来自上层 controller (从 JWT 提取), 此层不再重新读取 JWT.

import {
  InsertExamRecordInput,
  insertExamRecord,
} from "../repositories/exam.repository.js";

// 客户端提交的单题答案 (前端 ExamQuestion.id + 用户选择 + 正确性)
export interface ExamAnswerPayload {
  questionId: string;
  userAnswer: string | number | null;
  isCorrect: boolean;
}

// 客户端提交的考试结果 payload
export interface SaveExamRecordInput {
  examId?: string | null;
  examName?: string | null;
  grade?: string | null;
  totalQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  score: number;
  durationSeconds: number;
  answers?: ExamAnswerPayload[] | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

// 写库返回 DTO
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

function toInt(
  v: unknown,
  fallback = 0
): number {
  if (typeof v === "number" && Number.isFinite(v)) {
    return Math.max(0, Math.floor(v));
  }
  if (typeof v === "string" && /^\d+$/.test(v)) {
    const n = parseInt(v, 10);
    if (Number.isFinite(n)) return Math.max(0, n);
  }
  return fallback;
}

function toIsoDate(
  v: unknown
): Date | null {
  if (typeof v !== "string" || v.length === 0) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function toStringOrNull(
  v: unknown,
  max = 200
): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (trimmed.length === 0) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

/**
 * saveExamRecord 把客户端提交的考试结果写入 exam_records 表.
 *
 * 严格校验:
 *   - totalQuestions > 0
 *   - correctQuestions + wrongQuestions === totalQuestions (前端每题必判, 无未答题概念)
 *   - score 由后端按 correctQuestions / totalQuestions 重新计算 (Math.round), 忽略客户端提交的 score
 *   - durationSeconds >= 0
 *   - answers 数组中每个元素必须有 questionId (字符串) 和 isCorrect (布尔)
 *
 * 不允许客户端指定 userId (上层 controller 直接传 JWT user.id).
 */
export async function saveExamRecord(
  userId: number,
  raw: SaveExamRecordInput
): Promise<SavedExamRecordDTO> {
  const totalQuestions = toInt(raw.totalQuestions, 0);
  const correctQuestions = toInt(raw.correctQuestions, 0);
  const wrongQuestions = toInt(raw.wrongQuestions, 0);

  if (totalQuestions === 0) {
    throw new Error("总题数必须大于 0");
  }
  if (correctQuestions + wrongQuestions !== totalQuestions) {
    throw new Error("答对 + 答错题数必须等于总题数");
  }
  if (correctQuestions > totalQuestions) {
    throw new Error("答对题数不能超过总题数");
  }

  // score 由后端按正确率重新计算, 防止客户端伪造分数 (前端 = Math.round(correct/total*100))
  const score = Math.round((correctQuestions / totalQuestions) * 100);
  const durationSeconds = toInt(raw.durationSeconds, 0);
  const examId = toStringOrNull(raw.examId, 100);
  const examName = toStringOrNull(raw.examName, 200);
  const grade = toStringOrNull(raw.grade, 50);

  // answers 必须是数组, 每项必须有 questionId + isCorrect
  let normalizedAnswers: ExamAnswerPayload[] | null = null;
  if (Array.isArray(raw.answers)) {
    normalizedAnswers = raw.answers
      .filter(
        (it): it is ExamAnswerPayload =>
          !!it &&
          typeof it === "object" &&
          typeof (it as ExamAnswerPayload).questionId ===
            "string" &&
          (it as ExamAnswerPayload).questionId.length > 0 &&
          typeof (it as ExamAnswerPayload).isCorrect ===
            "boolean"
      )
      .map((it) => ({
        questionId: it.questionId,
        userAnswer:
          typeof it.userAnswer === "string" ||
          typeof it.userAnswer === "number"
            ? it.userAnswer
            : null,
        isCorrect: !!it.isCorrect,
      }));
  }

  const input: InsertExamRecordInput = {
    userId,
    examId,
    examName,
    grade,
    totalQuestions,
    correctQuestions,
    wrongQuestions,
    score,
    durationSeconds,
    answers: normalizedAnswers,
    startedAt: toIsoDate(raw.startedAt),
    completedAt:
      toIsoDate(raw.completedAt) ||
      new Date(),
  };

  const id = await insertExamRecord(input);

  return {
    id,
    userId,
    examId,
    examName,
    grade,
    totalQuestions,
    correctQuestions,
    wrongQuestions,
    score,
    durationSeconds,
    startedAt: input.startedAt
      ? input.startedAt.toISOString()
      : null,
    completedAt: input.completedAt
      ? input.completedAt.toISOString()
      : null,
  };
}
