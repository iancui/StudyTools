import {
  Response,
} from "express";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

import {
  getWordProgress,
  recordWordPracticeEvent,
  updateWordProgress,
} from "../services/word-progress.service.js";

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

    const data = await getWordProgress(
      req.user.id
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Get word progress error:",
      error
    );
    res.status(500).json({
      success: false,
      message: "获取词语学习记录失败",
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

    const data = await updateWordProgress(
      req.user.id,
      body
    );

    res.json({
      success: true,
      message: "词语进度同步成功",
      data,
    });
  } catch (error) {
    console.error(
      "Update word progress error:",
      error
    );
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "更新词语学习记录失败",
    });
  }
}

// POST /api/progress/words/practice
// body: { itemId: string, result: "correct" | "wrong" }
// 工单 15: 记录一次词语练习事件. 行为与生字一致.
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

    const data = await recordWordPracticeEvent(
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
      "Record word practice error:",
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
