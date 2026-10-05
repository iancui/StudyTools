// 墨韵中文 前端 Auth API Client
// ============================================================
//
// 仅封装后端已存在的 5 个 Auth API:
//   POST   /auth/register
//   POST   /auth/login
//   POST   /auth/refresh
//   POST   /auth/logout
//   GET    /auth/me
//
// 字段严格以后端 controller/service 真实返回为准,不扩展任何不存在的字段.
// 不实现自动 refresh,不实现重试机制 (按施工单 02 要求).
//
// 路径前缀 /auth 由 client.ts 的 VITE_API_BASE_URL 拼接为
//   http://localhost:3001/api/auth/...

import { apiGet, apiPost } from "./client";

// ------------------------------------------------------------
// 类型定义 (以后端实际返回为准)
// ------------------------------------------------------------

/** 注册请求体 */
export interface RegisterRequest {
  username: string;
  password: string;
  /** 可选昵称,后端允许空 */
  nickname?: string;
}

/** 登录请求体 */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 注册成功后返回的用户信息 (后端 registerUser 返回结构) */
export interface RegisteredUser {
  id: number;
  username: string;
  nickname: string | null;
}

/** 登录返回的 user 子对象 (后端 loginUser 返回结构) */
export interface AuthUser {
  id: number;
  username: string;
  nickname: string | null;
  avatar_url: string | null;
  selected_grade: string | null;
}

/** 登录成功响应中的 data 字段 */
export interface LoginData {
  accessToken: string;
  refreshToken: string;
  /** Access Token 有效期 (秒),后端固定返回 15 * 60 = 900 */
  expiresIn: number;
  user: AuthUser;
}

/** Refresh 成功响应中的 data 字段 (无 user,只有新 token) */
export interface RefreshData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** /auth/me 返回的用户对象 (后端 findUserById 返回结构) */
export interface MeUser {
  id: number;
  username: string;
  nickname: string | null;
  avatar_url: string | null;
  selected_grade: string | null;
  status: number;
}

/** /auth/me 返回的 data 字段 */
export type MeResponse = MeUser;

/** /auth/register 返回的 data 字段 */
export type RegisterResponse = RegisteredUser;

/** /auth/login 返回的 data 字段 */
export type LoginResponse = LoginData;

/** /auth/refresh 返回的 data 字段 */
export type RefreshResponse = RefreshData;

/** /auth/logout 无 data 字段 (后端只返回 success/message) */
export type LogoutResponse = void;

// ------------------------------------------------------------
// API 方法
// ------------------------------------------------------------

/**
 * 注册账号
 * POST /auth/register
 * 成功返回 RegisteredUser (无 token,需要用户单独调用 login)
 */
export function register(body: RegisterRequest): Promise<RegisterResponse> {
  return apiPost<RegisterResponse>("/auth/register", body);
}

/**
 * 登录
 * POST /auth/login
 * 成功返回 accessToken / refreshToken / user
 */
export function login(body: LoginRequest): Promise<LoginResponse> {
  return apiPost<LoginResponse>("/auth/login", body);
}

/**
 * 刷新 Access Token
 * POST /auth/refresh
 * 需要传入当前有效的 refreshToken,后端会轮换 (旧 token 失效,返回新 token)
 * 失败会抛 ApiError,message 为 "Refresh Token 已失效" / "已过期" / "无效"
 */
export function refresh(refreshToken: string): Promise<RefreshResponse> {
  return apiPost<RefreshResponse>("/auth/refresh", {
    refreshToken,
  });
}

/**
 * 退出登录
 * POST /auth/logout
 * 后端会撤销当前 refreshToken,不需要 Access Token
 * 后端成功只返回 { success: true, message },client.ts 会剥出 data (undefined)
 */
export function logout(refreshToken: string): Promise<LogoutResponse> {
  return apiPost<LogoutResponse>("/auth/logout", {
    refreshToken,
  });
}

/**
 * 获取当前登录用户信息
 * GET /auth/me
 * 需要 Access Token (会作为 Authorization: Bearer 发送)
 */
export function me(accessToken: string): Promise<MeResponse> {
  return apiGet<MeResponse>("/auth/me", { accessToken });
}
