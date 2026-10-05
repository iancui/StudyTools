import express from "express";
import cors from "cors";
import helmet from "helmet";

import healthRouter from "./routes/health.routes.js";
import authRouter from "./routes/auth.routes.js";
import progressRouter from "./routes/progress.routes.js";
import characterProgressRouter from "./routes/character-progress.routes.js";
import wordProgressRouter from "./routes/word-progress.routes.js";
import sentenceProgressRouter from "./routes/sentence-progress.routes.js";
import textbookRouter from "./routes/textbook.routes.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    name: "墨韵中文 API",
    version: "1.0.0",
  });
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/progress", progressRouter);
app.use("/api/progress/characters", characterProgressRouter);
app.use("/api/progress/words", wordProgressRouter);
app.use("/api/progress/sentences", sentenceProgressRouter);
app.use("/api/textbook", textbookRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;