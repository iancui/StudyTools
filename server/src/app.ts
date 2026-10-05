import express from "express";
import cors from "cors";
import helmet from "helmet";

import healthRouter from "./routes/health.routes.js";
import authRouter from "./routes/auth.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    name: "墨韵中文 API",
    version: "1.0.0",
  });
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);

export default app;