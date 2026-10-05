// 墨韵中文 前端 教材数据接入 Hook
// ============================================================
//
// 工单 06: 把 API 教材数据接入现有的 CharacterModule / WordModule /
// SentenceModule.
// 工单 07A: 稳定 ID 对接 — 验证当前 ID 生成满足"稳定 + 唯一 +
//           识字/写字区分"要求, 加固注释便于 07B 维护.
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
//
// ------------------------------------------------------------
// ID 设计原则 (工单 07A)
// ------------------------------------------------------------
// 生成方式:
//   - character item.id = `tc-${dto.id}`     (dto.id 是 textbook_characters.id)
//   - word item.id      = `tw-${dto.id}`     (dto.id 是 textbook_words.id)
//   - sentence item.id  = `ts-${dto.id}`     (dto.id 是 textbook_sentences.id)
//
// 满足工单 07A 的所有要求:
//   ✅ 稳定: dto.id 是数据库 PK (自增整数), 同一条记录每次加载 id 都相同.
//   ✅ 不使用随机/时间戳: 完全由数据库 PK 决定, 不调用 Math.random / Date.now.
//   ✅ 优先使用数据库已有稳定 ID: 直接拼字符串前缀 + dto.id.
//   ✅ string 类型: 模板字面量 `tc-${dto.id}` 隐式 String() 转换,
//      与 CharacterItem.id / WordItem.id / SentenceItem.id 类型一致,
//      与 user_*_progress.*_id 数据库字段 (varchar) 兼容.
//   ✅ 全局唯一: textbook_characters.id / textbook_words.id /
//      textbook_sentences.id 都是大表 PK, 跨课程跨年级都唯一.
//   ✅ 识字/写字区分: character 表同一文字同时存在识字 + 写字两条记录时,
//      它们的 PK 不同 (例: 第1课"扬"字识字 id=3 / 写字 id=12),
//      所以生成的 item.id 自然不同 (`tc-3` vs `tc-12`),
//      满足工单第 6 条要求. charRole 字段单独保留在 DTO 上,
//      UI 需要时可在转换时附到 char/exampleSentence 等位置展示,
//      不需要塞进 ID.
//   ✅ 不与原 curriculum 数据冲突: 原 curriculum 用 `c-g3-1` / `w-g3-1` /
//      `s-g3-1` 格式, 教材 ID 用 `tc-` / `tw-` / `ts-` 前缀, 完全分离.
//
// 07B 对接说明:
//   07B 把 masteredCharacterIds / masteredWordIds / completedSentenceIds
//   写入 user_*_progress 表时, 直接用 `tc-${id}` / `tw-${id}` / `ts-${id}`
//   作为 characterId / wordId / sentenceId 即可.
//   服务端如需回查 textbook_*.id, 从前缀 `tc-` / `tw-` / `ts-` 解析出
//   数字部分. 当前 07A 不实现服务端解析, 留给 07B 处理.


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
// 4. 多课程内容聚合 hook (工单 13: 复习范围选择)
// ------------------------------------------------------------
//
// 用于"复习范围"功能: 传入一组 lessonId, 并行拉取每课的
// chars/words/sentences, 聚合成统一的 CharacterItem[] /
// WordItem[] / SentenceItem[]. 数据范围严格按 lessonIds 过滤,
// "期中复习"只包含前半段课程, "期末复习"包含全部已存在课程.
//
// 复用 toCharacterItem / toWordItem / toSentenceItem 转换函数,
// 不引入新依赖, 不修改数据库.

export interface UseTextbookMultiLessonsContentResult {
  data: TextbookLessonContent;
  loading: boolean;
  error: string | null;
}

/**
 * 加载多课内容, 聚合成统一的 chars/words/sentences.
 * lessonIds 为空数组时不发请求, 返回空内容.
 */
export function useTextbookMultiLessonsContent(
  lessonIds: string[]
): UseTextbookMultiLessonsContentResult {
  const [data, setData] = useState<TextbookLessonContent>(
    EMPTY_CONTENT
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 把 lessonIds 数组序列化成稳定字符串作为依赖, 避免数组引用变化触发重复请求.
  const key = lessonIds.join(",");

  useEffect(() => {
    if (!key) {
      setData(EMPTY_CONTENT);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const ids = key.split(",").filter(Boolean);

    // 为每个 lessonId 并行拉取 4 个资源, 然后合并.
    const lessonPromises = ids.map((id) =>
      Promise.all([
        getLesson(id),
        listCharacters(id),
        listWords(id),
        listSentences(id),
      ]).then(([lesson, chars, words, sentences]) => ({
        lesson,
        chars: chars.map(toCharacterItem),
        words: words.map((w) => toWordItem(w, lesson)),
        sentences: sentences.map((s) => toSentenceItem(s, lesson)),
      }))
    );

    Promise.all(lessonPromises)
      .then((results) => {
        if (cancelled) return;
        // 聚合所有课程的内容. lesson 取第一个非空作为代表 (用于 ReviewMode 的 lessonTitle).
        const merged: TextbookLessonContent = {
          characters: results.flatMap((r) => r.chars),
          words: results.flatMap((r) => r.words),
          sentences: results.flatMap((r) => r.sentences),
          lesson:
            results.find((r) => r.lesson)?.lesson ?? null,
        };
        setData(merged);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("加载多课教材内容失败:", err);
        setError(
          err instanceof Error
            ? err.message
            : "加载多课教材内容失败"
        );
        setData(EMPTY_CONTENT);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return { data, loading, error };
}

// ------------------------------------------------------------
// 3. DTO → Item 转换 (保留组件兼容性, 缺字段用合理默认值)
//
// ID 生成 (工单 07A, 详见文件头注释):
//   - character: `tc-${dto.id}` (dto.id = textbook_characters.id, 数据库 PK)
//   - word:      `tw-${dto.id}` (dto.id = textbook_words.id, 数据库 PK)
//   - sentence:  `ts-${dto.id}` (dto.id = textbook_sentences.id, 数据库 PK)
//
// 不调用 Math.random / Date.now / nanoid, 同一条数据库记录每次加载
// 都得到完全相同的字符串 ID, 满足 07A "稳定 + 唯一" 要求.
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
