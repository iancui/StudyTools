import {
  Response,
} from "express";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

import {
  getSentenceProgress,
  recordSentencePracticeEvent,
  updateSentenceProgress,
} from "../services/sentence-progress.service.js";

export async function get(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "未登录",
      });
    }

    const data = await getSentenceProgress(
      req.user.id
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Get sentence progress error:",
      error
    );
    res.status(500).json({
      success: false,
      message: "获取句子学习记录失败",
    });
  }
}

export async function update(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "未登录",
      });
    }

    const body =
      (req.body as Record<string, unknown>) || {};

    const data = await updateSentenceProgress(
      req.user.id,
      body
    );

    res.json({
      success: true,
      message: "句子进度同步成功",
      data,
    });
  } catch (error) {
    console.error(
      "Update sentence progress error:",
      error
    );
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "更新句子学习记录失败",
    });
  }
}

// POST /api/progress/sentences/practice
// body: { itemId: string, result: "correct" | "wrong" }
// 工单 15: 记录一次句子练习事件. 行为与生字/词语一致.
export async function record(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "未登录",
      });
    }

    const body =
      (req.body as Record<string, unknown>) || {};

    const data = await recordSentencePracticeEvent(
      req.user.id,
      body
    );

    res.json({
      success: true,
      message: "已记录练习",
      data,
    });
  } catch (error) {
    console.error(
      "Record sentence practice error:",
      error
    );
    const message =
      error instanceof Error
        ? error.message
        : "记录练习失败";
    const status =
      message.includes("缺少") ||
      message.includes("必须是")
        ? 400
        : 500;
    res.status(status).json({
      success: false,
      message,
    });
  }
}
