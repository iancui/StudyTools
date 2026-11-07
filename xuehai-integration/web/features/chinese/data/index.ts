/**
 * 课程数据类型化入口。静态内容与用户进度分离，所有源课程 ID 原样保留。
 */
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
