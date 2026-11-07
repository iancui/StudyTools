import publicBank from './examBank.public.json';
import type { GradeId } from './chinese.ts';

export interface PublicExamQuestion {
  id: string;
  category: 'character' | 'word' | 'sentence' | 'reading';
  type: 'choice' | 'fill';
  question: string;
  options?: string[];
  gradeId: GradeId;
  difficulty: 'easy' | 'medium' | 'hard';
}

/** 前端只包含题干与选项；标准答案和解析仅由服务端保存。 */
export const CHINESE_EXAM_BANK = publicBank as Record<GradeId, PublicExamQuestion[]>;
