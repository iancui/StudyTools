// 墨韵中文 前端 详细学习记录 API Client
// ============================================================
//
// 对应三张表:
//   - user_character_progress (character_id / is_mastered)
//   - user_word_progress      (word_id      / is_mastered)
//   - user_sentence_progress  (sentence_id  / is_completed)
//
// 与 src/api/progress.ts (摘要) 互补:
//   - 摘要表只存 *_count, 不能恢复详细 ID 列表
//   - 这三张表存了具体哪些 ID 被掌握/完成, 登录后可用于恢复数组

import {
  apiGet,
  apiPut,
} from "./client";

// ------------------------------------------------------------
// DTO
// ------------------------------------------------------------

export interface CharacterProgressDTO {
  characterId: string;
  isMastered: boolean;
  practiceCount: number;
  correctCount: number;
  wrongCount: number;
  firstLearnedAt: string | null;
  lastPracticedAt: string | null;
  masteredAt: string | null;
  updatedAt: string;
}

export interface WordProgressDTO {
  wordId: string;
  isMastered: boolean;
  practiceCount: number;
  correctCount: number;
  wrongCount: number;
  firstLearnedAt: string | null;
  lastPracticedAt: string | null;
  masteredAt: string | null;
  updatedAt: string;
}

export interface SentenceProgressDTO {
  sentenceId: string;
  isCompleted: boolean;
  practiceCount: number;
  correctCount: number;
  wrongCount: number;
  firstLearnedAt: string | null;
  lastPracticedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
}

// ------------------------------------------------------------
// Character
// ------------------------------------------------------------

export function getCharacterProgress(
  accessToken: string
): Promise<CharacterProgressDTO[]> {
  return apiGet<CharacterProgressDTO[]>(
    "/progress/characters",
    { accessToken }
  );
}

export function updateCharacterProgress(
  accessToken: string,
  masteredIds: string[]
): Promise<CharacterProgressDTO[]> {
  return apiPut<CharacterProgressDTO[]>(
    "/progress/characters",
    { masteredIds },
    { accessToken }
  );
}

// ------------------------------------------------------------
// Word
// ------------------------------------------------------------

export function getWordProgress(
  accessToken: string
): Promise<WordProgressDTO[]> {
  return apiGet<WordProgressDTO[]>(
    "/progress/words",
    { accessToken }
  );
}

export function updateWordProgress(
  accessToken: string,
  masteredIds: string[]
): Promise<WordProgressDTO[]> {
  return apiPut<WordProgressDTO[]>(
    "/progress/words",
    { masteredIds },
    { accessToken }
  );
}

// ------------------------------------------------------------
// Sentence
// ------------------------------------------------------------

export function getSentenceProgress(
  accessToken: string
): Promise<SentenceProgressDTO[]> {
  return apiGet<SentenceProgressDTO[]>(
    "/progress/sentences",
    { accessToken }
  );
}

export function updateSentenceProgress(
  accessToken: string,
  completedIds: string[]
): Promise<SentenceProgressDTO[]> {
  return apiPut<SentenceProgressDTO[]>(
    "/progress/sentences",
    { completedIds },
    { accessToken }
  );
}
