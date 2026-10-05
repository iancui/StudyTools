import {
  Request,
  Response,
} from "express";

import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../services/auth.service.js";

import {
  findUserById,
} from "../repositories/user.repository.js";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

export async function register(
  req: Request,
  res: Response
) {
  try {
    const {
      username,
      password,
      nickname,
    } = req.body;

    const user =
      await registerUser({
        username,
        password,
        nickname,
      });

    res.status(201).json({
      success: true,
      message: "注册成功",
      data: user,
    });
  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "注册失败";

    res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function login(
  req: Request,
  res: Response
) {
  try {
    const {
      username,
      password,
    } = req.body;

    const result =
      await loginUser({
        username,
        password,
      });

    res.json({
      success: true,
      message: "登录成功",
      data: result,
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "登录失败";

    res.status(401).json({
      success: false,
      message,
    });
  }
}

export async function refresh(
  req: Request,
  res: Response
) {
  try {
    const {
      refreshToken,
    } = req.body;

    const result =
      await refreshAccessToken(
        refreshToken
      );

    res.json({
      success: true,
      message: "Token 刷新成功",
      data: result,
    });
  } catch (error) {
    console.error(
      "Refresh token error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Token 刷新失败";

    res.status(401).json({
      success: false,
      message,
    });
  }
}

export async function logout(
  req: Request,
  res: Response
) {
  try {
    const {
      refreshToken,
    } = req.body;

    await logoutUser(
      refreshToken
    );

    res.json({
      success: true,
      message: "退出登录成功",
    });
  } catch (error) {
    console.error(
      "Logout error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "退出登录失败",
    });
  }
}

export async function me(
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

    const user =
      await findUserById(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "获取用户信息失败",
    });
  }
}