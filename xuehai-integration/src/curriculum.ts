/**
 * Portable curriculum adapter. The data module and source-compatible types are
 * vendored snapshots under this directory so the package can be copied into
 * Xuehai without depending on the original repository's src/ tree.
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
} from "./curriculum.data";

export const MOYUN_CURRICULUM_VERSION = "studytools-main-4a1496c";

export {
  GRADES_LIST,
  CHARACTERS_DATA,
  WORDS_DATA,
  SENTENCES_DATA,
  ESSAYS_DATA,
  EXAMS_DATA,
  PREVIEW_GUIDES,
  DEFAULT_CURRICULUM,
};

export function getMoyunCurriculumSnapshot() {
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
  }));
}
