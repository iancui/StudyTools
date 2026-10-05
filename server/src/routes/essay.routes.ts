import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

import {
  create,
} from "../controllers/essay.controller.js";

const router = Router();

// POST /api/essays/practices
// 工单 12: 句子仿写闭环. 提交仿写 → 后端规则批改 → 写入
// essay_practices → 返回评分 + 反馈. user_id 来自 JWT, 不接受客户端传入.
router.post("/practices", requireAuth, create);

export default router;
