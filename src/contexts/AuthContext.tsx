// 墨韵中文 前端 Auth Context
// ============================================================
//
// 状态管理职责:
//   - user / accessToken / isAuthenticated / isLoading
//   - register / login / logout / loadCurrentUser
//   - access token 失效时自动调用 refresh,获取新 token 后重试原请求
//   - 应用启动时若本地存在 refresh token,则尝试恢复登录状态
//
// 存储策略 (MVP):
//   - accessToken: 仅保存在内存状态 (页面刷新会丢失,但 refresh 会自动恢复)
//   - refreshToken: 保存在 localStorage (独立 key,不与学习数据混合)
//   - user: 保存在内存 (由 /auth/me 重新拉取,确保数据最新)
//
// 重要原则:
//   - 不修改 utils/storage.ts 的学习数据存储逻辑
//   - 不删除现有 moyun_chinese_learning_v1 / moyun_custom_curriculum_data_v1
//   - 认证存储使用独立 key: moyun_auth_v1
//   - refresh 失败时清除认证状态,但不影响学习数据

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ApiError } from "../api/client";
import {
  LoginRequest,
  LoginResponse,
  MeResponse,
  RefreshResponse,
  RegisterRequest,
  login as apiLogin,
  logout as apiLogout,
  me as apiMe,
  refresh as apiRefresh,
  register as apiRegister,
} from "../api/auth";

// ------------------------------------------------------------
// 存储常量 (独立 key,不与学习数据混合)
// ------------------------------------------------------------

const AUTH_STORAGE_KEY = "moyun_auth_v1";

interface StoredAuth {
  refreshToken: string;
}

// ------------------------------------------------------------
// Context 类型
// ------------------------------------------------------------

export interface AuthContextValue {
  /** 当前登录用户 (未登录时为 null) */
  user: MeResponse | null;
  /** 内存中的 Access Token (未登录时为 null) */
  accessToken: string | null;
  /** 是否已登录 */
  isAuthenticated: boolean;
  /** 是否正在加载初始状态 (应用启动时为 true) */
  isLoading: boolean;
  /** 当前正在进行的异步操作 (用于 UI 显示 loading) */
  pending: boolean;
  /** 错误信息 (登录/注册失败时显示) */
  error: string | null;

  /** 注册新用户 */
  register: (body: RegisterRequest) => Promise<void>;
  /** 登录 */
  login: (body: LoginRequest) => Promise<void>;
  /** 退出登录 */
  logout: () => Promise<void>;
  /** 拉取当前用户信息 (基于内存中的 accessToken) */
  loadCurrentUser: () => Promise<void>;
  /** 手动刷新 Access Token (一般不需要外部调用) */
  refresh: () => Promise<boolean>;
  /** 清除错误状态 */
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ------------------------------------------------------------
// Hook
// ------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth 必须在 <AuthProvider> 内部使用");
  }
  return ctx;
}

// ------------------------------------------------------------
// Provider
// ------------------------------------------------------------

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // refresh 锁:防止并发请求同时触发多次 refresh
  // 同一时间只允许一个 refresh Promise,其他调用者共享其结果
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  // 保存最新的 accessToken 到 ref,避免闭包陈旧
  const accessTokenRef = useRef<string | null>(null);
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  // ------------------------------------------------------------
  // localStorage 读写 (只存 refreshToken)
  // ------------------------------------------------------------

  const readStoredAuth = useCallback((): StoredAuth | null => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StoredAuth;
      if (!parsed || typeof parsed.refreshToken !== "string") return null;
      return parsed;
    } catch {
      return null;
    }
  }, []);

  const writeStoredAuth = useCallback((data: StoredAuth) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save auth to localStorage:", e);
    }
  }, []);

  const clearStoredAuth = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear auth from localStorage:", e);
    }
  }, []);

  // ------------------------------------------------------------
  // 错误处理辅助
  // ------------------------------------------------------------

  const extractMessage = useCallback((err: unknown, fallback: string): string => {
    if (err instanceof ApiError) {
      return err.message || fallback;
    }
    if (err instanceof Error) {
      return err.message || fallback;
    }
    return fallback;
  }, []);

  // ------------------------------------------------------------
  // refresh:获取新的 accessToken + refreshToken
  // 返回新的 accessToken (失败时为 null)
  // ------------------------------------------------------------

  const refresh = useCallback(async (): Promise<boolean> => {
    // 使用锁:并发调用共享同一个 Promise
    if (refreshPromiseRef.current) {
      try {
        const token = await refreshPromiseRef.current;
        return token !== null;
      } catch {
        return false;
      }
    }

    const stored = readStoredAuth();
    if (!stored || !stored.refreshToken) {
      return false;
    }

    const promise = (async (): Promise<string | null> => {
      try {
        const data: RefreshResponse = await apiRefresh(stored.refreshToken);
        setAccessToken(data.accessToken);
        accessTokenRef.current = data.accessToken;
        // 后端采用 refresh token 轮换,旧 token 失效,必须保存新 token
        writeStoredAuth({ refreshToken: data.refreshToken });
        return data.accessToken;
      } catch (err) {
        console.warn("Refresh token 失效:", extractMessage(err, "未知错误"));
        // refresh 失败:清除登录状态
        setAccessToken(null);
        accessTokenRef.current = null;
        setUser(null);
        clearStoredAuth();
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = promise;

    const token = await promise;
    return token !== null;
  }, [readStoredAuth, writeStoredAuth, clearStoredAuth, extractMessage]);

  // ------------------------------------------------------------
  // loadCurrentUser:基于 accessToken 调用 /auth/me
  // 401 时自动 refresh 后重试一次
  // ------------------------------------------------------------

  const loadCurrentUser = useCallback(async () => {
    let token = accessTokenRef.current;
    if (!token) {
      const ok = await refresh();
      if (!ok) {
        setUser(null);
        return;
      }
      token = accessTokenRef.current;
    }
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const meData = await apiMe(token);
      setUser(meData);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // accessToken 过期,尝试 refresh 后重试一次
        const ok = await refresh();
        if (ok && accessTokenRef.current) {
          try {
            const meData = await apiMe(accessTokenRef.current);
            setUser(meData);
            return;
          } catch (err2) {
            console.error("重试 /auth/me 失败:", extractMessage(err2, ""));
          }
        }
        setUser(null);
        clearStoredAuth();
        setAccessToken(null);
        accessTokenRef.current = null;
      } else {
        console.error("加载当前用户失败:", extractMessage(err, "未知错误"));
        setUser(null);
      }
    }
  }, [refresh, extractMessage, clearStoredAuth]);

  // ------------------------------------------------------------
  // register
  // ------------------------------------------------------------

  const register = useCallback(async (body: RegisterRequest) => {
    setPending(true);
    setError(null);
    try {
      await apiRegister(body);
      // 注册成功后不自动登录,提示用户切换到登录
    } catch (err) {
      const msg = extractMessage(err, "注册失败");
      setError(msg);
      throw err;
    } finally {
      setPending(false);
    }
  }, [extractMessage]);

  // ------------------------------------------------------------
  // login
  // ------------------------------------------------------------

  const login = useCallback(async (body: LoginRequest) => {
    setPending(true);
    setError(null);
    try {
      const data: LoginResponse = await apiLogin(body);
      setAccessToken(data.accessToken);
      accessTokenRef.current = data.accessToken;
      writeStoredAuth({ refreshToken: data.refreshToken });
      // 后端 loginUser 返回的 user 不含 status,但 MeResponse 含 status
      // 用 1 表示正常状态 (与后端 users.status 默认值一致)
      const meFromLogin: MeResponse = {
        id: data.user.id,
        username: data.user.username,
        nickname: data.user.nickname,
        avatar_url: data.user.avatar_url,
        selected_grade: data.user.selected_grade,
        status: 1,
      };
      setUser(meFromLogin);
    } catch (err) {
      const msg = extractMessage(err, "登录失败");
      setError(msg);
      // 清除可能残留的旧 token
      clearStoredAuth();
      setAccessToken(null);
      accessTokenRef.current = null;
      setUser(null);
      throw err;
    } finally {
      setPending(false);
    }
  }, [extractMessage, writeStoredAuth, clearStoredAuth]);

  // ------------------------------------------------------------
  // logout
  // ------------------------------------------------------------

  const logout = useCallback(async () => {
    const stored = readStoredAuth();
    if (stored?.refreshToken) {
      try {
        await apiLogout(stored.refreshToken);
      } catch (err) {
        // 即使后端 logout 失败,本地也要清除,保证用户能退出
        console.warn("Logout API 失败 (本地仍清除):", extractMessage(err, ""));
      }
    }
    setAccessToken(null);
    accessTokenRef.current = null;
    setUser(null);
    clearStoredAuth();
  }, [readStoredAuth, clearStoredAuth, extractMessage]);

  // ------------------------------------------------------------
  // 应用启动时恢复登录状态
  // ------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      const stored = readStoredAuth();
      if (!stored || !stored.refreshToken) {
        setIsLoading(false);
        return;
      }
      // 尝试 refresh,获取新的 accessToken
      const ok = await refresh();
      if (cancelled) return;
      if (ok) {
        await loadCurrentUser();
      } else {
        setUser(null);
      }
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // ------------------------------------------------------------
  // 暴露 Context Value
  // ------------------------------------------------------------

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: !!user && !!accessToken,
      isLoading,
      pending,
      error,
      register,
      login,
      logout,
      loadCurrentUser,
      refresh,
      clearError,
    }),
    [
      user,
      accessToken,
      isLoading,
      pending,
      error,
      register,
      login,
      logout,
      loadCurrentUser,
      refresh,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ------------------------------------------------------------
// 给学习进度同步等后续模块使用的"带自动 refresh"请求 hook
// ------------------------------------------------------------

/**
 * 返回一个绑定到当前 AuthContext 的请求函数。
 * 用法:
 *   const authReq = useAuthenticatedRequest();
 *   const data = await authReq(token => apiGet('/progress', { accessToken: token }));
 */
export function useAuthenticatedRequest() {
  const { accessToken, refresh } = useAuth();
  const tokenRef = useRef<string | null>(accessToken);
  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  return useCallback(async <T,>(
    fn: (token: string) => Promise<T>,
  ): Promise<T> => {
    let token = tokenRef.current;
    if (!token) {
      const ok = await refresh();
      if (!ok || !tokenRef.current) {
        throw new ApiError("未登录或登录已过期", {
          status: 401,
          endpoint: "(auth)",
          method: "GET",
        });
      }
      token = tokenRef.current;
    }

    try {
      return await fn(token);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const ok = await refresh();
        if (ok && tokenRef.current) {
          return await fn(tokenRef.current);
        }
      }
      throw err;
    }
  }, [refresh]);
}
