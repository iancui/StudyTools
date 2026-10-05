// 教材内容只读 Service
// ============================================================
//
// 仅做数据库行 → DTO 的字段名转换 (snake_case → camelCase)
// 和 Date → ISO 字符串. 不做任何写入操作.

import {
  findCharactersByLessonId,
  findLessonById,
  findLessonsByGradeAndTerm,
  findSentencesByLessonId,
  findWordsByLessonId,
  TextbookCharacterRow,
  TextbookLessonRow,
  TextbookSentenceRow,
  TextbookWordRow,
} from "../repositories/textbook.repository.js";

// ------------------------------------------------------------
// DTO
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
// 转换函数
// ------------------------------------------------------------

function toLessonDTO(
  row: TextbookLessonRow
): LessonDTO {
  return {
    id: row.id,
    grade: row.grade,
    term: row.term,
    unitNo: row.unit_no,
    lessonNo: row.lesson_no,
    title: row.title,
    lessonType: row.lesson_type,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function toCharacterDTO(
  row: TextbookCharacterRow
): CharacterDTO {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    characterText: row.character_text,
    pinyin: row.pinyin,
    charRole: row.char_role,
    sortOrder: row.sort_order,
  };
}

function toWordDTO(
  row: TextbookWordRow
): WordDTO {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    wordText: row.word_text,
    sortOrder: row.sort_order,
  };
}

function toSentenceDTO(
  row: TextbookSentenceRow
): SentenceDTO {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    sentenceText: row.sentence_text,
    sentenceType: row.sentence_type,
    sortOrder: row.sort_order,
  };
}

// ------------------------------------------------------------
// Service 方法
// ------------------------------------------------------------

export async function listLessons(
  grade?: string,
  term?: string
): Promise<LessonDTO[]> {
  const rows = await findLessonsByGradeAndTerm(
    grade,
    term
  );
  return rows.map(toLessonDTO);
}

export async function getLesson(
  lessonId: string
): Promise<LessonDTO | null> {
  const row = await findLessonById(lessonId);
  return row ? toLessonDTO(row) : null;
}

export async function listCharacters(
  lessonId: string
): Promise<CharacterDTO[]> {
  const rows =
    await findCharactersByLessonId(lessonId);
  return rows.map(toCharacterDTO);
}

export async function listWords(
  lessonId: string
): Promise<WordDTO[]> {
  const rows = await findWordsByLessonId(lessonId);
  return rows.map(toWordDTO);
}

export async function listSentences(
  lessonId: string
): Promise<SentenceDTO[]> {
  const rows =
    await findSentencesByLessonId(lessonId);
  return rows.map(toSentenceDTO);
}
