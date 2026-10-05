// 墨韵中文 前端 学习行为记录 API Client
// ============================================================
//
// 工单 15: POST /api/progress/{characters,words,sentences}/practice
//
// 设计原则:
//   - 客户端只发送 { itemId, result }, 不发送 userId / practiceCount /
//     correctCount / wrongCount. 累计统计由后端自己做, 不信任客户端.
//   - itemId 保持原教材格式 (tc-xxx / tw-xxx / ts-xxx), 不做转换.
//   - 失败由调用方 try/catch + console.warn, 不阻断学习.

import { apiPost } from "./client";
import type {
  PracticeEvent,
  PracticeItemKind,
} from "../types/practice";
import type {
  CharacterProgressDTO,
  WordProgressDTO,
  SentenceProgressDTO,
} from "./detailedProgress";

// ------------------------------------------------------------
// 路径映射
// ------------------------------------------------------------

function pathForKind(
  kind: PracticeItemKind
): string {
  switch (kind) {
    case "character":
      return "/progress/characters/practice";
    case "word":
      return "/progress/words/practice";
    case "sentence":
      return "/progress/sentences/practice";
  }
}

// ------------------------------------------------------------
// 单条练习事件上报
// ------------------------------------------------------------

/**
 * 上报一次练习结果. 后端自增 practice_count + (correct_count | wrong_count),
 * 并刷新 last_practiced_at. 记录不存在时自动 INSERT.
 *
 * 注意: 调用方必须自行 try/catch, 失败不阻断学习.
 */
export function recordCharacterPractice(
  accessToken: string,
  event: PracticeEvent
): Promise<CharacterProgressDTO> {
  return apiPost<CharacterProgressDTO>(
    pathForKind("character"),
    event,
    { accessToken }
  );
}

export function recordWordPractice(
  accessToken: string,
  event: PracticeEvent
): Promise<WordProgressDTO> {
  return apiPost<WordProgressDTO>(
    pathForKind("word"),
    event,
    { accessToken }
  );
}

export function recordSentencePractice(
  accessToken: string,
  event: PracticeEvent
): Promise<SentenceProgressDTO> {
  return apiPost<SentenceProgressDTO>(
    pathForKind("sentence"),
    event,
    { accessToken }
  );
}
