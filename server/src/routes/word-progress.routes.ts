import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

import {
  get,
  update,
} from "../controllers/word-progress.controller.js";

const router = Router();

// GET /api/progress/words
router.get("/", requireAuth, get);

// PUT /api/progress/words
router.put("/", requireAuth, update);

export default router;
