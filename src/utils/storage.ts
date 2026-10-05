import { UserProgress, ScholarRank, EssayPracticeRecord, ExamRecord } from '../types/progress';
import { GradeId } from '../types/chinese';
import { SCHOLAR_RANKS, SYSTEM_BADGES } from '../data/curriculum';

const STORAGE_KEY = 'moyun_chinese_learning_v1';

// 工单 12: 按用户隔离 localStorage 学习数据, 防止 A 退出后 B 看到 A 的进度.
// 未登录时 (userId 为空) 回退到原全局 key, 保持向后兼容.
function storageKeyForUser(userId?: number | null): string {
  if (!userId) return STORAGE_KEY;
  return `${STORAGE_KEY}:user:${userId}`;
}

// 工单 12: 新注册用户必须是真正的 0 数据, 不带任何 demo 种子值.
// 之前 createDefaultProgress 返回 inkDrops=85 / streakDays=1 /
// 已掌握 c-g1-1,c-g1-2 / w-g1-1 / 解锁 b_checkin_1 徽章, 这是 demo
// 种子数据, 不应该出现在真实新用户身上.
export const getInitialProgress = (userId?: number | null): UserProgress => {
  if (typeof window === 'undefined') {
    return createDefaultProgress();
  }

  try {
    const raw = localStorage.getItem(storageKeyForUser(userId));
    if (!raw) return createDefaultProgress();
    const parsed = JSON.parse(raw);
    return {
      ...createDefaultProgress(),
      ...parsed
    };
  } catch (e) {
    console.error('Failed to load progress from localStorage:', e);
    return createDefaultProgress();
  }
};

export const createDefaultProgress = (): UserProgress => ({
  selectedGrade: 'g3', // 默认年级 (UI 偏好, 不是进度数据), 新用户也是 g3
  // 工单 18.5: 默认学期 "上册", 与 selectedGrade 一起长期保存.
  selectedSemester: '上册',
  inkDrops: 0,
  streakDays: 0,
  lastCheckInDate: '',
  checkInHistory: [],
  todayStudyMinutes: 0,
  lastStudyTimestamp: 0,
  previewedItemIds: [],
  masteredCharacterIds: [],
  masteredWordIds: [],
  completedSentenceIds: [],
  wrongQuestionIds: [],
  examHistory: [],
  essayPractices: [],
  unlockedBadgeIds: []
});

export const saveProgress = (progress: UserProgress, userId?: number | null): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKeyForUser(userId), JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to localStorage:', e);
  }
};

export const getCurrentScholarRank = (ink: number): ScholarRank => {
  for (let i = SCHOLAR_RANKS.length - 1; i >= 0; i--) {
    if (ink >= SCHOLAR_RANKS[i].minInk) {
      return SCHOLAR_RANKS[i];
    }
  }
  return SCHOLAR_RANKS[0];
};

export const getNextScholarRank = (ink: number): ScholarRank | null => {
  const current = getCurrentScholarRank(ink);
  const currentIndex = SCHOLAR_RANKS.findIndex(r => r.title === current.title);
  if (currentIndex < SCHOLAR_RANKS.length - 1) {
    return SCHOLAR_RANKS[currentIndex + 1];
  }
  return null;
};

// Check and trigger newly unlocked badges
export const evaluateBadges = (progress: UserProgress): string[] => {
  const newBadges: string[] = [...progress.unlockedBadgeIds];

  if (progress.checkInHistory.length >= 1 && !newBadges.includes('b_checkin_1')) {
    newBadges.push('b_checkin_1');
  }
  if (progress.streakDays >= 3 && !newBadges.includes('b_checkin_3')) {
    newBadges.push('b_checkin_3');
  }
  if (progress.streakDays >= 7 && !newBadges.includes('b_checkin_7')) {
    newBadges.push('b_checkin_7');
  }
  if (progress.masteredCharacterIds.length >= 4 && !newBadges.includes('b_char_master')) {
    newBadges.push('b_char_master');
  }
  if (progress.masteredWordIds.length >= 4 && !newBadges.includes('b_word_master')) {
    newBadges.push('b_word_master');
  }
  if (progress.essayPractices.length >= 1 && !newBadges.includes('b_essay_first')) {
    newBadges.push('b_essay_first');
  }
  if (progress.examHistory.some(e => e.accuracy === 100) && !newBadges.includes('b_exam_pass')) {
    newBadges.push('b_exam_pass');
  }
  if (progress.inkDrops >= 500 && !newBadges.includes('b_scholar_ink')) {
    newBadges.push('b_scholar_ink');
  }

  return newBadges;
};
