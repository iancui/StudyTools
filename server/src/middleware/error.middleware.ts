import {
  NextFunction,
  Request,
  Response,
} from "express";

export function notFoundHandler(
  _req: Request,
  res: Response
): void {
  res.status(404).json({
    success: false,
    message: "接口不存在",
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Unhandled error:", err);

  const isProd =
    process.env.NODE_ENV === "production";

  const message =
    err instanceof Error
      ? err.message
      : "服务器内部错误";

  res.status(500).json({
    success: false,
    message: isProd ? "服务器内部错误" : message,
  });
}