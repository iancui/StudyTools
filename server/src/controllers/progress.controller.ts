import {
  Response,
} from "express";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

import {
  getProgress,
  updateProgress,
} from "../services/progress.service.js";

// GET /api/progress
// 返回当前登录用户的 user_progress 摘要 (按 user_progress 表实际字段).
// user_id 强制从 JWT 获取, 严禁客户端指定.
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

    const data = await getProgress(
      req.user.id
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Get progress error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "获取学习进度失败",
    });
  }
}

// PUT /api/progress
// 用请求体中的摘要字段 upsert 当前登录用户的 user_progress 行.
// user_id 同样强制从 JWT 获取, 请求体中即使带 user_id 也会被忽略.
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
      (req.body as Record<string, unknown>) ||
      {};

    const data = await updateProgress(
      req.user.id,
      body
    );

    res.json({
      success: true,
      message: "进度同步成功",
      data,
    });
  } catch (error) {
    console.error(
      "Update progress error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "更新学习进度失败";

    res.status(400).json({
      success: false,
      message,
    });
  }
}
