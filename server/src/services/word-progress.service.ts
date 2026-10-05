import {
  WordProgressRow,
  findWordProgressByUserId,
  replaceWordMasteredSnapshot,
} from "../repositories/word-progress.repository.js";

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

function toDTO(
  row: WordProgressRow
): WordProgressDTO {
  return {
    wordId: row.word_id,
    isMastered: !!row.is_mastered,
    practiceCount: row.practice_count,
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    firstLearnedAt: row.first_learned_at
      ? new Date(row.first_learned_at).toISOString()
      : null,
    lastPracticedAt: row.last_practiced_at
      ? new Date(row.last_practiced_at).toISOString()
      : null,
    masteredAt: row.mastered_at
      ? new Date(row.mastered_at).toISOString()
      : null,
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function getWordProgress(
  userId: number
): Promise<WordProgressDTO[]> {
  const rows =
    await findWordProgressByUserId(userId);
  return rows.map(toDTO);
}

interface RawItem {
  wordId?: unknown;
  isMastered?: unknown;
}

function toStringArray(
  raw: unknown
): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      out.push(item);
    } else if (
      item &&
      typeof item === "object" &&
      "wordId" in item
    ) {
      const v = (item as RawItem).wordId;
      if (typeof v === "string") out.push(v);
    }
  }
  return Array.from(new Set(out));
}

export async function updateWordProgress(
  userId: number,
  raw: Record<string, unknown>
): Promise<WordProgressDTO[]> {
  let masteredIds: string[] = [];

  if (Array.isArray(raw.masteredIds)) {
    masteredIds = toStringArray(raw.masteredIds);
  } else if (Array.isArray(raw.items)) {
    masteredIds = raw.items
      .filter(
        (it): it is { wordId: string; isMastered: true } =>
          !!it &&
          typeof it === "object" &&
          "wordId" in it &&
          typeof (it as RawItem).wordId === "string" &&
          !!(it as RawItem).isMastered
      )
      .map((it) => it.wordId);
  }

  await replaceWordMasteredSnapshot(
    userId,
    masteredIds
  );

  const rows =
    await findWordProgressByUserId(userId);
  return rows.map(toDTO);
}
