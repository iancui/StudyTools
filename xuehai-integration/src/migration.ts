import type { UserProgress } from "../../src/types/progress";
import type { LearningProgressSnapshot } from "./contracts";
import { toLearningProgressSnapshot } from "./progress";

export interface LegacyProgressExport {
  /** Old StudyTools numeric user id; informational only, never a Xuehai id. */
  legacyUserId?: number | null;
  progress: Partial<UserProgress>;
}

export interface MigrationPlan {
  targetUserId: string;
  source: "moyun_chinese_learning_v1";
  snapshot: LearningProgressSnapshot;
  counts: {
    previewed: number;
    charactersMastered: number;
    wordsMastered: number;
    sentencesCompleted: number;
    wrongQuestions: number;
    examRecords: number;
    essayPractices: number;
  };
  excludedLegacyFields: string[];
  warnings: string[];
}

/**
 * Pure transformation only: caller supplies an already-exported localStorage
 * JSON document and an authenticated Xuehai user ID. This module performs no IO.
 */
export function createMigrationPlan(
  legacy: LegacyProgressExport,
  targetUserId: string,
): MigrationPlan {
  if (!targetUserId.trim()) throw new Error("必须提供已认证的学海 userId");
  const snapshot = toLearningProgressSnapshot(legacy.progress);
  return {
    targetUserId,
    source: "moyun_chinese_learning_v1",
    snapshot,
    counts: {
      previewed: snapshot.previewedItemIds.length,
      charactersMastered: snapshot.masteredCharacterIds.length,
      wordsMastered: snapshot.masteredWordIds.length,
      sentencesCompleted: snapshot.completedSentenceIds.length,
      wrongQuestions: snapshot.wrongQuestionIds.length,
      examRecords: snapshot.examHistory.length,
      essayPractices: snapshot.essayPractices.length,
    },
    excludedLegacyFields: [
      "legacyUserId (身份不可直接迁移)",
      "inkDrops / streakDays / lastCheckInDate / checkInHistory (学海积分与签到由宿主唯一负责)",
      "unlockedBadgeIds (旧徽章奖励不可迁移)",
      "selectedGrade / selectedSemester (仅在学海确认有偏好字段后单独迁移)",
      "todayStudyMinutes / lastStudyTimestamp (旧字段无可信累计来源)",
    ],
    warnings: [
      "这是 dry-run 数据映射，不执行数据库写入。",
      "必须由学海服务端从已认证会话确定目标 userId；不能信任客户端传入的目标身份。",
      "旧系统用户数值 ID 仅作来源审计，不得作为学海用户 ID。",
      "执行前应确认目标端对错题、测验、作文及详细统计的字段兼容性，并提供幂等导入策略。",
      "墨滴、签到、连续签到和旧徽章全部排除，避免重复奖励或绕过学海积分规则。",
    ],
  };
}
