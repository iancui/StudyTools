// 英语辞书 controller
// ------------------------------------------------------------
// 工单: 英语学习 V1 - 辞书基础
//
// 4 个接口:
//   GET    /api/english/dictionaries
//   GET    /api/english/dictionaries/:id
//   GET    /api/english/dictionaries/:id/words
//   POST   /api/english/dictionaries/import    (requireAuth)
//
// 数据归属:
//   - user_id 强制从 JWT (req.user.id) 提取, 不信任前端 userId.
//   - 查询和导入都带 user_id 过滤, 用户只能看到自己的辞书.
//
// 注意:
//   - 列表和详情接口也需要 requireAuth, 因为辞书是用户私有数据,
//     不能让未登录用户访问.
//   - 路由层统一挂 requireAuth.

import { Response } from "express";

import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

import {
  EnglishDictionaryDTO,
  EnglishWordDTO,
  ImportResult,
  getDictionary,
  importDictionary,
  listDictionaries,
  listWords,
} from "../services/english-dictionary.service.js";

// GET /api/english/dictionaries
export async function listDictionariesHandler(
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

    const data: EnglishDictionaryDTO[] =
      await listDictionaries(req.user.id);

    res.json({ success: true, data });
  } catch (error) {
    console.error("List english dictionaries error:", error);
    res.status(500).json({
      success: false,
      message: "获取辞书列表失败",
    });
  }
}

// GET /api/english/dictionaries/:id
export async function getDictionaryHandler(
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

    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "无效的辞书 ID",
      });
    }

    const data: EnglishDictionaryDTO | null =
      await getDictionary(req.user.id, id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "辞书不存在或无权访问",
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Get english dictionary error:", error);
    res.status(500).json({
      success: false,
      message: "获取辞书失败",
    });
  }
}

// GET /api/english/dictionaries/:id/words
export async function listWordsHandler(
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

    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "无效的辞书 ID",
      });
    }

    const data: EnglishWordDTO[] = await listWords(
      req.user.id,
      id
    );

    // listWords 已校验辞书归属, 不存在则返回空数组 (不报 404,
    // 让前端展示友好空状态即可).
    res.json({ success: true, data });
  } catch (error) {
    console.error("List english words error:", error);
    res.status(500).json({
      success: false,
      message: "获取单词列表失败",
    });
  }
}

// POST /api/english/dictionaries/import
// body: { name: string, description?: string, csvText: string }
export async function importDictionaryHandler(
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

    const name =
      typeof body.name === "string" ? body.name : "";
    const description =
      typeof body.description === "string"
        ? body.description
        : null;
    const csvText =
      typeof body.csvText === "string" ? body.csvText : "";

    const data: ImportResult = await importDictionary(
      req.user.id,
      { name, description, csvText }
    );

    res.json({
      success: true,
      message: "辞书导入成功",
      data,
    });
  } catch (error) {
    console.error("Import english dictionary error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "导入辞书失败";
    const status = message.includes("不能为空") ||
      message.includes("过长") ||
      message.includes("没有有效单词")
      ? 400
      : 500;
    res.status(status).json({
      success: false,
      message,
    });
  }
}
