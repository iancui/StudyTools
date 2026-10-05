import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

import {
  get,
  record,
  update,
} from "../controllers/character-progress.controller.js";

const router = Router();

// GET /api/progress/characters
router.get("/", requireAuth, get);

// PUT /api/progress/characters
router.put("/", requireAuth, update);

// POST /api/progress/characters/practice
// 工单 15: 记录一次生字练习事件 (累加统计, 服务端自增)
router.post("/practice", requireAuth, record);

export default router;
