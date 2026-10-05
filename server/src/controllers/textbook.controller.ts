// 教材内容只读 Controller
// ============================================================
//
// 5 个只读接口, 全部 GET, 无需登录:
//   GET /api/textbook/lessons?grade=...&term=...
//   GET /api/textbook/lessons/:lessonId
//   GET /api/textbook/lessons/:lessonId/characters
//   GET /api/textbook/lessons/:lessonId/words
//   GET /api/textbook/lessons/:lessonId/sentences
//
// 教材是公共内容, 不需要 JWT. 如果以后要限制访问,
// 在 routes 里挂 requireAuth 即可, 不必改 controller.

import { Request, Response } from "express";

import {
  getLesson,
  listCharacters,
  listLessons,
  listSentences,
  listWords,
} from "../services/textbook.service.js";

// GET /api/textbook/lessons?grade=...&term=...
export function listLessonsHandler(
  req: Request,
  res: Response
) {
  // grade/term 透传, 直接用数据库现有值. 不做格式转换.
  // 任一缺失则该条件不参与过滤.
  const grade = typeof req.query.grade === "string"
    ? req.query.grade
    : undefined;
  const term = typeof req.query.term === "string"
    ? req.query.term
    : undefined;

  listLessons(grade, term)
    .then((data) => {
      res.json({ success: true, data });
    })
    .catch((error) => {
      console.error(
        "List textbook lessons error:",
        error
      );
      res.status(500).json({
        success: false,
        message: "获取课程列表失败",
      });
    });
}

// GET /api/textbook/lessons/:lessonId
export function getLessonHandler(
  req: Request,
  res: Response
) {
  const lessonId = req.params.lessonId;
  if (typeof lessonId !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "无效的课程 ID" });
  }

  getLesson(lessonId)
    .then((data) => {
      if (!data) {
        return res
          .status(404)
          .json({
            success: false,
            message: "课程不存在",
          });
      }
      res.json({ success: true, data });
    })
    .catch((error) => {
      console.error(
        "Get textbook lesson error:",
        error
      );
      res.status(500).json({
        success: false,
        message: "获取课程失败",
      });
    });
}

// GET /api/textbook/lessons/:lessonId/characters
export function listCharactersHandler(
  req: Request,
  res: Response
) {
  const lessonId = req.params.lessonId;
  if (typeof lessonId !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "无效的课程 ID" });
  }

  listCharacters(lessonId)
    .then((data) => {
      res.json({ success: true, data });
    })
    .catch((error) => {
      console.error(
        "List textbook characters error:",
        error
      );
      res.status(500).json({
        success: false,
        message: "获取生字列表失败",
      });
    });
}

// GET /api/textbook/lessons/:lessonId/words
export function listWordsHandler(
  req: Request,
  res: Response
) {
  const lessonId = req.params.lessonId;
  if (typeof lessonId !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "无效的课程 ID" });
  }

  listWords(lessonId)
    .then((data) => {
      res.json({ success: true, data });
    })
    .catch((error) => {
      console.error(
        "List textbook words error:",
        error
      );
      res.status(500).json({
        success: false,
        message: "获取词语列表失败",
      });
    });
}

// GET /api/textbook/lessons/:lessonId/sentences
export function listSentencesHandler(
  req: Request,
  res: Response
) {
  const lessonId = req.params.lessonId;
  if (typeof lessonId !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "无效的课程 ID" });
  }

  listSentences(lessonId)
    .then((data) => {
      res.json({ success: true, data });
    })
    .catch((error) => {
      console.error(
        "List textbook sentences error:",
        error
      );
      res.status(500).json({
        success: false,
        message: "获取句子列表失败",
      });
    });
}
