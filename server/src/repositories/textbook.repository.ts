// 教材内容只读 Repository
// ============================================================
//
// 实际数据库字段 (SHOW CREATE TABLE 为准):
//
//   textbook_lessons:
//     id (varchar 50, 主键), grade, term, unit_no, lesson_no,
//     title, lesson_type, created_at
//
//   textbook_characters:
//     id (bigint auto), lesson_id, character_text, pinyin,
//     char_role ('识字'/'写字'), sort_order
//
//   textbook_words:
//     id (bigint auto), lesson_id, word_text, sort_order
//
//   textbook_sentences:
//     id (bigint auto), lesson_id, sentence_text,
//     sentence_type ('重点句' 默认), sort_order
//
// 所有方法只 SELECT, 不修改教材表.
// 查询按 sort_order 排序; lessons 表无 sort_order, 按 unit_no, lesson_no.

import { RowDataPacket } from "mysql2";

import { pool } from "../config/database.js";

// ------------------------------------------------------------
// Row 类型
// ------------------------------------------------------------

export interface TextbookLessonRow
  extends RowDataPacket {
  id: string;
  grade: string;
  term: string;
  unit_no: number;
  lesson_no: number;
  title: string;
  lesson_type: string;
  created_at: Date;
}

export interface TextbookCharacterRow
  extends RowDataPacket {
  id: number;
  lesson_id: string;
  character_text: string;
  pinyin: string | null;
  char_role: string;
  sort_order: number;
}

export interface TextbookWordRow
  extends RowDataPacket {
  id: number;
  lesson_id: string;
  word_text: string;
  sort_order: number;
}

export interface TextbookSentenceRow
  extends RowDataPacket {
  id: number;
  lesson_id: string;
  sentence_text: string;
  sentence_type: string;
  sort_order: number;
}

// ------------------------------------------------------------
// 查询: lessons
// ------------------------------------------------------------

/**
 * 按 grade + term 查询课程列表.
 * grade/term 直接使用数据库现有值 (例如 "三年级" / "上册"),
 * 不做任何格式转换. 任一参数为空则该条件不参与过滤.
 *
 * 排序: unit_no ASC, lesson_no ASC.
 */
export async function findLessonsByGradeAndTerm(
  grade?: string,
  term?: string
): Promise<TextbookLessonRow[]> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (grade) {
    conditions.push("grade = ?");
    params.push(grade);
  }
  if (term) {
    conditions.push("term = ?");
    params.push(term);
  }

  const where =
    conditions.length > 0
      ? "WHERE " + conditions.join(" AND ")
      : "";

  const [rows] = await pool.query<TextbookLessonRow[]>(
    `
    SELECT
      id,
      grade,
      term,
      unit_no,
      lesson_no,
      title,
      lesson_type,
      created_at
    FROM textbook_lessons
    ${where}
    ORDER BY unit_no ASC, lesson_no ASC
    `,
    params
  );

  return rows;
}

export async function findLessonById(
  lessonId: string
): Promise<TextbookLessonRow | null> {
  const [rows] = await pool.query<TextbookLessonRow[]>(
    `
    SELECT
      id,
      grade,
      term,
      unit_no,
      lesson_no,
      title,
      lesson_type,
      created_at
    FROM textbook_lessons
    WHERE id = ?
    LIMIT 1
    `,
    [lessonId]
  );

  return rows.length > 0 ? rows[0] : null;
}

// ------------------------------------------------------------
// 查询: characters / words / sentences (按 lesson_id)
// ------------------------------------------------------------

export async function findCharactersByLessonId(
  lessonId: string
): Promise<TextbookCharacterRow[]> {
  const [rows] =
    await pool.query<TextbookCharacterRow[]>(
      `
      SELECT
        id,
        lesson_id,
        character_text,
        pinyin,
        char_role,
        sort_order
      FROM textbook_characters
      WHERE lesson_id = ?
      ORDER BY sort_order ASC, id ASC
      `,
      [lessonId]
    );
  return rows;
}

export async function findWordsByLessonId(
  lessonId: string
): Promise<TextbookWordRow[]> {
  const [rows] = await pool.query<TextbookWordRow[]>(
    `
    SELECT
      id,
      lesson_id,
      word_text,
      sort_order
    FROM textbook_words
    WHERE lesson_id = ?
    ORDER BY sort_order ASC, id ASC
    `,
    [lessonId]
  );
  return rows;
}

export async function findSentencesByLessonId(
  lessonId: string
): Promise<TextbookSentenceRow[]> {
  const [rows] =
    await pool.query<TextbookSentenceRow[]>(
      `
      SELECT
        id,
        lesson_id,
        sentence_text,
        sentence_type,
        sort_order
      FROM textbook_sentences
      WHERE lesson_id = ?
      ORDER BY sort_order ASC, id ASC
      `,
      [lessonId]
    );
  return rows;
}
