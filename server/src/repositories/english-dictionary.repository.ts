// english_dictionaries / english_words 表字段 (migrations/english_v1.sql):
//   english_dictionaries:
//     id, user_id, name, description, word_count, created_at
//
//   english_words:
//     id, dictionary_id, word, meaning, phonetic, pos, phonics,
//     sort_order, created_at
//
// 工单: 英语学习 V1 - 辞书基础
//
// 数据归属:
//   - english_dictionaries.user_id 强制非空, 来自 JWT,
//     不允许客户端指定 user_id.
//   - 所有查询带 user_id 过滤, 用户只能看到自己的辞书.
//   - english_words 通过 dictionary_id 关联, 删除辞书时
//     外键 ON DELETE CASCADE 自动级联删除单词.
//   - 同一辞书内 word 唯一 (UNIQUE KEY uk_dict_word).

import {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../config/database.js";

// ------------------------------------------------------------
// Row 类型
// ------------------------------------------------------------

export interface EnglishDictionaryRow
  extends RowDataPacket {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  word_count: number;
  created_at: Date;
}

export interface EnglishWordRow
  extends RowDataPacket {
  id: number;
  dictionary_id: number;
  word: string;
  meaning: string;
  phonetic: string | null;
  pos: string | null;
  phonics: string | null;
  sort_order: number;
  created_at: Date;
}

// ------------------------------------------------------------
// 辞书查询
// ------------------------------------------------------------

/** 列出当前用户全部辞书, 按 created_at 倒序 */
export async function findDictionariesByUser(
  userId: number
): Promise<EnglishDictionaryRow[]> {
  const [rows] = await pool.execute<EnglishDictionaryRow[]>(
    `
    SELECT id, user_id, name, description, word_count, created_at
    FROM english_dictionaries
    WHERE user_id = ?
    ORDER BY created_at DESC, id DESC
    `,
    [userId]
  );
  return rows;
}

/** 查询单个辞书详情, 同时校验 user_id 归属 */
export async function findDictionaryByIdAndUser(
  id: number,
  userId: number
): Promise<EnglishDictionaryRow | null> {
  const [rows] = await pool.execute<EnglishDictionaryRow[]>(
    `
    SELECT id, user_id, name, description, word_count, created_at
    FROM english_dictionaries
    WHERE id = ? AND user_id = ?
    LIMIT 1
    `,
    [id, userId]
  );
  return rows.length > 0 ? rows[0] : null;
}

// ------------------------------------------------------------
// 单词查询
// ------------------------------------------------------------

/** 列出某辞书下全部单词, 按 sort_order, id 升序 */
export async function findWordsByDictionary(
  dictionaryId: number
): Promise<EnglishWordRow[]> {
  const [rows] = await pool.execute<EnglishWordRow[]>(
    `
    SELECT id, dictionary_id, word, meaning, phonetic, pos, phonics,
           sort_order, created_at
    FROM english_words
    WHERE dictionary_id = ?
    ORDER BY sort_order ASC, id ASC
    `,
    [dictionaryId]
  );
  return rows;
}

// ------------------------------------------------------------
// 导入: 创建辞书 + 批量插入单词
// ------------------------------------------------------------

export interface ImportWordRow {
  word: string;
  meaning: string;
  phonetic: string | null;
  pos: string | null;
  phonics: string | null;
  sortOrder: number;
}

export interface CreateDictionaryInput {
  userId: number;
  name: string;
  description: string | null;
}

/**
 * 创建辞书 + 批量插入单词, 整体在事务内进行.
 *
 * 行为:
 *   1. INSERT english_dictionaries
 *   2. 调用方传入的 rows 已在 service 层做过 word 必填/去重,
 *      这里再用 INSERT IGNORE + UNIQUE KEY uk_dict_word 兜底,
 *      避免重复 word 产生重复记录.
 *   3. 实际入库行数 = INSERT IGNORE affected rows.
 *   4. UPDATE english_dictionaries.word_count = 实际入库行数.
 *
 * 返回: { dictionaryId, importedCount }
 */
export async function createDictionaryWithWords(
  input: CreateDictionaryInput,
  rows: ImportWordRow[]
): Promise<{ dictionaryId: number; importedCount: number }> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [dictResult] = await conn.execute<ResultSetHeader>(
      `
      INSERT INTO english_dictionaries (user_id, name, description, word_count)
      VALUES (?, ?, ?, 0)
      `,
      [input.userId, input.name, input.description]
    );

    const dictionaryId = dictResult.insertId;

    let importedCount = 0;
    if (rows.length > 0) {
      // 批量 INSERT IGNORE, 命中 UNIQUE KEY uk_dict_word 时跳过.
      // mysql2 execute 不支持多值 + 占位符数组, 这里手拼 VALUES.
      const placeholders: string[] = [];
      const params: (number | string | null)[] = [];
      for (const r of rows) {
        placeholders.push("(?, ?, ?, ?, ?, ?, ?)");
        params.push(
          dictionaryId,
          r.word,
          r.meaning,
          r.phonetic,
          r.pos,
          r.phonics,
          r.sortOrder
        );
      }

      // 使用 query (而不是 execute) 以支持多值 + 大量参数.
      // 已校验过所有字段为 string | null, 不存在 SQL 注入.
      const [wordResult] = await conn.query<ResultSetHeader>(
        `
        INSERT IGNORE INTO english_words
          (dictionary_id, word, meaning, phonetic, pos, phonics, sort_order)
        VALUES ${placeholders.join(", ")}
        `,
        params
      );
      importedCount = wordResult.affectedRows;
    }

    // 同步 word_count 为实际入库行数 (而非请求行数).
    await conn.execute<ResultSetHeader>(
      `
      UPDATE english_dictionaries
      SET word_count = ?
      WHERE id = ?
      `,
      [importedCount, dictionaryId]
    );

    await conn.commit();
    return { dictionaryId, importedCount };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
