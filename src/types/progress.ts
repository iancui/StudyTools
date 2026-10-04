import { GradeId } from './chinese';

export interface ScholarRank {
  title: string;
  minInk: number;
  maxInk: number;
  desc: string;
  sealColor: string;
}

export interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: 'streak' | 'learning' | 'exam' | 'mastery';
}

export interface EssayPracticeRecord {
  id: string;
  essayId: string;
  gradeId: GradeId;
  title: string;
  content: string;
  date: string;
  score: number;
  wordCount: number;
  feedback: {
    overview: string;
    highlights: string[];
    suggestions: string[];
    detectedGoodWords: string[];
  };
}

export interface ExamRecord {
  id: string;
  gradeId: GradeId;
  score: number;
  totalScore: number;
  accuracy: number;
  date: string;
  timeSpentSeconds: number;
  wrongQuestionIds: string[];
}

export interface UserProgress {
  selectedGrade: GradeId;
  inkDrops: number;
  streakDays: number;
  lastCheckInDate: string;
  checkInHistory: string[];
  todayStudyMinutes: number;
  lastStudyTimestamp: number;
  
  // Learned & Mastered Items
  previewedItemIds: string[]; // Set of character/word/lesson ids previewed
  masteredCharacterIds: string[];
  masteredWordIds: string[];
  completedSentenceIds: string[];
  
  // Exam & Wrongs
  wrongQuestionIds: string[];
  examHistory: ExamRecord[];
  
  // Essay drafts
  essayPractices: EssayPracticeRecord[];
  
  // Badges
  unlockedBadgeIds: string[];
}
