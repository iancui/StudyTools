// 墨韵中文 前端 学习行为记录 统一类型
// ============================================================
//
// 工单 15: 学习行为记录基础.
//
// 设计原则:
//   - 只在真正产生练习/答题结果时记录 (打开页面 / 朗读 / 查看答案 / 切换下一题 不算)
//   - itemId 保持原教材格式 (tc-xxx / tw-xxx / ts-xxx), 不做 ID 转换
//   - 不携带 userId, 后端必须从 JWT 解析
//   - 失败不阻断学习流程 (调用方自行 try/catch + console.warn)
//   - 防重复: 由调用方在用户单次明确动作 (click / submit) 时调用一次,
//     不放进普通 useEffect, 避免 StrictMode 双调用.

/** 一次练习/答题结果 */
export type PracticeResult = "correct" | "wrong";

/** 学习行为类型, 用于区分生字 / 词语 / 句子 */
export type PracticeItemKind = "character" | "word" | "sentence";

/** 一条学习行为记录请求体 */
export interface PracticeEvent {
  /** 教材项目 ID, 例如 tc-1 / tw-1 / ts-1 */
  itemId: string;
  /** 本次答题结果 */
  result: PracticeResult;
}
