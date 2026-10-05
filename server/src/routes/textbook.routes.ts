// 教材内容只读路由
// ============================================================
//
//   GET /api/textbook/lessons?grade=...&term=...
//   GET /api/textbook/lessons/:lessonId
//   GET /api/textbook/lessons/:lessonId/characters
//   GET /api/textbook/lessons/:lessonId/words
//   GET /api/textbook/lessons/:lessonId/sentences
//
// 教材内容是公共数据, 不需要 JWT. 全部只读, 不允许 POST/PUT/DELETE.

import { Router } from "express";

import {
  getLessonHandler,
  listCharactersHandler,
  listLessonsHandler,
  listSentencesHandler,
  listWordsHandler,
} from "../controllers/textbook.controller.js";

const router = Router();

// GET /api/textbook/lessons?grade=...&term=...
router.get("/lessons", listLessonsHandler);

// GET /api/textbook/lessons/:lessonId
router.get("/lessons/:lessonId", getLessonHandler);

// GET /api/textbook/lessons/:lessonId/characters
router.get(
  "/lessons/:lessonId/characters",
  listCharactersHandler
);

// GET /api/textbook/lessons/:lessonId/words
router.get(
  "/lessons/:lessonId/words",
  listWordsHandler
);

// GET /api/textbook/lessons/:lessonId/sentences
router.get(
  "/lessons/:lessonId/sentences",
  listSentencesHandler
);

export default router;
