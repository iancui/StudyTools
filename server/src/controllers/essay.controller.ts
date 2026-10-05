// 句子仿写 controller
// ------------------------------------------------------------
// POST /api/essays/practices
// 提交一次句子仿写, 后端规则批改后写入 essay_practices.
// user_id 强制从 JWT (req.user.id) 获取, 不允许客户端指定 user_id.

import {
  Response,
} from "express";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

import {
  SaveEssayPracticeInput,
  saveEssayPractice,
} from "../services/essay.service.js";

// POST /api/essays/practices
export async function create(
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

    const payload: SaveEssayPracticeInput = {
      title:
        typeof body.title === "string"
          ? body.title
          : null,
      prompt:
        typeof body.prompt === "string"
          ? body.prompt
          : null,
      content:
        typeof body.content === "string"
          ? body.content
          : "",
    };

    const saved = await saveEssayPractice(
      req.user.id,
      payload
    );

    res.json({
      success: true,
      message: "仿写已提交并批改",
      data: saved,
    });
  } catch (error) {
    console.error(
      "Create essay practice error:",
      error
    );
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "保存仿写失败",
    });
  }
}
