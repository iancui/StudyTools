import {
  findProgressByUserId,
  upsertProgress,
  ProgressInput,
  UserProgressRow,
} from "../repositories/progress.repository.js";

// 与 user_progress 表字段一一对应的对外 DTO.
// last_checkin_date 在 DB 是 DATE 类型,这里统一返回 ISO 短日期 "YYYY-MM-DD".
export interface ProgressDTO {
  userId: number;
  inkDrops: number;
  streakDays: number;
  lastCheckinDate: string | null;
  previewCount: number;
  masteredCharacterCount: number;
  masteredWordCount: number;
  completedSentenceCount: number;
  updatedAt: string;
}

function formatMySQLDate(
  date: Date | null
): string | null {
  if (!date) return null;
  // mysql2 默认把 DATE 列读成 Date 对象, 构造方式是本地时区
  // new Date(year, month-1, day). 直接 toISOString 会得到 UTC 时间,
  // 在东八区会比本地早一天, 表现为 "2026-10-05" -> "2026-10-04".
  // 因此必须使用本地时间方法 (getFullYear/getMonth/getDate) 还原.
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(
    2,
    "0"
  );
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toDTO(row: UserProgressRow): ProgressDTO {
  return {
    userId: row.user_id,
    inkDrops: row.ink_drops,
    streakDays: row.streak_days,
    lastCheckinDate: formatMySQLDate(
      row.last_checkin_date
    ),
    previewCount: row.preview_count,
    masteredCharacterCount:
      row.mastered_character_count,
    masteredWordCount: row.mastered_word_count,
    completedSentenceCount:
      row.completed_sentence_count,
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function toSafeInt(
  value: unknown,
  fallback = 0
): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    return fallback;
  }
  return Math.floor(n);
}

// 将客户端传入的字符串日期 ("YYYY-MM-DD") 转为 Date, 失败时返回 null.
// 服务器只接受纯日期, 不含时区/时间, 由 MySQL DATE 列存储.
function parseDate(
  value: unknown
): Date | null {
  if (!value) return null;
  if (typeof value !== "string") {
    return null;
  }
  // 仅接受 YYYY-MM-DD 或 YYYY/M/D 形式
  const parts = value.split(/[\/\-]/);
  if (parts.length !== 3) {
    return null;
  }
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (
    !Number.isFinite(y) ||
    !Number.isFinite(m) ||
    !Number.isFinite(d)
  ) {
    return null;
  }
  const date = new Date(
    Date.UTC(y, m - 1, d)
  );
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export async function getProgress(
  userId: number
): Promise<ProgressDTO | null> {
  const row =
    await findProgressByUserId(userId);
  if (!row) return null;
  return toDTO(row);
}

export async function updateProgress(
  userId: number,
  raw: Record<string, unknown>
): Promise<ProgressDTO> {
  const input: ProgressInput = {
    inkDrops: toSafeInt(raw.inkDrops),
    streakDays: toSafeInt(raw.streakDays),
    lastCheckinDate: parseDate(
      raw.lastCheckinDate
    ),
    previewCount: toSafeInt(
      raw.previewCount
    ),
    masteredCharacterCount: toSafeInt(
      raw.masteredCharacterCount
    ),
    masteredWordCount: toSafeInt(
      raw.masteredWordCount
    ),
    completedSentenceCount: toSafeInt(
      raw.completedSentenceCount
    ),
  };

  await upsertProgress(userId, input);

  const row =
    await findProgressByUserId(userId);
  if (!row) {
    throw new Error(
      "进度更新后查询失败"
    );
  }
  return toDTO(row);
}
