/**
 * 课程数据类型化入口。静态内容与用户进度分离。
 * curriculum.json 是可缓存、可审计的规范化快照；兼容运行组件仍可使用旧 ID 常量。
 */
import curriculumJson from './curriculum.json';

export interface CurriculumJsonItem {
  id: string;
  legacyId?: string;
  sourceId?: string;
  [key: string]: unknown;
}
export interface CurriculumJsonLesson {
  id: string;
  title: string;
  synthetic: boolean;
  sourceGradeId: string;
  characters: CurriculumJsonItem[];
  words: CurriculumJsonItem[];
  sentences: CurriculumJsonItem[];
  essay: Record<string, unknown>;
  essays: CurriculumJsonItem[];
  quiz: CurriculumJsonItem[];
  previewGuide: unknown;
}
export interface CurriculumJsonSemester {
  semester: 's1' | 's2';
  label: string;
  lessons: CurriculumJsonLesson[];
}
export interface CurriculumJsonGrade {
  grade: string;
  label: string;
  section: string;
  stageName: string;
  description: string;
  theme: string;
  semesters: CurriculumJsonSemester[];
}
export interface CurriculumJsonSnapshot {
  version: number;
  source: { repository: string; branch: string; commit: string; note: string };
  grades: CurriculumJsonGrade[];
}

export const CURRICULUM_JSON = curriculumJson as CurriculumJsonSnapshot;
export const CURRICULUM_JSON_PATH = './curriculum.json';

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
