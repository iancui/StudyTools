import { UserProgress, ScholarRank, EssayPracticeRecord, ExamRecord } from '../types/progress';
import { GradeId } from '../types/chinese';
import { SCHOLAR_RANKS, SYSTEM_BADGES } from '../data/curriculum';

const STORAGE_KEY = 'moyun_chinese_learning_v1';

export const getInitialProgress = (): UserProgress => {
  if (typeof window === 'undefined') {
    return createDefaultProgress();
  }
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
  selectedGrade: 'g3', // Defaults to Grade 3 (三年级) for balanced showcase
  inkDrops: 85,
  streakDays: 1,
  lastCheckInDate: '',
  checkInHistory: [],
  todayStudyMinutes: 12,
  lastStudyTimestamp: Date.now(),
  previewedItemIds: [],
  masteredCharacterIds: ['c-g1-1', 'c-g1-2'],
  masteredWordIds: ['w-g1-1'],
  completedSentenceIds: [],
  wrongQuestionIds: [],
  examHistory: [],
  essayPractices: [],
  unlockedBadgeIds: ['b_checkin_1']
});

export const saveProgress = (progress: UserProgress): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
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
