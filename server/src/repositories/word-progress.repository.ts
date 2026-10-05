// user_word_progress 表字段 (schema.sql 为准):
//   id, user_id, word_id (varchar 100),
//   is_mastered (tinyint), practice_count, correct_count, wrong_count,
//   first_learned_at, last_practiced_at, mastered_at,
//   created_at, updated_at

import {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../config/database.js";

export interface WordProgressRow
  extends RowDataPacket {
  id: number;
  user_id: number;
  word_id: string;
  is_mastered: number;
  practice_count: number;
  correct_count: number;
  wrong_count: number;
  first_learned_at: Date | null;
  last_practiced_at: Date | null;
  mastered_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export async function findWordProgressByUserId(
  userId: number
): Promise<WordProgressRow[]> {
  const [rows] = await pool.query<WordProgressRow[]>(
    `
    SELECT
      id,
      user_id,
      word_id,
      is_mastered,
      practice_count,
      correct_count,
      wrong_count,
      first_learned_at,
      last_practiced_at,
      mastered_at,
      created_at,
      updated_at
    FROM user_word_progress
    WHERE user_id = ?
    ORDER BY id ASC
    `,
    [userId]
  );
  return rows;
}

/**
 * 工单 15: 记录一次词语练习事件 (累加统计).
 *
 * 行为与 character 表一致: 行不存在 INSERT practice_count=1,
 * 行存在 UPDATE practice_count + 1, correct/wrong + 1, last_practiced_at=NOW().
 * 不动 is_mastered / mastered_at.
 */
export async function recordWordPractice(
  userId: number,
  wordId: string,
  result: "correct" | "wrong"
): Promise<WordProgressRow | null> {
  const conn = await pool.getConnection();
  try {
    await conn.execute<ResultSetHeader>(
      `
      INSERT INTO user_word_progress (
        user_id,
        word_id,
        is_mastered,
        practice_count,
        correct_count,
        wrong_count,
        first_learned_at,
        last_practiced_at,
        mastered_at
      )
      VALUES (?, ?, 0, 1, ?, ?, NOW(), NOW(), NULL)
      ON DUPLICATE KEY UPDATE
        practice_count = practice_count + 1,
        correct_count = correct_count + ?,
        wrong_count = wrong_count + ?,
        last_practiced_at = NOW()
      `,
      [
        userId,
        wordId,
        result === "correct" ? 1 : 0,
        result === "wrong" ? 1 : 0,
        result === "correct" ? 1 : 0,
        result === "wrong" ? 1 : 0,
      ]
    );

    const [rows] = await conn.query<WordProgressRow[]>(
      `
      SELECT
        id,
        user_id,
        word_id,
        is_mastered,
        practice_count,
        correct_count,
        wrong_count,
        first_learned_at,
        last_practiced_at,
        mastered_at,
        created_at,
        updated_at
      FROM user_word_progress
      WHERE user_id = ? AND word_id = ?
      LIMIT 1
      `,
      [userId, wordId]
    );
    return rows[0] ?? null;
  } finally {
    conn.release();
  }
}

export async function replaceWordMasteredSnapshot(
  userId: number,
  masteredIds: string[]
): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (masteredIds.length === 0) {
      await conn.execute<ResultSetHeader>(
        `
        UPDATE user_word_progress
        SET is_mastered = 0, mastered_at = NULL
        WHERE user_id = ?
        `,
        [userId]
      );
      await conn.commit();
      return;
    }

    await conn.execute<ResultSetHeader>(
      `
      UPDATE user_word_progress
      SET is_mastered = 0, mastered_at = NULL
      WHERE user_id = ?
      `,
      [userId]
    );

    const values = masteredIds
      .map(() => "(?, ?, 1, NOW(), NOW(), NOW())")
      .join(", ");
    const params: (number | string)[] = [];
    for (const id of masteredIds) {
      params.push(userId, id);
    }

    await conn.execute<ResultSetHeader>(
      `
      INSERT INTO user_word_progress (
        user_id,
        word_id,
        is_mastered,
        first_learned_at,
        last_practiced_at,
        mastered_at
      )
      VALUES ${values}
      ON DUPLICATE KEY UPDATE
        is_mastered = 1,
        mastered_at = COALESCE(mastered_at, VALUES(mastered_at)),
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
