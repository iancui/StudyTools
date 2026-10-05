import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

import {
  get,
  update,
} from "../controllers/progress.controller.js";

const router = Router();

// GET /api/progress  -> 取当前登录用户进度摘要
router.get("/", requireAuth, get);

// PUT /api/progress -> 同步当前登录用户进度摘要
router.put("/", requireAuth, update);

export default router;
