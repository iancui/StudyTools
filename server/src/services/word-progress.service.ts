import {
  WordProgressRow,
  findWordProgressByUserId,
  recordWordPractice,
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

/**
 * 工单 15: 记录一次词语练习事件.
 * 行为与 recordCharacterPracticeEvent 一致.
 */
export async function recordWordPracticeEvent(
  userId: number,
  raw: Record<string, unknown>
): Promise<WordProgressDTO> {
  const itemId = raw.itemId;
  const result = raw.result;

  if (typeof itemId !== "string" || !itemId.trim()) {
    throw new Error("缺少 itemId");
  }
  if (result !== "correct" && result !== "wrong") {
    throw new Error("result 必须是 correct 或 wrong");
  }

  const row = await recordWordPractice(
    userId,
    itemId,
    result
  );
  if (!row) {
    throw new Error("记录练习事件失败");
  }
  return toDTO(row);
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
