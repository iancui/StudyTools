import {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  verifyAccessToken,
} from "../config/auth.js";

export interface AuthenticatedRequest
  extends Request {
  user?: {
    id: number;
    username: string;
  };
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authorization =
      req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "未提供登录凭证",
      });
    }

    if (
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          "登录凭证格式错误",
      });
    }

    const token =
      authorization.substring(7);

    const payload =
      verifyAccessToken(token);

    req.user = {
      id: payload.userId,
      username: payload.username,
    };

    next();
  } catch (error) {
    console.error(
      "Auth middleware error:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "登录凭证无效或已过期",
    });
  }
}