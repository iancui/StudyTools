import bcrypt from "bcryptjs";

import {
  createAccessToken,
} from "../config/auth.js";

import {
  createUser,
  findUserById,
  findUserByUsername,
} from "../repositories/user.repository.js";

import {
  createRefreshToken,
  findRefreshToken,
  revokeAllUserRefreshTokens,
  revokeRefreshToken,
} from "../repositories/refresh-token.repository.js";

import {
  generateRefreshToken,
  getRefreshTokenExpiresAt,
  hashToken,
} from "../utils/token.js";

export interface RegisterInput {
  username: string;
  password: string;
  nickname?: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export async function registerUser(
  input: RegisterInput
) {
  const username =
    input.username.trim();

  const password =
    input.password;

  const nickname =
    input.nickname?.trim() || null;

  if (!username) {
    throw new Error(
      "用户名不能为空"
    );
  }

  if (
    username.length < 3 ||
    username.length > 50
  ) {
    throw new Error(
      "用户名长度必须为 3-50 个字符"
    );
  }

  if (
    !password ||
    password.length < 6
  ) {
    throw new Error(
      "密码至少需要 6 个字符"
    );
  }

  const existingUser =
    await findUserByUsername(
      username
    );

  if (existingUser) {
    throw new Error(
      "用户名已经存在"
    );
  }

  const passwordHash =
    await bcrypt.hash(
      password,
      12
    );

  const userId =
    await createUser(
      username,
      passwordHash,
      nickname
    );

  return {
    id: userId,
    username,
    nickname,
  };
}

export async function loginUser(
  input: LoginInput
) {
  const username =
    input.username.trim();

  const password =
    input.password;

  if (!username || !password) {
    throw new Error(
      "用户名和密码不能为空"
    );
  }

  const user =
    await findUserByUsername(
      username
    );

  if (!user) {
    throw new Error(
      "用户名或密码错误"
    );
  }

  if (user.status !== 1) {
    throw new Error(
      "用户账号已被禁用"
    );
  }

  const passwordMatched =
    await bcrypt.compare(
      password,
      user.password_hash
    );

  if (!passwordMatched) {
    throw new Error(
      "用户名或密码错误"
    );
  }

  const accessToken =
    createAccessToken({
      userId: user.id,
      username: user.username,
    });

  const refreshToken =
    generateRefreshToken();

  const refreshTokenHash =
    hashToken(refreshToken);

  const refreshTokenExpiresAt =
    getRefreshTokenExpiresAt();

  await createRefreshToken(
    user.id,
    refreshTokenHash,
    refreshTokenExpiresAt
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60,
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
      selected_grade:
        user.selected_grade,
    },
  };
}

export async function refreshAccessToken(
  refreshToken: string
) {
  if (!refreshToken) {
    throw new Error(
      "Refresh Token 不能为空"
    );
  }

  const tokenHash =
    hashToken(refreshToken);

  const storedToken =
    await findRefreshToken(
      tokenHash
    );

  if (!storedToken) {
    throw new Error(
      "Refresh Token 无效"
    );
  }

  if (storedToken.revoked_at) {
    throw new Error(
      "Refresh Token 已失效"
    );
  }

  if (
    new Date(storedToken.expires_at)
      .getTime() <= Date.now()
  ) {
    throw new Error(
      "Refresh Token 已过期"
    );
  }

  const user =
    await findUserById(
      storedToken.user_id
    );

  if (!user) {
    throw new Error(
      "用户不存在"
    );
  }

  if (user.status !== 1) {
    throw new Error(
      "用户账号已被禁用"
    );
  }

  const accessToken =
    createAccessToken({
      userId: user.id,
      username: user.username,
    });

  return {
    accessToken,
    expiresIn: 15 * 60,
  };
}

export async function logoutUser(
  refreshToken: string
) {
  if (!refreshToken) {
    return;
  }

  const tokenHash =
    hashToken(refreshToken);

  await revokeRefreshToken(
    tokenHash
  );
}

export async function logoutAllDevices(
  userId: number
) {
  await revokeAllUserRefreshTokens(
    userId
  );
}