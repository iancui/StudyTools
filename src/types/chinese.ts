export type GradeId = 
  | 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6' 
  | 'g7' | 'g8' | 'g9' 
  | 'g10' | 'g11' | 'g12';

export type SchoolSection = 'primary' | 'middle' | 'high';

export interface GradeInfo {
  id: GradeId;
  name: string;
  section: SchoolSection;
  stageName: string;
  description: string;
  theme: string;
}

export interface PhoneticTrap {
  type: 'front_nasal' | 'back_nasal' | 'flat_retroflex' | 'polyphone' | 'tone' | 'other';
  label: string; // e.g. "前鼻音易错 (-n vs -ng)" / "翘舌音 (zh/ch/sh vs z/c/s)"
  tip: string; // Detailed guide, e.g. "注意：'晨'韵母为前鼻音én，舌尖抵住上齿龈，切忌读成后鼻音chéng"
  contrastPair?: {
    correctWord: string;
    confusingWord: string;
    correctPinyin: string;
    confusingPinyin: string;
  };
}

export interface CharacterItem {
  id: string;
  char: string;
  pinyin: string;
  radical: string;
  strokeCount: number;
  strokeOrderHint: string;
  strokeOrderSteps?: string[]; // 笔画分解步骤列表: 比如 ['丨', '𠃍', '一', '一']
  structure: string; // 独体字, 左右结构, 上下结构, 半包围结构...
  meanings: string[];
  phrases: string[];
  exampleSentence: string;
  mnemonic?: string; // 字谜/助记巧思
  phoneticTrap?: PhoneticTrap; // 前后鼻音、平翘舌音易错警示
  gradeId: GradeId;
}

export interface WordItem {
  id: string;
  word: string;
  pinyin: string;
  pos: string; // 词性: 名词/动词/形容词/成语
  definition: string;
  synonyms: string[];
  antonyms: string[];
  exampleSentence: string;
  culturalNote?: string; // 成语典故或文化拓展
  phoneticTip?: string; // 词语发音或前后鼻音提示
  gradeId: GradeId;
}

export interface SentenceItem {
  id: string;
  category: 'rhetoric' | 'classical' | 'error_correction' | 'imitation';
  categoryLabel: string;
  title: string;
  originalText: string;
  analysis: string;
  modernTranslation?: string; // 文言文现代汉语译文
  keyDevices?: string[]; // 修辞或句式: 比喻、排比、倒装、使动等
  practicePrompt: string;
  practiceAnswer: string;
  gradeId: GradeId;
}

export interface EssayItem {
  id: string;
  title: string;
  gradeTier: string;
  promptText: string;
  outlineAdvice: string[];
  keyTechniques: string[];
  modelEssay: {
    title: string;
    paragraphs: string[];
  };
  paragraphAnnotations: string[];
  goodPhrases: string[];
  sampleMaterials: { title: string; quote: string }[];
  gradeId: GradeId;
}

export interface ExamQuestion {
  id: string;
  category: 'character' | 'word' | 'sentence' | 'reading';
  type: 'choice' | 'fill';
  question: string;
  options?: string[];
  correctAnswer: string | number; // 0, 1, 2, 3 for choice, or text string for fill
  explanation: string;
  gradeId: GradeId;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CurriculumConfig {
  characters: Record<GradeId, CharacterItem[]>;
  words: Record<GradeId, WordItem[]>;
  sentences: Record<GradeId, SentenceItem[]>;
  essays: Record<GradeId, EssayItem[]>;
  exams: Record<GradeId, ExamQuestion[]>;
}

// 工单 12: 新增 'home' 模式作为登录后默认入口 (学习首页)
export type LearningMode = 'home' | 'learn' | 'preview' | 'review' | 'exam';
export type MainTab = 'character' | 'word' | 'sentence' | 'essay' | 'records' | 'settings';
