// 墨韵中文 前端 复习算法 (工单 14)
// ============================================================
//
// 设计目标:
//   - 主动回忆 + 间隔复习 + 错误优先 + 混合练习
//   - 第一版不新增数据库表, 不修改后端, 完全前端计算.
//   - 纯函数, 不依赖 React, 不依赖网络, 容易单测和修改.
//
// 数据来源 (现有):
//   - UserProgress.masteredCharacterIds / masteredWordIds / completedSentenceIds
//   - UserProgress.wrongQuestionIds
//   - wrong_count / correct_count / practice_count / first_practice_at /
//     last_practice_at 在当前数据库未暴露给前端, 因此第一版
//     基于现有 ID 列表 + Date.now() 推算"是否应该复习".
//   - 未来若后端补齐 next_review_at 字段, 只需替换 shouldReviewItem 的实现,
//     算法其余部分保持不变.
//
// 间隔策略 (默认):
//   新内容:        当天 → 1 天 → 3 天 → 7 天 → 14 天 → 30 天
//   答错:         立即再练, 下一次间隔缩短 (interval * 0.5, 最少 1 天)
//   连续正确:     逐步延长下一次间隔 (interval * 2, 上限 30 天)
//
// "今日复习"优先级 (从高到低):
//   1. 已到复习时间的内容 (last_practice_at + interval <= today)
//   2. 最近答错的内容 (in wrongQuestionIds)
//   3. 尚未掌握的内容 (not in mastered*Ids)
//
// 混合题型:
//   - 看汉字 → 回忆拼音 (char -> pinyin)
//   - 看拼音 → 回忆汉字 (pinyin -> char)
//   - 听音 → 选择/回忆汉字 (audio -> char)
//   - 词语识别 (word -> definition / definition -> word)
//   - 重点句子填空/选择
//   抽题策略: round-robin 不同类型, 避免同类题一次做完.
// ------------------------------------------------------------

import {
  CharacterItem,
  SentenceItem,
  WordItem,
} from "../types/chinese";
import { UserProgress } from "../types/progress";

// ------------------------------------------------------------
// 1. 类型
// ------------------------------------------------------------

/** 复习范围类型. 工单 14 增加今日复习. */
export type ReviewScope =
  | "today"
  | "current_lesson"
  | "selected"
  | "midterm"
  | "final";

export type ReviewQuestionType =
  | "char_to_pinyin" // 看汉字回忆拼音
  | "pinyin_to_char" // 看拼音回忆汉字
  | "audio_to_char" // 听音回忆汉字
  | "word_recognize" // 词语识别
  | "sentence_fill"; // 句子填空/选择

export interface ReviewQuestion {
  id: string;
  type: ReviewQuestionType;
  prompt: string;
  answer: string;
  /** 用于音频题型: 朗读内容 (传给 speakChinese). */
  audioText?: string;
  /** 选择题选项 (听音题或词语识别题可用). */
  options?: string[];
  /** 题目来源 (用于结果统计). */
  source: {
    kind: "char" | "word" | "sentence";
    refId: string;
    lessonNo?: number;
  };
  /** 提示信息 (可选). */
  hint?: string;
}

export interface ReviewSessionResult {
  total: number;
  correctCount: number;
  wrongCount: number;
  wrongItems: {
    refId: string;
    kind: "char" | "word" | "sentence";
    prompt: string;
    answer: string;
  }[];
  /** 学习建议 (基于正确率). */
  suggestion: string;
}

// ------------------------------------------------------------
// 2. 间隔策略 (Spaced Repetition)
// ------------------------------------------------------------

/**
 * 默认间隔阶梯 (天). 新内容从第 0 阶开始.
 * 答错时降一阶 (interval * 0.5, 最少 1 天), 连续正确时升一阶.
 */
export const DEFAULT_INTERVAL_LADDER = [0, 1, 3, 7, 14, 30];

/**
 * 根据当前阶梯计算下一次复习间隔 (天).
 * @param stage 当前阶梯索引 (0 表示首次, 1 表示已正确 1 次, ...)
 * @param wrongOnLast 是否上次答错
 */
export function nextIntervalDays(
  stage: number,
  wrongOnLast: boolean
): number {
  const ladder = DEFAULT_INTERVAL_LADDER;
  const safeStage = Math.max(0, Math.min(stage, ladder.length - 1));
  if (wrongOnLast) {
    // 答错: 当前间隔 * 0.5, 最少 1 天
    const half = Math.floor(ladder[safeStage] * 0.5);
    return Math.max(1, half);
  }
  // 连续正确: 升一阶, 上限 30 天
  const next = ladder[Math.min(safeStage + 1, ladder.length - 1)];
  return Math.min(30, next);
}

/**
 * 判断一条内容是否"已到复习时间".
 * 第一版基于 first_practice_at / last_practice_at 模拟; 当前数据库
 * 没有这些字段时, 用 masteredAt 推断 (内容第一次出现即视为可复习).
 *
 * 规则:
 *   - 未掌握的内容: 永远需要复习 (今日)
 *   - 上次答错的内容: 今日必须复习
 *   - 已掌握的内容: 按阶梯推算"下次复习日", 今天 >= 下次复习日则需复习
 */
export function shouldReviewItem(opts: {
  isMastered: boolean;
  inWrongList: boolean;
  /** 已练习次数 (前端可用 mastered 切换次数近似). 没有则按 0 处理. */
  practiceCount?: number;
  /** 上次练习时间 (ms). 没有则视为 0 (远古时间). */
  lastPracticeAt?: number;
  now?: number;
}): boolean {
  const now = opts.now ?? Date.now();
  // 上次答错: 必复习
  if (opts.inWrongList) return true;
  // 未掌握: 必复习 (主动回忆)
  if (!opts.isMastered) return true;
  // 已掌握: 按阶梯推算下次复习日
  const stage = Math.max(0, Math.min(opts.practiceCount ?? 0, DEFAULT_INTERVAL_LADDER.length - 1));
  const intervalDays = DEFAULT_INTERVAL_LADDER[stage];
  const intervalMs = intervalDays * 24 * 60 * 60 * 1000;
  if (!opts.lastPracticeAt) return true; // 没有记录视为需复习
  return now >= opts.lastPracticeAt + intervalMs;
}

// ------------------------------------------------------------
// 3. 期中 / 期末范围计算
// ------------------------------------------------------------
//
// 当前教材数据较少, 暂用"前半段课程"作为期中, "全部课程"作为期末.
// 不写死成永久业务规则, 封装在函数里, 未来可改为教材定义的期中范围.
//
// 传入的 lessons 会先按 lessonNo 排序, 保证稳定.

export interface LessonLike {
  id: string;
  lessonNo: number;
}

/** 期中复习范围: 课程列表前半段. */
export function midtermLessonIds<T extends LessonLike>(lessons: T[]): string[] {
  const sorted = [...lessons].sort((a, b) => a.lessonNo - b.lessonNo);
  if (sorted.length === 0) return [];
  const half = Math.ceil(sorted.length / 2);
  return sorted.slice(0, half).map((l) => l.id);
}

/** 期末复习范围: 课程列表全部. */
export function finalLessonIds<T extends LessonLike>(lessons: T[]): string[] {
  return [...lessons]
    .sort((a, b) => a.lessonNo - b.lessonNo)
    .map((l) => l.id);
}

// ------------------------------------------------------------
// 4. 复习题生成 (混合题型)
// ------------------------------------------------------------

/**
 * 把生字/词语/句子三列内容按"今日复习优先级"筛选, 然后生成混合题型.
 *
 * @param masteredCharIds    已掌握生字 ID 列表
 * @param masteredWordIds    已掌握词语 ID 列表
 * @param completedSentenceIds 已完成句子 ID 列表
 * @param wrongIds           错题 ID 集合 (来自 UserProgress.wrongQuestionIds)
 * @param maxQuestions       最大题目数 (默认 20)
 * @param now                当前时间 (ms), 默认 Date.now
 */
export interface BuildReviewQuestionsInput {
  characters: CharacterItem[];
  words: WordItem[];
  sentences: SentenceItem[];
  masteredCharIds: string[];
  masteredWordIds: string[];
  completedSentenceIds: string[];
  wrongIds: string[];
  maxQuestions?: number;
  now?: number;
  seed?: number;
}

export function buildReviewQuestions(
  input: BuildReviewQuestionsInput
): ReviewQuestion[] {
  const max = input.maxQuestions ?? 20;
  const now = input.now ?? Date.now();

  // 1. 筛选"今日需要复习"的内容
  const charsToReview = input.characters.filter((c) =>
    shouldReviewItem({
      isMastered: input.masteredCharIds.includes(c.id),
      inWrongList: input.wrongIds.includes(c.id),
      practiceCount: input.masteredCharIds.includes(c.id) ? 1 : 0,
      lastPracticeAt: undefined, // 第一版没有 last_practice_at 字段
      now,
    })
  );
  const wordsToReview = input.words.filter((w) =>
    shouldReviewItem({
      isMastered: input.masteredWordIds.includes(w.id),
      inWrongList: input.wrongIds.includes(w.id),
      practiceCount: input.masteredWordIds.includes(w.id) ? 1 : 0,
      lastPracticeAt: undefined,
      now,
    })
  );
  const sentencesToReview = input.sentences.filter((s) =>
    shouldReviewItem({
      isMastered: input.completedSentenceIds.includes(s.id),
      inWrongList: input.wrongIds.includes(s.id),
      practiceCount: input.completedSentenceIds.includes(s.id) ? 1 : 0,
      lastPracticeAt: undefined,
      now,
    })
  );

  // 2. 错题优先 + 未掌握优先: 用 stable sort 把错题排到前面
  const sortWithPriority = <T extends { id: string }>(arr: T[], wrongIds: string[], masteredIds: string[]): T[] => {
    return [...arr].sort((a, b) => {
      const aWrong = wrongIds.includes(a.id) ? 0 : 1;
      const bWrong = wrongIds.includes(b.id) ? 0 : 1;
      if (aWrong !== bWrong) return aWrong - bWrong;
      const aMastered = masteredIds.includes(a.id) ? 1 : 0;
      const bMastered = masteredIds.includes(b.id) ? 1 : 0;
      return aMastered - bMastered;
    });
  };

  const sortedChars = sortWithPriority(charsToReview, input.wrongIds, input.masteredCharIds);
  const sortedWords = sortWithPriority(wordsToReview, input.wrongIds, input.masteredWordIds);
  const sortedSents = sortWithPriority(sentencesToReview, input.wrongIds, input.completedSentenceIds);

  // 3. 生成题库 (每条内容多种题型变体)
  //    用 round-robin 在 char/word/sentence 之间切换, 避免同类题一次做完.
  const charQuestions: ReviewQuestion[] = [];
  for (const c of sortedChars) {
    // 看字 -> 拼音
    charQuestions.push({
      id: `${c.id}-cp`,
      type: "char_to_pinyin",
      prompt: c.char,
      answer: c.pinyin,
      source: { kind: "char", refId: c.id },
      hint: c.phrases[0],
    });
    // 看拼音 -> 字 (用其他字做干扰)
    charQuestions.push({
      id: `${c.id}-pc`,
      type: "pinyin_to_char",
      prompt: c.pinyin,
      answer: c.char,
      source: { kind: "char", refId: c.id },
      options: buildCharOptions(c.char, input.characters),
    });
    // 听音 -> 字
    charQuestions.push({
      id: `${c.id}-ac`,
      type: "audio_to_char",
      prompt: "听音选字",
      answer: c.char,
      audioText: c.char,
      source: { kind: "char", refId: c.id },
      options: buildCharOptions(c.char, input.characters),
    });
  }

  const wordQuestions: ReviewQuestion[] = [];
  for (const w of sortedWords) {
    wordQuestions.push({
      id: `${w.id}-wr`,
      type: "word_recognize",
      prompt: w.word,
      answer: w.definition || w.pinyin || w.pos,
      source: { kind: "word", refId: w.id },
      hint: w.exampleSentence,
    });
  }

  const sentQuestions: ReviewQuestion[] = [];
  for (const s of sortedSents) {
    // 句子填空: 把原句最后一个字挖空
    const text = s.originalText || "";
    if (text.length < 4) continue;
    const last = text[text.length - 1];
    const blanked = text.slice(0, -1) + "____";
    sentQuestions.push({
      id: `${s.id}-sf`,
      type: "sentence_fill",
      prompt: blanked,
      answer: last,
      source: { kind: "sentence", refId: s.id },
      hint: s.categoryLabel,
    });
  }

  // 4. Round-robin 混合抽题: char -> word -> sentence -> char -> ...
  //    每轮只取每个队列的下一题, 直到达到 max 或所有队列耗尽.
  //    每个字最多取一种题型变体 (避免同一字连出 3 道不同题型).
  const result: ReviewQuestion[] = [];
  const charUsed = new Set<string>();
  const queues: ReviewQuestion[][] = [charQuestions, wordQuestions, sentQuestions];
  const heads = [0, 0, 0];

  while (result.length < max) {
    let progressed = false;
    for (let qi = 0; qi < queues.length; qi++) {
      if (result.length >= max) break;
      const queue = queues[qi];
      let i = heads[qi];
      while (i < queue.length) {
        const q = queue[i];
        // 对字题去重: 同一个 char refId 只出 1 道
        if (q.source.kind === "char" && charUsed.has(q.source.refId)) {
          i++;
          continue;
        }
        result.push(q);
        if (q.source.kind === "char") charUsed.add(q.source.refId);
        heads[qi] = i + 1;
        progressed = true;
        break;
      }
      if (result.length >= max) break;
    }
    if (!progressed) break;
  }

  return result;
}

/** 生成汉字选项 (含正确答案 + 3 个干扰). */
function buildCharOptions(correctChar: string, pool: CharacterItem[]): string[] {
  const distractors = pool
    .filter((c) => c.char !== correctChar)
    .map((c) => c.char);
  // 简单 shuffle
  for (let i = distractors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
  }
  const opts = [correctChar, ...distractors.slice(0, 3)];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return opts;
}

// ------------------------------------------------------------
// 5. 复习结果汇总
// ------------------------------------------------------------

export interface AnswerRecord {
  question: ReviewQuestion;
  userAnswer: string;
  isCorrect: boolean;
}

export function summarizeReviewSession(records: AnswerRecord[]): ReviewSessionResult {
  const total = records.length;
  const correctCount = records.filter((r) => r.isCorrect).length;
  const wrongCount = total - correctCount;
  const wrongItems = records
    .filter((r) => !r.isCorrect)
    .map((r) => ({
      refId: r.question.source.refId,
      kind: r.question.source.kind,
      prompt: r.question.prompt,
      answer: r.question.answer,
    }));

  const correctRate = total > 0 ? correctCount / total : 0;
  let suggestion: string;
  if (total === 0) {
    suggestion = "本次没有可复习的内容, 可以休息一下!";
  } else if (correctRate >= 0.9) {
    suggestion = "掌握非常扎实! 建议明天继续按今日复习节奏巩固.";
  } else if (correctRate >= 0.7) {
    suggestion = "整体不错, 错题建议今晚再做一轮, 强化记忆.";
  } else {
    suggestion = "正确率偏低, 建议回到课程学习页仔细复习, 明天再来一轮.";
  }

  return { total, correctCount, wrongCount, wrongItems, suggestion };
}

// ------------------------------------------------------------
// 6. 复习范围预览 (用于"开始复习"前的统计)
// ------------------------------------------------------------

export interface ReviewScopePreview {
  charCount: number;
  wordCount: number;
  sentenceCount: number;
  /** 预计分钟 (按 30 秒/题估算). */
  estimatedMinutes: number;
}

export function previewReviewScope(opts: {
  characters: CharacterItem[];
  words: WordItem[];
  sentences: SentenceItem[];
  masteredCharIds: string[];
  masteredWordIds: string[];
  completedSentenceIds: string[];
  wrongIds: string[];
  now?: number;
}): ReviewScopePreview {
  const now = opts.now ?? Date.now();
  const charCount = opts.characters.filter((c) =>
    shouldReviewItem({
      isMastered: opts.masteredCharIds.includes(c.id),
      inWrongList: opts.wrongIds.includes(c.id),
      practiceCount: opts.masteredCharIds.includes(c.id) ? 1 : 0,
      now,
    })
  ).length;
  const wordCount = opts.words.filter((w) =>
    shouldReviewItem({
      isMastered: opts.masteredWordIds.includes(w.id),
      inWrongList: opts.wrongIds.includes(w.id),
      practiceCount: opts.masteredWordIds.includes(w.id) ? 1 : 0,
      now,
    })
  ).length;
  const sentenceCount = opts.sentences.filter((s) =>
    shouldReviewItem({
      isMastered: opts.completedSentenceIds.includes(s.id),
      inWrongList: opts.wrongIds.includes(s.id),
      practiceCount: opts.completedSentenceIds.includes(s.id) ? 1 : 0,
      now,
    })
  ).length;
  const total = charCount + wordCount + sentenceCount;
  return {
    charCount,
    wordCount,
    sentenceCount,
    estimatedMinutes: Math.max(1, Math.round((total * 30) / 60)),
  };
}

/**
 * 题型人类可读名称 (UI 用).
 */
export function questionTypeLabel(t: ReviewQuestionType): string {
  switch (t) {
    case "char_to_pinyin":
      return "看字回忆拼音";
    case "pinyin_to_char":
      return "看拼音回忆汉字";
    case "audio_to_char":
      return "听音选汉字";
    case "word_recognize":
      return "词语识别";
    case "sentence_fill":
      return "句子填空";
  }
}

// ------------------------------------------------------------
// 7. 与 UserProgress 的桥接 (可选, 给 ReviewMode 用)
// ------------------------------------------------------------

export function buildFromProgress(
  progress: UserProgress,
  characters: CharacterItem[],
  words: WordItem[],
  sentences: SentenceItem[],
  opts?: { maxQuestions?: number; now?: number }
): ReviewQuestion[] {
  return buildReviewQuestions({
    characters,
    words,
    sentences,
    masteredCharIds: progress.masteredCharacterIds,
    masteredWordIds: progress.masteredWordIds,
    completedSentenceIds: progress.completedSentenceIds,
    wrongIds: progress.wrongQuestionIds,
    maxQuestions: opts?.maxQuestions,
    now: opts?.now,
  });
}
