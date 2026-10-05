import crypto from "node:crypto";

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export function hashToken(
  token: string
): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export function getRefreshTokenExpiresAt(): Date {
  const expiresAt = new Date();

  // Refresh Token 有效期 30 天
  expiresAt.setDate(
    expiresAt.getDate() + 30
  );

  return expiresAt;
}