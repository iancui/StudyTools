import {
  CharacterProgressRow,
  findCharacterProgressByUserId,
  recordCharacterPractice,
  replaceCharacterMasteredSnapshot,
} from "../repositories/character-progress.repository.js";

// 对外 DTO. 字段名转 camelCase, 时间统一 ISO.
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

function toDTO(
  row: CharacterProgressRow
): CharacterProgressDTO {
  return {
    characterId: row.character_id,
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

export async function getCharacterProgress(
  userId: number
): Promise<CharacterProgressDTO[]> {
  const rows =
    await findCharacterProgressByUserId(userId);
  return rows.map(toDTO);
}

/**
 * 工单 15: 记录一次生字练习事件.
 *
 * 客户端只发送 { itemId, result }, 服务器自己累加
 * practice_count / correct_count / wrong_count, 不信任客户端
 * 提交的累计值. user_id 强制取自 JWT, 忽略 body.userId.
 */
export async function recordCharacterPracticeEvent(
  userId: number,
  raw: Record<string, unknown>
): Promise<CharacterProgressDTO> {
  const itemId = raw.itemId;
  const result = raw.result;

  if (typeof itemId !== "string" || !itemId.trim()) {
    throw new Error("缺少 itemId");
  }
  if (result !== "correct" && result !== "wrong") {
    throw new Error("result 必须是 correct 或 wrong");
  }

  const row = await recordCharacterPractice(
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
  characterId?: unknown;
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
      "characterId" in item
    ) {
      const v = (item as RawItem).characterId;
      if (typeof v === "string") out.push(v);
    }
  }
  return Array.from(new Set(out));
}

/**
 * updateCharacterProgress 接受两种 body 形式:
 *   1. { masteredIds: string[] }        ← 客户端推荐用法
 *   2. { items: [{ characterId, isMastered }] }  ← 兼容详细形式
 *
 * 只把 isMastered=true 的 ID 收集起来, 调 repository 覆盖快照.
 */
export async function updateCharacterProgress(
  userId: number,
  raw: Record<string, unknown>
): Promise<CharacterProgressDTO[]> {
  let masteredIds: string[] = [];

  if (Array.isArray(raw.masteredIds)) {
    masteredIds = toStringArray(raw.masteredIds);
  } else if (Array.isArray(raw.items)) {
    masteredIds = raw.items
      .filter(
        (it): it is { characterId: string; isMastered: true } =>
          !!it &&
          typeof it === "object" &&
          "characterId" in it &&
          typeof (it as RawItem).characterId === "string" &&
          !!(it as RawItem).isMastered
      )
      .map((it) => it.characterId);
  }

  await replaceCharacterMasteredSnapshot(
    userId,
    masteredIds
  );

  const rows =
    await findCharacterProgressByUserId(userId);
  return rows.map(toDTO);
}
