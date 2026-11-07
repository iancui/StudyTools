/**
 * 课程数据类型化入口。静态内容与用户进度分离，所有源课程 ID 原样保留。
 * curriculum.json 是便于导入/缓存/审计的完整 JSON 快照；运行时使用下方类型化 TS 常量，避免依赖 tsconfig 的 JSON module 选项。
 */
export const CURRICULUM_JSON_PATH = './curriculum.json';
export interface CurriculumJsonGrade {
  grade: string; label: string; section: string; stageName: string; description: string; theme: string;
  characters: unknown[]; words: unknown[]; sentences: unknown[]; essays: unknown[]; quiz: unknown[];
}
export interface CurriculumJsonSnapshot {
  version: number;
  source: { repository: string; branch: string; commit: string };
  note: string;
  grades: CurriculumJsonGrade[];
  previewGuides: Record<string, unknown>;
}
export {
  GRADES_LIST,
  CHARACTERS_DATA,
  WORDS_DATA,
  SENTENCES_DATA,
  ESSAYS_DATA,
  EXAMS_DATA,
  PREVIEW_GUIDES,
  DEFAULT_CURRICULUM,
} from './curriculum.data.ts';
export type {
  GradeId, GradeInfo, CharacterItem, WordItem, SentenceItem, EssayItem,
  ExamQuestion, CurriculumConfig, LearningMode, MainTab,
} from './chinese.ts';
