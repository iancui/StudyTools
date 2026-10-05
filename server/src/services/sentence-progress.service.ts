import {
  SentenceProgressRow,
  findSentenceProgressByUserId,
  recordSentencePractice,
  replaceSentenceCompletedSnapshot,
} from "../repositories/sentence-progress.repository.js";

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

function toDTO(
  row: SentenceProgressRow
): SentenceProgressDTO {
  return {
    sentenceId: row.sentence_id,
    isCompleted: !!row.is_completed,
    practiceCount: row.practice_count,
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    firstLearnedAt: row.first_learned_at
      ? new Date(row.first_learned_at).toISOString()
      : null,
    lastPracticedAt: row.last_practiced_at
      ? new Date(row.last_practiced_at).toISOString()
      : null,
    completedAt: row.completed_at
      ? new Date(row.completed_at).toISOString()
      : null,
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function getSentenceProgress(
  userId: number
): Promise<SentenceProgressDTO[]> {
  const rows =
    await findSentenceProgressByUserId(userId);
  return rows.map(toDTO);
}

/**
 * 工单 15: 记录一次句子练习事件.
 * 行为与 character/word 一致, 但不动 is_completed / completed_at.
 */
export async function recordSentencePracticeEvent(
  userId: number,
  raw: Record<string, unknown>
): Promise<SentenceProgressDTO> {
  const itemId = raw.itemId;
  const result = raw.result;

  if (typeof itemId !== "string" || !itemId.trim()) {
    throw new Error("缺少 itemId");
  }
  if (result !== "correct" && result !== "wrong") {
    throw new Error("result 必须是 correct 或 wrong");
  }

  const row = await recordSentencePractice(
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
  sentenceId?: unknown;
  isCompleted?: unknown;
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
      "sentenceId" in item
    ) {
      const v = (item as RawItem).sentenceId;
      if (typeof v === "string") out.push(v);
    }
  }
  return Array.from(new Set(out));
}

/**
 * updateSentenceProgress 接受两种 body:
 *   1. { completedIds: string[] }
 *   2. { items: [{ sentenceId, isCompleted }] }
 */
export async function updateSentenceProgress(
  userId: number,
  raw: Record<string, unknown>
): Promise<SentenceProgressDTO[]> {
  let completedIds: string[] = [];

  if (Array.isArray(raw.completedIds)) {
    completedIds = toStringArray(raw.completedIds);
  } else if (Array.isArray(raw.items)) {
    completedIds = raw.items
      .filter(
        (it): it is { sentenceId: string; isCompleted: true } =>
          !!it &&
          typeof it === "object" &&
          "sentenceId" in it &&
          typeof (it as RawItem).sentenceId === "string" &&
          !!(it as RawItem).isCompleted
      )
      .map((it) => it.sentenceId);
  }

  await replaceSentenceCompletedSnapshot(
    userId,
    completedIds
  );

  const rows =
    await findSentenceProgressByUserId(userId);
  return rows.map(toDTO);
}
