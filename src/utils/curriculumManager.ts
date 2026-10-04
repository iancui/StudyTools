import { CurriculumConfig } from '../types/chinese';
import { DEFAULT_CURRICULUM } from '../data/curriculum';

const CURRICULUM_STORAGE_KEY = 'moyun_custom_curriculum_data_v1';

export const getInitialDefaultCurriculum = (): CurriculumConfig => DEFAULT_CURRICULUM;

export const loadCurriculum = (): CurriculumConfig => {
  if (typeof window === 'undefined') {
    return getInitialDefaultCurriculum();
  }

  try {
    const raw = localStorage.getItem(CURRICULUM_STORAGE_KEY);
    if (!raw) return getInitialDefaultCurriculum();
    const parsed = JSON.parse(raw);
    
    // Ensure all grade keys exist
    const defaultData = getInitialDefaultCurriculum();
    return {
      characters: { ...defaultData.characters, ...(parsed.characters || {}) },
      words: { ...defaultData.words, ...(parsed.words || {}) },
      sentences: { ...defaultData.sentences, ...(parsed.sentences || {}) },
      essays: { ...defaultData.essays, ...(parsed.essays || {}) },
      exams: { ...defaultData.exams, ...(parsed.exams || {}) }
    };
  } catch (e) {
    console.error('Failed to parse stored curriculum:', e);
    return getInitialDefaultCurriculum();
  }
};

export const saveCurriculum = (config: CurriculumConfig): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save curriculum to localStorage:', e);
  }
};

export const resetCurriculumToDefault = (): CurriculumConfig => {
  const defaults = getInitialDefaultCurriculum();
  saveCurriculum(defaults);
  return defaults;
};

export const exportCurriculumAsJSON = (config: CurriculumConfig): string => {
  return JSON.stringify(config, null, 2);
};

export const importCurriculumFromJSON = (jsonStr: string): { success: boolean; data?: CurriculumConfig; error?: string } => {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'JSON 格式无效，必须是有效的课程配置对象。' };
    }
    const defaultData = getInitialDefaultCurriculum();
    const merged: CurriculumConfig = {
      characters: { ...defaultData.characters, ...(parsed.characters || {}) },
      words: { ...defaultData.words, ...(parsed.words || {}) },
      sentences: { ...defaultData.sentences, ...(parsed.sentences || {}) },
      essays: { ...defaultData.essays, ...(parsed.essays || {}) },
      exams: { ...defaultData.exams, ...(parsed.exams || {}) }
    };
    saveCurriculum(merged);
    return { success: true, data: merged };
  } catch (err: any) {
    return { success: false, error: `导入解析失败: ${err?.message || '格式错误'}` };
  }
};
