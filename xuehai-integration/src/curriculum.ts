/**
 * Read-only adapter over the verified source curriculum.
 * Stable source IDs are retained; no user progress or reward metadata is exported.
 */
import {
  GRADES_LIST,
  CHARACTERS_DATA,
  WORDS_DATA,
  SENTENCES_DATA,
  ESSAYS_DATA,
  EXAMS_DATA,
  PREVIEW_GUIDES,
  DEFAULT_CURRICULUM,
} from "../../src/data/curriculum";

export const MOYUN_CURRICULUM_VERSION = "source-main";

export interface MoyunCurriculumSnapshot {
  version: string;
  grades: typeof GRADES_LIST;
  characters: typeof CHARACTERS_DATA;
  words: typeof WORDS_DATA;
  sentences: typeof SENTENCES_DATA;
  essays: typeof ESSAYS_DATA;
  exams: typeof EXAMS_DATA;
  previewGuides: typeof PREVIEW_GUIDES;
  defaultCurriculum: typeof DEFAULT_CURRICULUM;
}

/** Return a detached, JSON-safe snapshot so consumers cannot mutate source constants. */
export function getMoyunCurriculumSnapshot(): MoyunCurriculumSnapshot {
  return JSON.parse(JSON.stringify({
    version: MOYUN_CURRICULUM_VERSION,
    grades: GRADES_LIST,
    characters: CHARACTERS_DATA,
    words: WORDS_DATA,
    sentences: SENTENCES_DATA,
    essays: ESSAYS_DATA,
    exams: EXAMS_DATA,
    previewGuides: PREVIEW_GUIDES,
    defaultCurriculum: DEFAULT_CURRICULUM,
  })) as MoyunCurriculumSnapshot;
}
