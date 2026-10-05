import {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../config/database.js";

export interface User {
  id: number;
  username: string;
  nickname: string | null;
  avatar_url: string | null;
  selected_grade: string | null;
  status: number;
}

interface UserWithPassword
  extends RowDataPacket,
    User {
  password_hash: string;
}

interface UserRow
  extends RowDataPacket,
    User {}

export async function findUserByUsername(
  username: string
): Promise<UserWithPassword | null> {
  const [rows] = await pool.query<UserWithPassword[]>(
    `
    SELECT
      id,
      username,
      password_hash,
      nickname,
      avatar_url,
      selected_grade,
      status
    FROM users
    WHERE username = ?
    LIMIT 1
    `,
    [username]
  );

  return rows.length > 0
    ? rows[0]
    : null;
}

export async function findUserById(
  userId: number
): Promise<User | null> {
  const [rows] = await pool.query<UserRow[]>(
    `
    SELECT
      id,
      username,
      nickname,
      avatar_url,
      selected_grade,
      status
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [userId]
  );

  return rows.length > 0
    ? rows[0]
    : null;
}

export async function createUser(
  username: string,
  passwordHash: string,
  nickname: string | null
): Promise<number> {
  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] =
      await connection.execute<ResultSetHeader>(
        `
        INSERT INTO users (
          username,
          password_hash,
          nickname
        )
        VALUES (?, ?, ?)
        `,
        [
          username,
          passwordHash,
          nickname,
        ]
      );

    const userId = result.insertId;

    await connection.execute(
      `
      INSERT INTO user_progress (
        user_id
      )
      VALUES (?)
      `,
      [userId]
    );

    await connection.commit();

    return userId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}