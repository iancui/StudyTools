import {
  Response,
} from "express";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

import {
  getSentenceProgress,
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
