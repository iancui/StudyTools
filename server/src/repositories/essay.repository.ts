// essay_practices 表字段 (schema.sql 为准):
//   id (PK), user_id, title, prompt, content,
//   word_count, score, feedback, ai_score (json),
//   status, created_at, updated_at
//
// 工单 12: 句子仿写闭环 - 复用 essay_practices 表存储句子仿写记录.
// user_id 强制从 JWT 取, 不允许客户端指定 user_id.
// 全部字段使用参数化 SQL, 防止 SQL 注入.

import {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../config/database.js";

export interface EssayPracticeRow
  extends RowDataPacket {
  id: number;
  user_id: number;
  title: string | null;
  prompt: string | null;
  content: string;
  word_count: number;
  score: number | null;
  feedback: string | null;
  ai_score: unknown;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface InsertEssayPracticeInput {
  userId: number;
  title: string | null;
  prompt: string | null;
  content: string;
  wordCount: number;
  score: number;
  feedback: string;
  status: string;
}

/**
 * 插入一条 essay_practices 行, user_id 强制由调用方传入 (来自 JWT).
 * 全部字段使用参数化 SQL, 防止 SQL 注入.
 */
export async function insertEssayPractice(
  input: InsertEssayPracticeInput
): Promise<number> {
  const [result] =
    await pool.execute<ResultSetHeader>(
      `
      INSERT INTO essay_practices (
        user_id,
        title,
        prompt,
        content,
        word_count,
        score,
        feedback,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.userId,
        input.title,
        input.prompt,
        input.content,
        input.wordCount,
        input.score,
        input.feedback,
        input.status,
      ]
    );

  return result.insertId;
}

/**
 * 查询某个用户的最近 N 条仿写记录.
 * WHERE user_id = ? 保证用户隔离, 用户只能看到自己的记录.
 */
export async function findRecentByUser(
  userId: number,
  limit = 20
): Promise<EssayPracticeRow[]> {
  const [rows] =
    await pool.execute<EssayPracticeRow[]>(
      `
      SELECT id, user_id, title, prompt, content,
             word_count, score, feedback, status,
             created_at, updated_at
      FROM essay_practices
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
      `,
      [userId, limit]
    );

  return rows;
}

/**
 * 查询某条记录详情, 同时校验 user_id 归属,
 * 防止用户读取他人的仿写记录.
 */
export async function findByIdAndUser(
  id: number,
  userId: number
): Promise<EssayPracticeRow | null> {
  const [rows] =
    await pool.execute<EssayPracticeRow[]>(
      `
      SELECT id, user_id, title, prompt, content,
             word_count, score, feedback, status,
             created_at, updated_at
      FROM essay_practices
      WHERE id = ? AND user_id = ?
      LIMIT 1
      `,
      [id, userId]
    );

  return rows.length > 0 ? rows[0] : null;
}
