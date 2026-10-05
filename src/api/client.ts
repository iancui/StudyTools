// 墨韵中文 前端统一 HTTP Client
// ============================================================
//
// 设计原则:
//   - 仅基于 fetch,不引入 axios / React Query / Zustand 等任何第三方依赖
//   - API Base URL 由 Vite 环境变量 VITE_API_BASE_URL 提供,业务代码不写死 localhost
//   - 统一解析 JSON,HTTP 非 2xx 抛出 ApiError(保留后端 message)
//   - 支持 Authorization: Bearer <accessToken>
//   - 不实现自动 refresh,不实现重试机制 (按施工单 02 要求)
//
// 用法:
//   import { apiGet, apiPost, apiPut, apiDelete } from "@/src/api/client";
//   const me = await apiGet<MeResponse>("/auth/me", { accessToken });

/** 后端统一响应外壳 (success/message/data) */
export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/** HTTP 非 2xx 时抛出的统一错误,保留后端 message 便于 UI 显示 */
export class ApiError extends Error {
  readonly status: number;
  readonly endpoint: string;
  readonly method: string;
  readonly raw: unknown;

  constructor(
    message: string,
    opts: {
      status: number;
      endpoint: string;
      method: string;
      raw?: unknown;
    },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status;
    this.endpoint = opts.endpoint;
    this.method = opts.method;
    this.raw = opts.raw;
  }
}

/** 读取 API Base URL,未配置时给出明确错误而不是静默失败 */
function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_BASE_URL;
  if (url) {
    // 去掉末尾斜杠,避免 //auth/login 这样的双斜杠
    return url.replace(/\/+$/, "");
  }
  // dev 模式下提供 fallback,方便开箱即用 (生产构建必须配置 VITE_API_BASE_URL)
  // 注意:这里不是"写死 localhost 在业务 API 文件中",而是基础设施层的 dev 默认值
  if (import.meta.env.DEV) {
    return "http://localhost:3001/api";
  }
  throw new Error(
    "VITE_API_BASE_URL 未配置,请在 .env 中设置 (例如 http://localhost:3001/api)",
  );
}

/** 拼接最终 URL: baseUrl + path (path 必须以 / 开头) */
function buildUrl(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`API path 必须以 / 开头,收到: ${path}`);
  }
  return `${getBaseUrl()}${path}`;
}

/** 构造请求头 */
function buildHeaders(opts: RequestOptions): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (opts.body !== undefined && opts.body !== null) {
    headers["Content-Type"] = "application/json";
  }

  if (opts.accessToken) {
    headers["Authorization"] = `Bearer ${opts.accessToken}`;
  }

  // 允许调用方覆盖任意 header
  if (opts.headers) {
    Object.assign(headers, opts.headers);
  }

  return headers;
}

export interface RequestOptions {
  /** 已登录用户的 Access Token,会作为 Authorization: Bearer 头发送 */
  accessToken?: string;
  /** 请求体,会被 JSON.stringify */
  body?: unknown;
  /** 额外请求头 (会覆盖默认头) */
  headers?: Record<string, string>;
  /** fetch signal,支持外部中断 */
  signal?: AbortSignal;
}

/**
 * 统一 request 方法.
 *
 * 行为:
 *   1. 发起 fetch 请求
 *   2. 解析 JSON (即使后端返回非 JSON 也尽量保留原始 body)
 *   3. HTTP 非 2xx 时抛 ApiError,保留后端 message
 *   4. 2xx 时返回解析后的 data 字段 (剥去 envelope)
 *   5. 网络错误时抛原 TypeError,由调用方处理
 */
export async function apiRequest<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const url = buildUrl(path);
  const headers = buildHeaders(opts);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });
  } catch (err) {
    // fetch 网络层错误 (DNS/连接中断/超时) 会以 TypeError 形式抛出
    // 保留原始错误对象,上层可以自行重试或提示用户
    throw err;
  }

  // 尝试解析 JSON 后端响应 (后端返回 ApiEnvelope)
  let parsed: unknown = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      parsed = await response.json();
    } catch {
      parsed = null;
    }
  } else if (response.status !== 204) {
    // 非 JSON 响应,保留文本以便调试
    try {
      parsed = await response.text();
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const envelope = parsed as ApiEnvelope<unknown> | undefined;
    const message =
      (envelope && typeof envelope.message === "string" && envelope.message) ||
      `请求失败 (${response.status})`;
    throw new ApiError(message, {
      status: response.status,
      endpoint: path,
      method,
      raw: parsed,
    });
  }

  // 成功响应:剥去 envelope,返回 data 字段
  // 兼容两种情况:
  //   1. 标准 envelope { success, message, data }
  //   2. 直接返回 data (无 envelope)
  if (
    parsed &&
    typeof parsed === "object" &&
    "success" in (parsed as Record<string, unknown>)
  ) {
    const envelope = parsed as ApiEnvelope<T>;
    return envelope.data as T;
  }

  return parsed as T;
}

/** GET 请求 */
export function apiGet<T>(
  path: string,
  opts: Omit<RequestOptions, "body"> = {},
): Promise<T> {
  return apiRequest<T>("GET", path, opts);
}

/** POST 请求 */
export function apiPost<T>(
  path: string,
  body?: unknown,
  opts: Omit<RequestOptions, "body"> = {},
): Promise<T> {
  return apiRequest<T>("POST", path, { ...opts, body });
}

/** PUT 请求 */
export function apiPut<T>(
  path: string,
  body?: unknown,
  opts: Omit<RequestOptions, "body"> = {},
): Promise<T> {
  return apiRequest<T>("PUT", path, { ...opts, body });
}

/** DELETE 请求 */
export function apiDelete<T>(
  path: string,
  opts: Omit<RequestOptions, "body"> = {},
): Promise<T> {
  return apiRequest<T>("DELETE", path, opts);
}
