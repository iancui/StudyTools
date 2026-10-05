// 墨韵中文 前端 教材数据接入 Hook
// ============================================================
//
// 工单 06: 把 API 教材数据接入现有的 CharacterModule / WordModule /
// SentenceModule.
//
// 设计原则:
//   1. 复用现有 CharacterItem / WordItem / SentenceItem 类型,
//      不修改 types/chinese.ts, 不破坏现有组件.
//   2. API DTO 字段比 CharacterItem 少很多 (数据库只有 character_text/
//      pinyin/char_role/sort_order). 缺的字段用合理默认值占位,
//      保证组件能渲染但不显示假数据 (空数组 / "-" / 0 等).
//   3. 只在用户主动选择"三年级 + 上册 + 第 N 课"时才走 API 路径;
//      其他年级继续用原 curriculum 本地数据.
//   4. 只读, 不写 user_progress 等业务表.
//   5. API 失败时显示错误提示但不阻塞页面渲染 (loading=false, error=消息).

import { useEffect, useState } from "react";

import {
  CharacterDTO,
  LessonDTO,
  SentenceDTO,
  WordDTO,
  getLesson,
  listCharacters,
  listLessons,
  listSentences,
  listWords,
} from "../api/textbook";
import {
  CharacterItem,
  GradeId,
  SentenceItem,
  WordItem,
} from "../types/chinese";

// 数据库实际值 (与 schema 一致, 不要改格式)
const TEXTBOOK_GRADE = "三年级";
const TEXTBOOK_TERM = "上册";

// ------------------------------------------------------------
// 1. 课程列表 hook
// ------------------------------------------------------------

export interface UseTextbookLessonsResult {
  lessons: LessonDTO[];
  loading: boolean;
  error: string | null;
}

/**
 * 加载三年级上册的课程列表 (5 课).
 *
 * 仅在 gradeId === 'g3' 时启用, 其他年级返回空数组 (走原 curriculum).
 */
export function useTextbookLessons(
  gradeId: GradeId
): UseTextbookLessonsResult {
  const [lessons, setLessons] = useState<LessonDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 只在三年级时拉取教材课程; 其他年级返回空, 由 App 走原 curriculum
    if (gradeId !== "g3") {
      setLessons([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    listLessons({ grade: TEXTBOOK_GRADE, term: TEXTBOOK_TERM })
      .then((data) => {
        if (cancelled) return;
        setLessons(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("加载教材课程列表失败:", err);
        setError(
          err instanceof Error
            ? err.message
            : "加载教材课程列表失败"
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [gradeId]);

  return { lessons, loading, error };
}

// ------------------------------------------------------------
// 2. 单课内容 hook (chars / words / sentences)
// ------------------------------------------------------------

export interface TextbookLessonContent {
  characters: CharacterItem[];
  words: WordItem[];
  sentences: SentenceItem[];
  lesson: LessonDTO | null;
}

export interface UseTextbookLessonContentResult {
  data: TextbookLessonContent;
  loading: boolean;
  error: string | null;
}

const EMPTY_CONTENT: TextbookLessonContent = {
  characters: [],
  words: [],
  sentences: [],
  lesson: null,
};

/**
 * 加载某课的 chars/words/sentences, 并转成 CharacterItem/WordItem/
 * SentenceItem. 三个请求并行.
 *
 * lessonId 为 null 时不发请求, 返回空内容.
 */
export function useTextbookLessonContent(
  lessonId: string | null
): UseTextbookLessonContentResult {
  const [data, setData] = useState<TextbookLessonContent>(
    EMPTY_CONTENT
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) {
      setData(EMPTY_CONTENT);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      getLesson(lessonId),
      listCharacters(lessonId),
      listWords(lessonId),
      listSentences(lessonId),
    ])
      .then(([lesson, chars, words, sentences]) => {
        if (cancelled) return;
        setData({
          lesson,
          characters: chars.map(toCharacterItem),
          words: words.map((w) => toWordItem(w, lesson)),
          sentences: sentences.map((s) => toSentenceItem(s, lesson)),
        });
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("加载教材课程内容失败:", err);
        setError(
          err instanceof Error
            ? err.message
            : "加载教材课程内容失败"
        );
        setData(EMPTY_CONTENT);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  return { data, loading, error };
}

// ------------------------------------------------------------
// 3. DTO → Item 转换 (保留组件兼容性, 缺字段用合理默认值)
// ------------------------------------------------------------

function toCharacterItem(
  dto: CharacterDTO
): CharacterItem {
  return {
    id: `tc-${dto.id}`,
    char: dto.characterText,
    pinyin: dto.pinyin || "",
    // 数据库没有这些字段, 用空值占位 (不展示假数据)
    radical: "-",
    strokeCount: 0,
    strokeOrderHint: "数据库未提供笔顺数据",
    structure: "-",
    meanings: [],
    phrases: [],
    exampleSentence: "",
    phoneticTrap: undefined,
    gradeId: "g3",
  };
}

function toWordItem(
  dto: WordDTO,
  lesson: LessonDTO | null
): WordItem {
  return {
    id: `tw-${dto.id}`,
    word: dto.wordText,
    pinyin: "",
    pos: "词语",
    definition: lesson
      ? `来自《${lesson.title}》`
      : "来自教材",
    synonyms: [],
    antonyms: [],
    exampleSentence: "",
    gradeId: "g3",
  };
}

function toSentenceItem(
  dto: SentenceDTO,
  lesson: LessonDTO | null
): SentenceItem {
  return {
    id: `ts-${dto.id}`,
    // 数据库的 sentence_type 是 '重点句' 等, 不直接映射到现有
    // category 枚举, 统一归为 'rhetoric' (修辞赏析) 便于页面展示.
    category: "rhetoric",
    categoryLabel: dto.sentenceType || "重点句",
    title: lesson ? `《${lesson.title}》重点句` : "教材重点句",
    originalText: dto.sentenceText,
    analysis: lesson
      ? `选自三年级上册《${lesson.title}》`
      : "选自教材",
    modernTranslation: undefined,
    keyDevices: [],
    practicePrompt: "请仿写本句的修辞手法",
    practiceAnswer: "",
    gradeId: "g3",
  };
}
