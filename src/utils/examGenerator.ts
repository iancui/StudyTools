// 墨韵中文 教材测验题目生成器
// ============================================================
//
// 工单 11: 把教材 lesson 的 chars/words/sentences 转成 3 类选择题:
//   A. 生字拼音题: 问"X"的拼音, 干扰项用其他生字的拼音 (来自本课或
//      curriculum 同年级数据, 只取拼音字符串, 不带 ID).
//   B. 词语识别题: "下面哪个词语出现在本课?" 正确答案来自本课 words,
//      干扰项用其他课程/curriculum 的词语字符串 (不带 ID).
//   C. 重点句子题: "下面哪一句是《xxx》中的重点句子?" 正确答案来自本课
//      sentences, 干扰项用其他课程/curriculum 的句子字符串 (不带 ID).
//
// 数据隔离原则 (工单要求):
//   - 正确答案 sourceId 必须是当前 lesson 的 tc-, tw-, ts- 前缀 ID
//   - 干扰项只用 text 字符串, 不携带 ID, 不会污染 user_*_progress 表
//   - 不会重复出题: 同一个 sourceId 在一份试卷中只出现一次
//   - 选项顺序随机, 题目顺序随机
//
// 题量: 默认 10 题, 数据不足时使用所有可生成题数, 不编造数据.
// 题目类型按 chars/words/sentences 数量比例分配, 不足时跳过该类型.

import {
  CharacterItem,
  ExamQuestion,
  SentenceItem,
  WordItem,
} from "../types/chinese";

const TARGET_QUESTION_COUNT = 10;

interface GenerateOptions {
  characters: CharacterItem[];
  words: WordItem[];
  sentences: SentenceItem[];
  lessonTitle: string;
  // 用于生成拼音干扰项 (本课数据不足时回退来源)
  distractorPinyinPool?: string[];
  // 用于生成词语干扰项 (本课数据不足时回退来源)
  distractorWordPool?: string[];
  // 用于生成句子干扰项 (本课数据不足时回退来源)
  distractorSentencePool?: string[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * 从 pool 中抽取 n 个与 correct 不同的干扰项字符串.
 * pool 会先去重 + 过滤掉 correct, 不足时返回实际能取到的数量.
 */
function pickDistractors(
  pool: string[],
  correct: string,
  n: number
): string[] {
  const cleaned = uniq(pool).filter(
    (s) => s && s !== correct
  );
  return shuffle(cleaned).slice(0, n);
}

// A. 生字拼音题
function buildCharacterPinyinQuestion(
  c: CharacterItem,
  pinyinPool: string[]
): ExamQuestion | null {
  if (!c.pinyin) return null;
  const distractors = pickDistractors(
    pinyinPool,
    c.pinyin,
    3
  );
  if (distractors.length < 2) return null;
  const options = shuffle([c.pinyin, ...distractors]);
  const correctIdx = options.indexOf(c.pinyin);
  return {
    id: `q-char-${c.id}`,
    category: "character",
    type: "choice",
    question: `“${c.char}”的拼音是？`,
    options,
    correctAnswer: correctIdx,
    explanation: `“${c.char}”的正确拼音是 ${c.pinyin}。`,
    gradeId: c.gradeId,
    difficulty: "easy",
  };
}

// B. 词语识别题
function buildWordRecognitionQuestion(
  w: WordItem,
  wordPool: string[]
): ExamQuestion | null {
  if (!w.word) return null;
  const distractors = pickDistractors(
    wordPool,
    w.word,
    3
  );
  if (distractors.length < 2) return null;
  const options = shuffle([w.word, ...distractors]);
  const correctIdx = options.indexOf(w.word);
  return {
    id: `q-word-${w.id}`,
    category: "word",
    type: "choice",
    question: `下面哪个词语出现在本课？`,
    options,
    correctAnswer: correctIdx,
    explanation: `“${w.word}”是本课课文中的词语。`,
    gradeId: w.gradeId,
    difficulty: "easy",
  };
}

// C. 重点句子题
function buildSentenceQuestion(
  s: SentenceItem,
  sentencePool: string[],
  lessonTitle: string
): ExamQuestion | null {
  if (!s.originalText) return null;
  const distractors = pickDistractors(
    sentencePool,
    s.originalText,
    3
  );
  if (distractors.length < 2) return null;
  const options = shuffle([
    s.originalText,
    ...distractors,
  ]);
  const correctIdx = options.indexOf(s.originalText);
  const titlePart = lessonTitle
    ? `《${lessonTitle}》`
    : "本课";
  return {
    id: `q-sentence-${s.id}`,
    category: "sentence",
    type: "choice",
    question: `下面哪一句是${titlePart}中的重点句子？`,
    options,
    correctAnswer: correctIdx,
    explanation: `该句选自${titlePart}。`,
    gradeId: s.gradeId,
    difficulty: "medium",
  };
}

/**
 * 生成一份教材测验题目.
 *
 * - 题目类型按 chars/words/sentences 数量比例分配
 * - 同一 sourceId (tc-, tw-, ts- 前缀) 在一份试卷中只出一次
 * - 选项数 3~4 个, 数据不足时减少为 3 个
 * - 题目顺序随机
 * - 数据不足以生成 10 题时, 返回所有可生成题数, 不编造
 */
export function generateExamQuestions(
  opts: GenerateOptions
): ExamQuestion[] {
  const {
    characters,
    words,
    sentences,
    lessonTitle,
  } = opts;

  // 收集本课拼音 + 外部拼音池作为干扰项来源
  const lessonPinyinPool = characters
    .map((c) => c.pinyin)
    .filter((p): p is string => !!p);
  const pinyinPool = uniq([
    ...lessonPinyinPool,
    ...(opts.distractorPinyinPool || []),
  ]);

  // 本课词语字符串 + 外部词语池作为干扰项来源
  const lessonWordPool = words.map((w) => w.word);
  const wordPool = uniq([
    ...lessonWordPool,
    ...(opts.distractorWordPool || []),
  ]);

  // 本课句子字符串 + 外部句子池作为干扰项来源
  const lessonSentencePool = sentences.map(
    (s) => s.originalText
  );
  const sentencePool = uniq([
    ...lessonSentencePool,
    ...(opts.distractorSentencePool || []),
  ]);

  // 各类型候选题目 (内部已 shuffle 不需要再洗, 但来源已去重)
  const charCandidates = characters
    .map((c) =>
      buildCharacterPinyinQuestion(c, pinyinPool)
    )
    .filter((q): q is ExamQuestion => !!q);

  const wordCandidates = words
    .map((w) =>
      buildWordRecognitionQuestion(w, wordPool)
    )
    .filter((q): q is ExamQuestion => !!q);

  const sentenceCandidates = sentences
    .map((s) =>
      buildSentenceQuestion(
        s,
        sentencePool,
        lessonTitle
      )
    )
    .filter((q): q is ExamQuestion => !!q);

  // 按比例分配题数 (chars:words:sentences = 实际数量比例)
  const totalAvailable =
    charCandidates.length +
    wordCandidates.length +
    sentenceCandidates.length;
  if (totalAvailable === 0) return [];

  const target = Math.min(
    TARGET_QUESTION_COUNT,
    totalAvailable
  );

  // 简化分配: 各类型按比例取整, 剩余名额给候选最多的类型
  const ratio = (n: number) =>
    Math.floor((n / totalAvailable) * target);

  let charN = ratio(charCandidates.length);
  let wordN = ratio(wordCandidates.length);
  let sentN = ratio(sentenceCandidates.length);
  let used = charN + wordN + sentN;
  // 把剩余名额依次给候选最多的类型
  const deficits: Array<
    "char" | "word" | "sent"
  > = ["char", "word", "sent"].sort((a, b) => {
    const ar =
      a === "char"
        ? charCandidates.length
        : a === "word"
        ? wordCandidates.length
        : sentenceCandidates.length;
    const br =
      b === "char"
        ? charCandidates.length
        : b === "word"
        ? wordCandidates.length
        : sentenceCandidates.length;
    return br - ar;
  }) as Array<"char" | "word" | "sent">;

  let i = 0;
  while (used < target && i < deficits.length) {
    const k = deficits[i];
    if (k === "char" && charN < charCandidates.length) {
      charN++;
      used++;
    } else if (
      k === "word" &&
      wordN < wordCandidates.length
    ) {
      wordN++;
      used++;
    } else if (
      k === "sent" &&
      sentN < sentenceCandidates.length
    ) {
      sentN++;
      used++;
    } else {
      i++;
    }
  }

  const picked: ExamQuestion[] = [
    ...shuffle(charCandidates).slice(0, charN),
    ...shuffle(wordCandidates).slice(0, wordN),
    ...shuffle(sentenceCandidates).slice(0, sentN),
  ];

  return shuffle(picked);
}
