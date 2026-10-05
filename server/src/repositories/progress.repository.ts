import {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../config/database.js";

// user_progress 表实际字段 (以 schema.sql 为准):
//   user_id, ink_drops, streak_days, last_checkin_date (date),
//   preview_count, mastered_character_count, mastered_word_count,
//   completed_sentence_count, created_at, updated_at
//
// 不在此表中存在的字段不进行映射 (例如 selectedGrade / 详细数组 / 错题本 /
// 作文 / 测验记录), 仍由前端 localStorage 维护.

export interface UserProgressRow
  extends RowDataPacket {
  user_id: number;
  ink_drops: number;
  streak_days: number;
  last_checkin_date: Date | null;
  preview_count: number;
  mastered_character_count: number;
  mastered_word_count: number;
  completed_sentence_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProgressInput {
  inkDrops: number;
  streakDays: number;
  lastCheckinDate: Date | null;
  previewCount: number;
  masteredCharacterCount: number;
  masteredWordCount: number;
  completedSentenceCount: number;
}

export async function findProgressByUserId(
  userId: number
): Promise<UserProgressRow | null> {
  const [rows] =
    await pool.query<UserProgressRow[]>(
      `
      SELECT
        user_id,
        ink_drops,
        streak_days,
        last_checkin_date,
        preview_count,
        mastered_character_count,
        mastered_word_count,
        completed_sentence_count,
        created_at,
        updated_at
      FROM user_progress
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId]
    );

  return rows.length > 0
    ? rows[0]
    : null;
}

export async function upsertProgress(
  userId: number,
  input: ProgressInput
): Promise<void> {
  // INSERT ... ON DUPLICATE KEY UPDATE: 新用户 (register 时已建空行) 走 UPDATE;
  // 万一行不存在 (历史数据) 则 INSERT.
  await pool.execute<ResultSetHeader>(
    `
    INSERT INTO user_progress (
      user_id,
      ink_drops,
      streak_days,
      last_checkin_date,
      preview_count,
      mastered_character_count,
      mastered_word_count,
      completed_sentence_count
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      ink_drops = VALUES(ink_drops),
      streak_days = VALUES(streak_days),
      last_checkin_date = VALUES(last_checkin_date),
      preview_count = VALUES(preview_count),
      mastered_character_count = VALUES(mastered_character_count),
      mastered_word_count = VALUES(mastered_word_count),
      completed_sentence_count = VALUES(completed_sentence_count)
    `,
    [
      userId,
      input.inkDrops,
      input.streakDays,
      input.lastCheckinDate,
      input.previewCount,
      input.masteredCharacterCount,
      input.masteredWordCount,
      input.completedSentenceCount,
    ]
  );
}
