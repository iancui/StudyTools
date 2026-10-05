import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

import {
  get,
  record,
  update,
} from "../controllers/sentence-progress.controller.js";

const router = Router();

// GET /api/progress/sentences
router.get("/", requireAuth, get);

// PUT /api/progress/sentences
router.put("/", requireAuth, update);

// POST /api/progress/sentences/practice
// 工单 15: 记录一次句子练习事件
router.post("/practice", requireAuth, record);

export default router;
