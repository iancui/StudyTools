import {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../config/database.js";

interface RefreshTokenRow
  extends RowDataPacket {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
}

export async function createRefreshToken(
  userId: number,
  tokenHash: string,
  expiresAt: Date
): Promise<number> {
  const [result] =
    await pool.execute<ResultSetHeader>(
      `
      INSERT INTO refresh_tokens (
        user_id,
        token_hash,
        expires_at
      )
      VALUES (?, ?, ?)
      `,
      [
        userId,
        tokenHash,
        expiresAt,
      ]
    );

  return result.insertId;
}

export async function findRefreshToken(
  tokenHash: string
): Promise<RefreshTokenRow | null> {
  const [rows] =
    await pool.query<RefreshTokenRow[]>(
      `
      SELECT
        id,
        user_id,
        token_hash,
        expires_at,
        revoked_at
      FROM refresh_tokens
      WHERE token_hash = ?
      LIMIT 1
      `,
      [tokenHash]
    );

  return rows.length > 0
    ? rows[0]
    : null;
}

export async function revokeRefreshToken(
  tokenHash: string
): Promise<void> {
  await pool.execute(
    `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE token_hash = ?
      AND revoked_at IS NULL
    `,
    [tokenHash]
  );
}

export async function revokeAllUserRefreshTokens(
  userId: number
): Promise<void> {
  await pool.execute(
    `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE user_id = ?
      AND revoked_at IS NULL
    `,
    [userId]
  );
}

export type RotateResult =
  | { ok: true; userId: number }
  | { ok: false; reason: "not_found" | "revoked" | "expired" };

export async function rotateRefreshToken(
  oldTokenHash: string,
  newTokenHash: string,
  newExpiresAt: Date
): Promise<RotateResult> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query<RefreshTokenRow[]>(
      `
      SELECT
        id,
        user_id,
        token_hash,
        expires_at,
        revoked_at
      FROM refresh_tokens
      WHERE token_hash = ?
      LIMIT 1
      FOR UPDATE
      `,
      [oldTokenHash]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return { ok: false, reason: "not_found" };
    }

    const stored = rows[0];

    if (stored.revoked_at) {
      await connection.rollback();
      return { ok: false, reason: "revoked" };
    }

    if (new Date(stored.expires_at).getTime() <= Date.now()) {
      await connection.rollback();
      return { ok: false, reason: "expired" };
    }

    await connection.execute(
      `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE id = ?
      `,
      [stored.id]
    );

    await connection.execute<ResultSetHeader>(
      `
      INSERT INTO refresh_tokens (
        user_id,
        token_hash,
        expires_at
      )
      VALUES (?, ?, ?)
      `,
      [stored.user_id, newTokenHash, newExpiresAt]
    );

    await connection.commit();

    return { ok: true, userId: stored.user_id };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}