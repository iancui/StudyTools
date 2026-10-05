import { Router } from "express";
import { pool } from "../config/database.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT 1 AS ok"
    );

    res.json({
      success: true,
      message: "墨韵中文 API 正常运行",
      database: rows,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      success: false,
      message: "数据库连接失败",
    });
  }
});

export default router;