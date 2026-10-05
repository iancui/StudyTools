import jwt from "jsonwebtoken";

export interface AccessTokenPayload {
  userId: number;
  username: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET 未配置");
  }

  return secret;
}

export function createAccessToken(
  payload: AccessTokenPayload
): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "15m",
  });
}

export function verifyAccessToken(
  token: string
): AccessTokenPayload {
  return jwt.verify(
    token,
    getJwtSecret()
  ) as AccessTokenPayload;
}