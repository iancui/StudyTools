// 英语辞书 service
// ------------------------------------------------------------
// 工单: 英语学习 V1 - 辞书基础
//
// 职责:
//   - 列出当前用户的辞书 (按 created_at 倒序)
//   - 查询单个辞书详情 (校验 user_id 归属)
//   - 列出辞书内全部单词
//   - 导入辞书: CSV 文本解析 + 校验 + 去重 + 写库
//
// userId 来自上层 controller (从 JWT 提取), 此层不再读取 JWT,
// 不信任客户端传入 userId.
//
// CSV 字段固定: word,meaning,phonetic,pos,phonics
// 校验规则:
//   - word 必填
//   - meaning 必填
//   - phonetic / pos / phonics 允许空
//   - 空行跳过
//   - 相同 word 在同一辞书内去重 (大小写敏感)
//
// 不依赖任何第三方 CSV 库, 手写极简解析:
//   - 不支持引号包裹 (辞书导入字段不会包含逗号)
//   - 不支持换行符出现在字段内
//   - 仅按行 + 逗号切分, 满足本工单需求

import {
  CreateDictionaryInput,
  EnglishDictionaryRow,
  EnglishWordRow,
  ImportWordRow,
  createDictionaryWithWords,
  findDictionaryByIdAndUser,
  findDictionariesByUser,
  findWordsByDictionary,
} from "../repositories/english-dictionary.repository.js";

// ------------------------------------------------------------
// DTO
// ------------------------------------------------------------

export interface EnglishDictionaryDTO {
  id: number;
  name: string;
  description: string | null;
  wordCount: number;
  createdAt: string;
}

export interface EnglishWordDTO {
  id: number;
  word: string;
  meaning: string;
  phonetic: string | null;
  pos: string | null;
  phonics: string | null;
  sortOrder: number;
  createdAt: string;
}

function toDictionaryDTO(
  row: EnglishDictionaryRow
): EnglishDictionaryDTO {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    wordCount: row.word_count,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function toWordDTO(row: EnglishWordRow): EnglishWordDTO {
  return {
    id: row.id,
    word: row.word,
    meaning: row.meaning,
    phonetic: row.phonetic,
    pos: row.pos,
    phonics: row.phonics,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

// ------------------------------------------------------------
// 查询
// ------------------------------------------------------------

export async function listDictionaries(
  userId: number
): Promise<EnglishDictionaryDTO[]> {
  const rows = await findDictionariesByUser(userId);
  return rows.map(toDictionaryDTO);
}

export async function getDictionary(
  userId: number,
  dictionaryId: number
): Promise<EnglishDictionaryDTO | null> {
  const row = await findDictionaryByIdAndUser(
    dictionaryId,
    userId
  );
  return row ? toDictionaryDTO(row) : null;
}

export async function listWords(
  userId: number,
  dictionaryId: number
): Promise<EnglishWordDTO[]> {
  // 先校验辞书归属, 不让用户看到他人辞书的单词.
  const dict = await findDictionaryByIdAndUser(
    dictionaryId,
    userId
  );
  if (!dict) {
    return [];
  }
  const rows = await findWordsByDictionary(dictionaryId);
  return rows.map(toWordDTO);
}

// ------------------------------------------------------------
// 导入
// ------------------------------------------------------------

export interface ImportResult {
  dictionaryId: number;
  dictionaryName: string;
  importedCount: number;
  skippedCount: number;
}

export interface ImportInput {
  name: string;
  description: string | null;
  csvText: string;
}

const MAX_WORDS = 5000;
const MAX_WORD_LEN = 200;
const MAX_MEANING_LEN = 500;

/** 极简 CSV 行解析: 仅按逗号切分, 不支持引号包裹 */
function parseCsvLine(line: string): string[] {
  return line.split(",");
}

/** 校验并解析一段 CSV 文本, 返回待入库行 + 跳过数 */
function parseAndValidateCsv(
  csvText: string
): { rows: ImportWordRow[]; skipped: number } {
  const lines = csvText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n");

  const rows: ImportWordRow[] = [];
  let skipped = 0;
  // 同一导入批次内 word 去重 (大小写敏感, 与 DB UNIQUE KEY 一致).
  const seen = new Set<string>();

  let headerChecked = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];

    // 空行跳过 (trim 后为空)
    if (!raw || raw.trim() === "") {
      skipped++;
      continue;
    }

    const fields = parseCsvLine(raw).map((s) => s.trim());

    // 兼容首行表头: word,meaning,phonetic,pos,phonics
    // 仅在第一行有效数据行检测一次. 如果 word 字段就是 "word"
    // 字符串本身, 视为表头跳过.
    if (!headerChecked) {
      headerChecked = true;
      if (
        fields.length >= 2 &&
        fields[0].toLowerCase() === "word" &&
        fields[1].toLowerCase() === "meaning"
      ) {
        skipped++;
        continue;
      }
    }

    // 至少需要 word + meaning
    if (fields.length < 2) {
      skipped++;
      continue;
    }

    const word = fields[0];
    const meaning = fields[1];
    const phonetic = fields[2] || "";
    const pos = fields[3] || "";
    const phonics = fields[4] || "";

    // word 必填
    if (!word) {
      skipped++;
      continue;
    }
    // meaning 必填
    if (!meaning) {
      skipped++;
      continue;
    }
    if (word.length > MAX_WORD_LEN) {
      skipped++;
      continue;
    }
    if (meaning.length > MAX_MEANING_LEN) {
      skipped++;
      continue;
    }

    // 同批次去重
    if (seen.has(word)) {
      skipped++;
      continue;
    }
    seen.add(word);

    rows.push({
      word,
      meaning,
      phonetic: phonetic || null,
      pos: pos || null,
      phonics: phonics || null,
      sortOrder: rows.length,
    });

    if (rows.length >= MAX_WORDS) {
      // 超过上限的剩余行视为跳过
      break;
    }
  }

  return { rows, skipped };
}

/**
 * 导入辞书.
 *
 * 流程:
 *   1. 校验 name 必填
 *   2. 解析 CSV 文本 (本批次内 word 去重)
 *   3. 调用 repository 在事务内创建辞书 + 批量 INSERT IGNORE 单词
 *   4. DB UNIQUE KEY uk_dict_word 兜底去重 (若并发导入同一 word)
 *
 * 返回: dictionaryId, importedCount, skippedCount
 */
export async function importDictionary(
  userId: number,
  input: ImportInput
): Promise<ImportResult> {
  const name = (input.name || "").trim();
  if (!name) {
    throw new Error("辞书名称不能为空");
  }
  if (name.length > 200) {
    throw new Error("辞书名称过长, 请控制在 200 字以内");
  }

  const description =
    (input.description || "").trim().slice(0, 500) || null;

  const csvText = (input.csvText || "").trim();
  if (!csvText) {
    throw new Error("CSV 内容不能为空");
  }

  const { rows, skipped } = parseAndValidateCsv(csvText);

  if (rows.length === 0) {
    // 没有任何有效行, 不创建辞书
    throw new Error(
      "CSV 中没有有效单词, 请检查格式 (word,meaning,phonetic,pos,phonics)"
    );
  }

  const createInput: CreateDictionaryInput = {
    userId,
    name,
    description,
  };

  const { dictionaryId, importedCount } =
    await createDictionaryWithWords(createInput, rows);

  // skipped 包含: 空行 + 表头 + 缺字段 + 同批次重复 + DB 已存在的重复
  // 这里把 DB 兜底跳过的也算到 skipped 里.
  const totalSkipped =
    skipped + (rows.length - importedCount);

  return {
    dictionaryId,
    dictionaryName: name,
    importedCount,
    skippedCount: totalSkipped,
  };
}
