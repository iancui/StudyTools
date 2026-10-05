// exam_records 表字段 (schema.sql 为准):
//   id (PK), user_id, exam_id, exam_name, grade,
//   total_questions, correct_questions, wrong_questions, score,
//   duration_seconds, answers (json), started_at, completed_at,
//   created_at
//
// 客户端只发考试结果摘要, user_id 强制从 JWT 取,
// 不允许客户端指定 user_id.

import {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../config/database.js";

export interface ExamRecordRow
  extends RowDataPacket {
  id: number;
  user_id: number;
  exam_id: string | null;
  exam_name: string | null;
  grade: string | null;
  total_questions: number;
  correct_questions: number;
  wrong_questions: number;
  score: number;
  duration_seconds: number;
  answers: unknown;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
}

export interface InsertExamRecordInput {
  userId: number;
  examId: string | null;
  examName: string | null;
  grade: string | null;
  totalQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  score: number;
  durationSeconds: number;
  answers: unknown;
  startedAt: Date | null;
  completedAt: Date | null;
}

/**
 * 插入一条 exam_records 行, user_id 强制由调用方传入 (来自 JWT).
 * 全部字段使用参数化 SQL, 防止 SQL 注入.
 */
export async function insertExamRecord(
  input: InsertExamRecordInput
): Promise<number> {
  const [result] =
    await pool.execute<ResultSetHeader>(
      `
      INSERT INTO exam_records (
        user_id,
        exam_id,
        exam_name,
        grade,
        total_questions,
        correct_questions,
        wrong_questions,
        score,
        duration_seconds,
        answers,
        started_at,
        completed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.userId,
        input.examId,
        input.examName,
        input.grade,
        input.totalQuestions,
        input.correctQuestions,
        input.wrongQuestions,
        input.score,
        input.durationSeconds,
        input.answers !== null && input.answers !== undefined
          ? JSON.stringify(input.answers)
          : null,
        input.startedAt,
        input.completedAt,
      ]
    );

  return result.insertId;
}

/**
 * 查询某用户的最近 N 条 exam_records (按 created_at 降序).
 * 主要用于后期管理后台或后续对账, 当前工单不强制调用.
 */
export async function findExamRecordsByUserId(
  userId: number,
  limit = 50
): Promise<ExamRecordRow[]> {
  const [rows] = await pool.query<ExamRecordRow[]>(
    `
    SELECT
      id,
      user_id,
      exam_id,
      exam_name,
      grade,
      total_questions,
      correct_questions,
      wrong_questions,
      score,
      duration_seconds,
      answers,
      started_at,
      completed_at,
      created_at
    FROM exam_records
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
    `,
    [userId, limit]
  );
  return rows;
}
