// 英语辞书 routes
// ------------------------------------------------------------
// 工单: 英语学习 V1 - 辞书基础
//
//   GET    /api/english/dictionaries
//   GET    /api/english/dictionaries/:id
//   GET    /api/english/dictionaries/:id/words
//   POST   /api/english/dictionaries/import
//
// 辞书是用户私有数据, 全部接口都需要 requireAuth.
// user_id 由 middleware 从 JWT 提取, 不接受客户端传入.

import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";

import {
  getDictionaryHandler,
  importDictionaryHandler,
  listDictionariesHandler,
  listWordsHandler,
} from "../controllers/english-dictionary.controller.js";

const router = Router();

// GET /api/english/dictionaries
router.get(
  "/dictionaries",
  requireAuth,
  listDictionariesHandler
);

// GET /api/english/dictionaries/:id
router.get(
  "/dictionaries/:id",
  requireAuth,
  getDictionaryHandler
);

// GET /api/english/dictionaries/:id/words
router.get(
  "/dictionaries/:id/words",
  requireAuth,
  listWordsHandler
);

// POST /api/english/dictionaries/import
router.post(
  "/dictionaries/import",
  requireAuth,
  importDictionaryHandler
);

export default router;
