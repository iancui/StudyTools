import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

import {
  get,
  update,
} from "../controllers/character-progress.controller.js";

const router = Router();

// GET /api/progress/characters
router.get("/", requireAuth, get);

// PUT /api/progress/characters
router.put("/", requireAuth, update);

export default router;
