import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

import {
  create,
} from "../controllers/exam.controller.js";

const router = Router();

// POST /api/exams/records
// 保存一次考试结果. user_id 来自 JWT, 不接受客户端传入.
router.post("/records", requireAuth, create);

export default router;
