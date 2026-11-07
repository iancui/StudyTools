import { GradeId } from './chinese';

// ------------------------------------------------------------
// 工单 17: 详细学习行为统计 (数据驱动复习用)
// ------------------------------------------------------------
// 字段与 src/api/detailedProgress.ts 中的 *ProgressDTO 字段一一对应,
// 由 useDetailedProgressSync 从服务器 DTO 转换写入 UserProgress.
// 仅前端使用, 不影响数据库 schema.
export interface DetailedStats {
  /** 教材项目 ID (tc-xxx / tw-xxx / ts-xxx 或 c-g3-* / w-g3-* / s-g3-*) */
  itemId: string;
  practiceCount: number;
  correctCount: number;
  wrongCount: number;
  /** ISO 字符串 或 时间戳(ms); null 表示从未练习过. */
  lastPracticedAt: string | number | null;
}

// ------------------------------------------------------------
// 工单 18: 记忆状态 + 遗忘曲线核心模型
// ------------------------------------------------------------
// 纯前端 MemoryAnalysis 模型, 由 analyzeMemory(stats, now) 计算.
// 不写数据库, 不调 API, 不修改 progress/localStorage.
export type MemoryState =
  | 'NEW'
  | 'LEARNING'
  | 'UNSTABLE'
  | 'CONSOLIDATING'
  | 'MASTERED'
  | 'OVERDUE';

export interface MemoryAnalysis {
  practiceCount: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  daysSincePractice: number;
  state: MemoryState;
  memoryScore: number;
  reviewPriorityScore: number;
  shouldReview: boolean;
}

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
  // 工单 18.5: 学期属于长期学习配置, 与 selectedGrade 一起保存到
  // localStorage (UserProgress). 不新增数据库 schema, 不新增 API.
  // 默认 "上册", 登录后从 localStorage 恢复.
  selectedSemester: '上册' | '下册';
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

  // ------------------------------------------------------------
  // 工单 17: 详细学习行为统计 (可选, 数据驱动复习用)
  // ------------------------------------------------------------
  // 仅在登录且 useDetailedProgressSync 拉取到服务器数据后才填充.
  // 未登录或服务器无数据时为 undefined, ReviewMode 此时回退到
  // 原 buildReviewQuestions 算法, 不影响已有学习体验.
  // 不新增数据库 schema, 只是前端缓存已加载好的 DTO.
  detailedCharStats?: Record<string, DetailedStats>;
  detailedWordStats?: Record<string, DetailedStats>;
  detailedSentenceStats?: Record<string, DetailedStats>;
}
