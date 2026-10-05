// user_character_progress 表字段 (schema.sql 为准):
//   id, user_id, character_id (varchar 100),
//   is_mastered (tinyint), practice_count, correct_count, wrong_count,
//   first_learned_at, last_practiced_at, mastered_at,
//   created_at, updated_at
//
// 客户端只维护 masteredCharacterIds 数组,因此 PUT 接口只同步
// is_mastered / mastered_at / first_learned_at / last_practiced_at.
// practice_count / correct_count / wrong_count 由服务器端保留原值.

import {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../config/database.js";

export interface CharacterProgressRow
  extends RowDataPacket {
  id: number;
  user_id: number;
  character_id: string;
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

export async function findCharacterProgressByUserId(
  userId: number
): Promise<CharacterProgressRow[]> {
  const [rows] =
    await pool.query<CharacterProgressRow[]>(
      `
      SELECT
        id,
        user_id,
        character_id,
        is_mastered,
        practice_count,
        correct_count,
        wrong_count,
        first_learned_at,
        last_practiced_at,
        mastered_at,
        created_at,
        updated_at
      FROM user_character_progress
      WHERE user_id = ?
      ORDER BY id ASC
      `,
      [userId]
    );
  return rows;
}

/**
 * 用全量 masteredIds 快照覆盖当前用户的生字掌握状态.
 *
 * 事务:
 *   1. UPDATE 把所有行的 is_mastered 置 0, mastered_at 置 NULL
 *      (practice_count 等统计字段不动)
 *   2. 对 masteredIds 中每一项做 UPSERT:
 *      - 行已存在 -> is_mastered=1, mastered_at 保留旧值或 NOW()
 *      - 行不存在 -> INSERT is_mastered=1, first_learned_at=NOW(),
 *        last_practiced_at=NOW(), mastered_at=NOW()
 */
/**
 * 工单 15: 记录一次生字练习事件 (累加统计).
 *
 * 行为:
 *   - 行不存在: INSERT 一条新记录, practice_count=1,
 *     (correct|wrong)_count=1, first_learned_at=NOW(), last_practiced_at=NOW()
 *   - 行已存在: UPDATE practice_count + 1, 对应 correct/wrong + 1,
 *     last_practiced_at=NOW() (不动 first_learned_at / mastered_at / is_mastered)
 *
 * @param result "correct" 表示答对, "wrong" 表示答错
 */
export async function recordCharacterPractice(
  userId: number,
  characterId: string,
  result: "correct" | "wrong"
): Promise<CharacterProgressRow | null> {
  const conn = await pool.getConnection();
  try {
    // 先 UPSERT 累加统计, 再 SELECT 返回最新行.
    // 不动 is_mastered / mastered_at: 由 PUT /progress/characters 单独维护.
    await conn.execute<ResultSetHeader>(
      `
      INSERT INTO user_character_progress (
        user_id,
        character_id,
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
        characterId,
        result === "correct" ? 1 : 0,
        result === "wrong" ? 1 : 0,
        result === "correct" ? 1 : 0,
        result === "wrong" ? 1 : 0,
      ]
    );

    const [rows] = await conn.query<CharacterProgressRow[]>(
      `
      SELECT
        id,
        user_id,
        character_id,
        is_mastered,
        practice_count,
        correct_count,
        wrong_count,
        first_learned_at,
        last_practiced_at,
        mastered_at,
        created_at,
        updated_at
      FROM user_character_progress
      WHERE user_id = ? AND character_id = ?
      LIMIT 1
      `,
      [userId, characterId]
    );
    return rows[0] ?? null;
  } finally {
    conn.release();
  }
}

export async function replaceCharacterMasteredSnapshot(
  userId: number,
  masteredIds: string[]
): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (masteredIds.length === 0) {
      // 没有掌握的生字,只需把所有行置为未掌握
      await conn.execute<ResultSetHeader>(
        `
        UPDATE user_character_progress
        SET is_mastered = 0, mastered_at = NULL
        WHERE user_id = ?
        `,
        [userId]
      );
      await conn.commit();
      return;
    }

    // 1. 全部置为未掌握
    await conn.execute<ResultSetHeader>(
      `
      UPDATE user_character_progress
      SET is_mastered = 0, mastered_at = NULL
      WHERE user_id = ?
      `,
      [userId]
    );

    // 2. UPSERT 掌握的生字
    const values = masteredIds
      .map(() => "(?, ?, 1, NOW(), NOW(), NOW())")
      .join(", ");
    const params: (number | string)[] = [];
    for (const id of masteredIds) {
      params.push(userId, id);
    }

    await conn.execute<ResultSetHeader>(
      `
      INSERT INTO user_character_progress (
        user_id,
        character_id,
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
