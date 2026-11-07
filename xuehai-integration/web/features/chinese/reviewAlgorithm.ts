export interface ReviewStats {
  isMastered: boolean;
  practiceCount?: number;
  correctCount?: number;
  wrongCount?: number;
  lastPracticedAt?: string | number | Date | null;
}

export interface ReviewSchedule {
  due: boolean;
  nextReviewAt: number;
  intervalDays: number;
  overdueDays: number;
  priority: number;
  reason: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 基于练习正确率和最近练习时间计算复习间隔。
 * 未掌握内容立即进入复习；已掌握内容按 1/3/7/14/30 天渐进复习。
 */
export function getReviewSchedule(stats: ReviewStats, now = Date.now()): ReviewSchedule {
  const practiceCount = Math.max(0, Number(stats.practiceCount) || 0);
  const correctCount = Math.max(0, Number(stats.correctCount) || 0);
  const wrongCount = Math.max(0, Number(stats.wrongCount) || 0);
  const accuracy = practiceCount > 0 ? correctCount / practiceCount : 0;
  const last = stats.lastPracticedAt == null
    ? Number.NaN
    : typeof stats.lastPracticedAt === 'number'
      ? stats.lastPracticedAt
      : new Date(stats.lastPracticedAt).getTime();

  if (!stats.isMastered) {
    return {
      due: true,
      nextReviewAt: Number.isFinite(last) ? last : now,
      intervalDays: 0,
      overdueDays: 0,
      priority: 1000 + wrongCount * 20 + (practiceCount === 0 ? 50 : 0),
      reason: practiceCount === 0 ? '尚未练习' : '尚未掌握',
    };
  }

  if (!Number.isFinite(last)) {
    return { due: true, nextReviewAt: now, intervalDays: 0, overdueDays: 0, priority: 900, reason: '缺少最近练习记录' };
  }

  const intervalDays = practiceCount >= 6 && accuracy >= 0.95
    ? 30
    : accuracy >= 0.9
      ? 14
      : accuracy >= 0.75
        ? 7
        : accuracy >= 0.5
          ? 3
          : 1;
  const nextReviewAt = last + intervalDays * DAY_MS;
  const overdueDays = Math.max(0, Math.floor((now - nextReviewAt) / DAY_MS));
  const due = now >= nextReviewAt;
  return {
    due,
    nextReviewAt,
    intervalDays,
    overdueDays,
    priority: due ? 100 + overdueDays * 10 + wrongCount * 5 - Math.round(accuracy * 10) : 0,
    reason: due ? (overdueDays > 0 ? `已逾期 ${overdueDays} 天` : '今日应复习') : `建议 ${intervalDays} 天后复习`,
  };
}

/** 将复习队列按逾期程度、错误次数和掌握状态排序。 */
export function sortReviewQueue<T extends { priority: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.priority - a.priority);
}
