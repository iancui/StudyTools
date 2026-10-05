// 墨韵中文 前端 英语辞书 API Client
// ============================================================
// 工单: 英语学习 V1 - 辞书基础
//
// 对应后端 4 个接口 (全部 requireAuth, user_id 由 JWT 提取):
//   GET    /api/english/dictionaries
//   GET    /api/english/dictionaries/:id
//   GET    /api/english/dictionaries/:id/words
//   POST   /api/english/dictionaries/import
//
// 辞书是用户私有数据, 后端按 JWT user_id 过滤,
// 前端不需要也不允许传 userId.

import { apiGet, apiPost } from "./client";

// ------------------------------------------------------------
// DTO (与后端 english-dictionary.service.ts 一致)
// ------------------------------------------------------------

export interface EnglishDictionaryDTO {
  id: number;
  name: string;
  description: string | null;
  wordCount: number;
  createdAt: string;
}

export interface EnglishWordDTO {
  id: number;
  word: string;
  meaning: string;
  phonetic: string | null;
  pos: string | null;
  phonics: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface ImportDictionaryResult {
  dictionaryId: number;
  dictionaryName: string;
  importedCount: number;
  skippedCount: number;
}

// ------------------------------------------------------------
// API 方法
// ------------------------------------------------------------

/** GET /api/english/dictionaries */
export function listEnglishDictionaries(
  accessToken: string
): Promise<EnglishDictionaryDTO[]> {
  return apiGet<EnglishDictionaryDTO[]>(
    "/english/dictionaries",
    { accessToken }
  );
}

/** GET /api/english/dictionaries/:id */
export function getEnglishDictionary(
  accessToken: string,
  id: number
): Promise<EnglishDictionaryDTO | null> {
  return apiGet<EnglishDictionaryDTO | null>(
    `/english/dictionaries/${encodeURIComponent(id)}`,
    { accessToken }
  );
}

/** GET /api/english/dictionaries/:id/words */
export function listEnglishWords(
  accessToken: string,
  dictionaryId: number
): Promise<EnglishWordDTO[]> {
  return apiGet<EnglishWordDTO[]>(
    `/english/dictionaries/${encodeURIComponent(
      dictionaryId
    )}/words`,
    { accessToken }
  );
}

export interface ImportDictionaryInput {
  name: string;
  description?: string | null;
  csvText: string;
}

/** POST /api/english/dictionaries/import */
export function importEnglishDictionary(
  accessToken: string,
  input: ImportDictionaryInput
): Promise<ImportDictionaryResult> {
  return apiPost<ImportDictionaryResult>(
    "/english/dictionaries/import",
    input,
    { accessToken }
  );
}
