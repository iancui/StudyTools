import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

import {
  get,
  record,
  update,
} from "../controllers/word-progress.controller.js";

const router = Router();

// GET /api/progress/words
router.get("/", requireAuth, get);

// PUT /api/progress/words
router.put("/", requireAuth, update);

// POST /api/progress/words/practice
// 工单 15: 记录一次词语练习事件
router.post("/practice", requireAuth, record);

export default router;
