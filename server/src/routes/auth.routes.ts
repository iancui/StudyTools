import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  login,
  logout,
  me,
  refresh,
  register,
} from "../controllers/auth.controller.js";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "请求过于频繁，请稍后再试",
  },
});

router.post(
  "/register",
  authLimiter,
  register
);

router.post(
  "/login",
  authLimiter,
  login
);

router.post(
  "/refresh",
  authLimiter,
  refresh
);

router.post(
  "/logout",
  logout
);

router.get(
  "/me",
  requireAuth,
  me
);

export default router;