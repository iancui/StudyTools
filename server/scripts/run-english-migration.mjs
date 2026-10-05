// 临时迁移运行器 - 仅用于本工单 smoke test, 不打包进生产构建.
// 直接读取 server/.env 配置 + migrations/english_v1.sql 执行.
// 完成后会被 git 忽略 (已在 .gitignore 加 _tmp_*).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

const sqlPath = path.resolve(__dirname, "../migrations/english_v1.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
  charset: "utf8mb4",
});

try {
  await pool.query(sql);
  const [rows] = await pool.query(
    "SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA = ? AND TABLE_NAME LIKE 'english_%'",
    [process.env.DB_NAME]
  );
  console.log("Migration OK. Tables:", rows);
} catch (err) {
  console.error("Migration failed:", err);
  process.exit(1);
} finally {
  await pool.end();
}
