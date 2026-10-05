import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import { getJwtSecret } from "./config/auth.js";

// 启动时立即校验 JWT_ACCESS_SECRET,缺失则 fail-fast 退出。
// 避免出现"server 看似正常但首个鉴权请求才报错"的窗口。
getJwtSecret();

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
  console.log(`
========================================
  墨韵中文 API
  Server: http://localhost:${PORT}
========================================
  `);
});