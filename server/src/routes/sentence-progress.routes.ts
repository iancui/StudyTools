import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

import {
  get,
  update,
} from "../controllers/sentence-progress.controller.js";

const router = Router();

// GET /api/progress/sentences
router.get("/", requireAuth, get);

// PUT /api/progress/sentences
router.put("/", requireAuth, update);

export default router;
