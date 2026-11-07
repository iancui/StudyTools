/**
 * 旧学习进度的最小导入类型。
 * 刻意不声明旧墨滴、签到、徽章、会员或身份字段，避免被误带入学海。
 */
export interface UserProgress {
  previewedItemIds?: string[];
  masteredCharacterIds?: string[];
  masteredWordIds?: string[];
  completedSentenceIds?: string[];
  wrongQuestionIds?: string[];
  examHistory?: unknown[];
  essayPractices?: unknown[];
  detailedCharStats?: Record<string, unknown>;
  detailedWordStats?: Record<string, unknown>;
  detailedSentenceStats?: Record<string, unknown>;
}
