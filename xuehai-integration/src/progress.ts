import type { UserProgress } from "../../src/types/progress";
import type { LearningProgressSnapshot } from "./contracts";

/**
 * Explicit allow-list. Deliberately excludes old identity, points, check-in,
 * streak, badge, membership and account fields.
 */
export function toLearningProgressSnapshot(progress: Partial<UserProgress>): LearningProgressSnapshot {
  return {
    previewedItemIds: stringArray(progress.previewedItemIds),
    masteredCharacterIds: stringArray(progress.masteredCharacterIds),
    masteredWordIds: stringArray(progress.masteredWordIds),
    completedSentenceIds: stringArray(progress.completedSentenceIds),
    wrongQuestionIds: stringArray(progress.wrongQuestionIds),
    examHistory: arrayValue(progress.examHistory),
    essayPractices: arrayValue(progress.essayPractices),
    detailedCharStats: recordValue(progress.detailedCharStats),
    detailedWordStats: recordValue(progress.detailedWordStats),
    detailedSentenceStats: recordValue(progress.detailedSentenceStats),
  };
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function recordValue(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}
