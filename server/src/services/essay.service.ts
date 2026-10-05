// 句子仿写 service
// ------------------------------------------------------------
// 工单 12: 句子仿写基础闭环.
// 接收前端提交的仿写内容 + 原句, 进行规则批改 (非 AI),
// 写入 essay_practices 表, 返回评分 + 反馈.
//
// userId 来自上层 controller (从 JWT 提取), 此层不再重新读取 JWT.
// 不信任客户端传入 userId / score / feedback, 全部由后端计算.

import {
  InsertEssayPracticeInput,
  insertEssayPractice,
} from "../repositories/essay.repository.js";

// 客户端提交的仿写 payload
export interface SaveEssayPracticeInput {
  title?: string | null; // 仿写题目标题 (如 "句子仿写")
  prompt?: string | null; // 原句 / 仿写要求
  content: string; // 用户输入的仿写内容
}

// 写库 + 批改后返回 DTO
export interface SavedEssayPracticeDTO {
  id: number;
  userId: number;
  title: string | null;
  prompt: string | null;
  content: string;
  wordCount: number;
  score: number;
  feedback: string;
  status: string;
  createdAt: string;
}

// 批改结果 (内部中间结构)
interface GradingResult {
  score: number;
  feedback: string;
  wordCount: number;
}

/**
 * 规则批改 (非 AI).
 * --------------------------------------------------------
 * 第一阶段批改规则 (工单 12 要求, 不引入 Gemini/OpenAI):
 *   1. 内容不能为空 (空 → 0 分)
 *   2. 字数达标: 至少 8 个汉字 (太短 → 50 分)
 *   3. 与原句结构相似: 检查标点 / 句式 (基础加分)
 *   4. 内容完整有意义: 检查是否有重复字符 / 乱码 (扣分)
 *   5. 字数越接近原句长度, 得分越高
 *
 * 评分区间 0~100. 反馈给出 1-3 条文字建议.
 */
function gradeImitation(
  content: string,
  prompt: string | null
): GradingResult {
  const trimmed = content.trim();
  // 1. 计算汉字数量 (排除标点和空白)
  const hanChars = trimmed.match(/[\u4e00-\u9fff]/g) || [];
  const wordCount = hanChars.length;

  // 2. 空内容
  if (wordCount === 0) {
    return {
      score: 0,
      feedback:
        "内容为空, 请根据原句仿写后再提交.",
      wordCount: 0,
    };
  }

  // 3. 字数过少
  if (wordCount < 8) {
    return {
      score: 50,
      feedback:
        "仿写内容过短, 请尽量保持与原句相近的长度, 并加入具体描写.",
      wordCount,
    };
  }

  let score = 70; // 基础分: 内容完整且字数达标
  const suggestions: string[] = [];

  // 4. 与原句长度对比 (若提供原句)
  if (prompt) {
    const promptHan = prompt.match(/[\u4e00-\u9fff]/g) || [];
    const promptCount = promptHan.length;
    if (promptCount > 0) {
      const ratio = wordCount / promptCount;
      if (ratio >= 0.8 && ratio <= 1.5) {
        score += 10; // 长度匹配原句, 加分
      } else if (ratio < 0.8) {
        suggestions.push(
          "仿写比原句短, 可以再补充细节使内容更丰富."
        );
      } else {
        suggestions.push(
          "仿写比原句长较多, 注意保持简洁, 突出重点."
        );
      }
    }

    // 5. 检查是否包含原句中的核心结构词 (基础句式相似度)
    // 例如原句 "...不...了, ...不...了" 这类排比结构
    const promptHasNegPattern = /不.{0,4}[了动]/.test(prompt);
    const contentHasNegPattern = /不.{0,4}[了动]/.test(trimmed);
    if (promptHasNegPattern && contentHasNegPattern) {
      score += 10; // 保持原句否定结构, 加分
    } else if (promptHasNegPattern && !contentHasNegPattern) {
      suggestions.push(
        "可以尝试保持原句的否定式排比结构, 使仿写更贴近原句风格."
      );
    }
  }

  // 6. 标点检查 (有标点说明更完整)
  const hasPunctuation = /[。，；！？、,.;!?]/.test(trimmed);
  if (hasPunctuation) {
    score += 5;
  } else {
    suggestions.push(
      "建议在仿写中加入适当的标点符号, 让句子更完整."
    );
  }

  // 7. 检查重复字符 (乱码 / 单字重复)
  const repeated = trimmed.match(/(.)\1{4,}/);
  if (repeated) {
    score -= 10;
    suggestions.push(
      "避免单个字符连续重复, 请写出有意义的句子."
    );
  }

  // 8. 上限 100
  if (score > 100) score = 100;
  if (score < 0) score = 0;

  // 9. 生成反馈文本
  const highlights: string[] = [];
  if (wordCount >= 8) {
    highlights.push("内容完整");
  }
  if (hasPunctuation) {
    highlights.push("使用了标点符号");
  }
  if (prompt) {
    const promptHan = prompt.match(/[\u4e00-\u9fff]/g) || [];
    if (promptHan.length > 0) {
      const ratio = wordCount / promptHan.length;
      if (ratio >= 0.8 && ratio <= 1.5) {
        highlights.push("基本保持了原句长度");
      }
    }
  }

  const parts: string[] = [];
  if (highlights.length > 0) {
    parts.push(highlights.join(" / "));
  }
  if (suggestions.length > 0) {
    parts.push(suggestions.join(" "));
  } else if (score >= 85) {
    parts.push("整体表现优秀, 继续保持.");
  }

  return {
    score,
    feedback: parts.join(" | ") || "仿写已提交.",
    wordCount,
  };
}

/**
 * saveEssayPractice: 校验 → 规则批改 → 写库 → 返回 DTO.
 *
 * 严格校验:
 *   - content 不能为空
 *   - userId 由上层 controller 传入, 不信任客户端
 *   - score / feedback 由后端 gradeImitation 计算, 忽略客户端传值
 */
export async function saveEssayPractice(
  userId: number,
  raw: SaveEssayPracticeInput
): Promise<SavedEssayPracticeDTO> {
  const content =
    typeof raw.content === "string" ? raw.content.trim() : "";
  if (content.length === 0) {
    throw new Error("仿写内容不能为空");
  }
  if (content.length > 5000) {
    throw new Error("仿写内容过长, 请控制在 5000 字以内");
  }

  const title =
    typeof raw.title === "string" && raw.title.trim().length > 0
      ? raw.title.trim().slice(0, 200)
      : null;
  const prompt =
    typeof raw.prompt === "string" && raw.prompt.trim().length > 0
      ? raw.prompt.trim().slice(0, 2000)
      : null;

  // 后端独立批改, 不信任客户端传的 score/feedback.
  const grading = gradeImitation(content, prompt);

  const input: InsertEssayPracticeInput = {
    userId,
    title,
    prompt,
    content,
    wordCount: grading.wordCount,
    score: grading.score,
    feedback: grading.feedback,
    status: "graded",
  };

  const id = await insertEssayPractice(input);

  return {
    id,
    userId,
    title,
    prompt,
    content,
    wordCount: grading.wordCount,
    score: grading.score,
    feedback: grading.feedback,
    status: "graded",
    createdAt: new Date().toISOString(),
  };
}
