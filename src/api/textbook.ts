// 墨韵中文 前端 教材内容 API Client
// ============================================================
//
// 对应 4 张教材表 (只读):
//   - textbook_lessons
//   - textbook_characters
//   - textbook_words
//   - textbook_sentences
//
// 全部 GET, 不需要 JWT (教材是公共内容).
// grade/term 直接使用数据库现有值 (例如 "三年级" / "上册"),
// 不做格式转换.

import { apiGet } from "./client";

// ------------------------------------------------------------
// DTO (与后端 textbook.service.ts 一致)
// ------------------------------------------------------------

export interface LessonDTO {
  id: string;
  grade: string;
  term: string;
  unitNo: number;
  lessonNo: number;
  title: string;
  lessonType: string;
  createdAt: string;
}

export interface CharacterDTO {
  id: number;
  lessonId: string;
  characterText: string;
  pinyin: string | null;
  charRole: string;
  sortOrder: number;
}

export interface WordDTO {
  id: number;
  lessonId: string;
  wordText: string;
  sortOrder: number;
}

export interface SentenceDTO {
  id: number;
  lessonId: string;
  sentenceText: string;
  sentenceType: string;
  sortOrder: number;
}

// ------------------------------------------------------------
// API 方法
// ------------------------------------------------------------

/**
 * GET /api/textbook/lessons?grade=...&term=...
 *
 * grade/term 任一不传则该条件不参与过滤.
 * 返回值按 unit_no, lesson_no 升序.
 */
export function listLessons(opts: {
  grade?: string;
  term?: string;
} = {}): Promise<LessonDTO[]> {
  const params = new URLSearchParams();
  if (opts.grade) params.set("grade", opts.grade);
  if (opts.term) params.set("term", opts.term);
  const qs = params.toString();
  const path = qs
    ? `/textbook/lessons?${qs}`
    : "/textbook/lessons";
  return apiGet<LessonDTO[]>(path);
}

/** GET /api/textbook/lessons/:lessonId */
export function getLesson(
  lessonId: string
): Promise<LessonDTO | null> {
  return apiGet<LessonDTO | null>(
    `/textbook/lessons/${encodeURIComponent(lessonId)}`
  );
}

/** GET /api/textbook/lessons/:lessonId/characters */
export function listCharacters(
  lessonId: string
): Promise<CharacterDTO[]> {
  return apiGet<CharacterDTO[]>(
    `/textbook/lessons/${encodeURIComponent(
      lessonId
    )}/characters`
  );
}

/** GET /api/textbook/lessons/:lessonId/words */
export function listWords(
  lessonId: string
): Promise<WordDTO[]> {
  return apiGet<WordDTO[]>(
    `/textbook/lessons/${encodeURIComponent(
      lessonId
    )}/words`
  );
}

/** GET /api/textbook/lessons/:lessonId/sentences */
export function listSentences(
  lessonId: string
): Promise<SentenceDTO[]> {
  return apiGet<SentenceDTO[]>(
    `/textbook/lessons/${encodeURIComponent(
      lessonId
    )}/sentences`
  );
}
