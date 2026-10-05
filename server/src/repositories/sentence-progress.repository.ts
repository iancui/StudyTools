// user_sentence_progress 表字段 (schema.sql 为准):
//   id, user_id, sentence_id (varchar 100),
//   is_completed (tinyint), practice_count, correct_count, wrong_count,
//   first_learned_at, last_practiced_at, completed_at,
//   created_at, updated_at
//
// 注意: 句子表用 is_completed / completed_at, 与 character/word 表的
// is_mastered / mastered_at 不同.

import {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../config/database.js";

export interface SentenceProgressRow
  extends RowDataPacket {
  id: number;
  user_id: number;
  sentence_id: string;
  is_completed: number;
  practice_count: number;
  correct_count: number;
  wrong_count: number;
  first_learned_at: Date | null;
  last_practiced_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export async function findSentenceProgressByUserId(
  userId: number
): Promise<SentenceProgressRow[]> {
  const [rows] =
    await pool.query<SentenceProgressRow[]>(
      `
      SELECT
        id,
        user_id,
        sentence_id,
        is_completed,
        practice_count,
        correct_count,
        wrong_count,
        first_learned_at,
        last_practiced_at,
        completed_at,
        created_at,
        updated_at
      FROM user_sentence_progress
      WHERE user_id = ?
      ORDER BY id ASC
      `,
      [userId]
    );
  return rows;
}

export async function replaceSentenceCompletedSnapshot(
  userId: number,
  completedIds: string[]
): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (completedIds.length === 0) {
      await conn.execute<ResultSetHeader>(
        `
        UPDATE user_sentence_progress
        SET is_completed = 0, completed_at = NULL
        WHERE user_id = ?
        `,
        [userId]
      );
      await conn.commit();
      return;
    }

    await conn.execute<ResultSetHeader>(
      `
      UPDATE user_sentence_progress
      SET is_completed = 0, completed_at = NULL
      WHERE user_id = ?
      `,
      [userId]
    );

    const values = completedIds
      .map(() => "(?, ?, 1, NOW(), NOW(), NOW())")
      .join(", ");
    const params: (number | string)[] = [];
    for (const id of completedIds) {
      params.push(userId, id);
    }

    await conn.execute<ResultSetHeader>(
      `
      INSERT INTO user_sentence_progress (
        user_id,
        sentence_id,
        is_completed,
        first_learned_at,
        last_practiced_at,
        completed_at
      )
      VALUES ${values}
      ON DUPLICATE KEY UPDATE
        is_completed = 1,
        completed_at = COALESCE(completed_at, VALUES(completed_at)),
        first_learned_at = COALESCE(first_learned_at, VALUES(first_learned_at))
      `,
      params
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
