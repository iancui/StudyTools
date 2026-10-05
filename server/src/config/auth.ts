import jwt, {
  SignOptions,
} from "jsonwebtoken";

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

function getJwtExpiresIn(): string {
  return process.env.JWT_ACCESS_EXPIRES_IN || "15m";
}

export function createAccessToken(
  payload: AccessTokenPayload
): string {
  const options: SignOptions = {
    expiresIn: getJwtExpiresIn() as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, getJwtSecret(), options);
}

export function verifyAccessToken(
  token: string
): AccessTokenPayload {
  return jwt.verify(
    token,
    getJwtSecret()
  ) as AccessTokenPayload;
}