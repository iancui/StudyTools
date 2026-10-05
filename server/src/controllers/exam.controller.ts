// 教材考试记录 controller
// ------------------------------------------------------------
// POST /api/exams/records
// 提交一次考试结果, 写入 exam_records.
// user_id 强制从 JWT (req.user.id) 获取, 不允许客户端指定 user_id.

import {
  Response,
} from "express";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

import {
  SaveExamRecordInput,
  saveExamRecord,
} from "../services/exam.service.js";

// POST /api/exams/records
export async function create(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "未登录",
      });
    }

    const body =
      (req.body as Record<string, unknown>) || {};

    const payload: SaveExamRecordInput = {
      examId: body.examId as SaveExamRecordInput["examId"],
      examName: body.examName as SaveExamRecordInput["examName"],
      grade: body.grade as SaveExamRecordInput["grade"],
      totalQuestions: body.totalQuestions as number,
      correctQuestions: body.correctQuestions as number,
      wrongQuestions: body.wrongQuestions as number,
      score: body.score as number,
      durationSeconds: body.durationSeconds as number,
      answers: body.answers as SaveExamRecordInput["answers"],
      startedAt: body.startedAt as SaveExamRecordInput["startedAt"],
      completedAt: body.completedAt as SaveExamRecordInput["completedAt"],
    };

    const saved = await saveExamRecord(
      req.user.id,
      payload
    );

    res.json({
      success: true,
      message: "考试记录已保存",
      data: saved,
    });
  } catch (error) {
    console.error(
      "Create exam record error:",
      error
    );
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "保存考试记录失败",
    });
  }
}
