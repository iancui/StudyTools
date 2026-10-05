import {
  Response,
} from "express";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

import {
  getCharacterProgress,
  updateCharacterProgress,
} from "../services/character-progress.service.js";

// GET /api/progress/characters
// 返回当前登录用户的所有 user_character_progress 行.
// user_id 强制从 JWT 获取.
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

    const data = await getCharacterProgress(
      req.user.id
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Get character progress error:",
      error
    );
    res.status(500).json({
      success: false,
      message: "获取生字学习记录失败",
    });
  }
}

// PUT /api/progress/characters
// body: { masteredIds: string[] } 或 { items: [{ characterId, isMastered }] }
// 用全量快照覆盖当前用户的 is_mastered 状态.
// user_id 同样强制从 JWT 获取.
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

    const data = await updateCharacterProgress(
      req.user.id,
      body
    );

    res.json({
      success: true,
      message: "生字进度同步成功",
      data,
    });
  } catch (error) {
    console.error(
      "Update character progress error:",
      error
    );
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "更新生字学习记录失败",
    });
  }
}
