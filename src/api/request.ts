import { useAuthStore } from "../store/User";

const BASE_URL = "/api/v1";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  let body = options.body;
  if (body != null && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }
  const response = await fetch(`${BASE_URL}${path}`, { ...options, body, headers } as RequestInit);
  const isAuthEndpoint = path.startsWith("/auth/");
  if (response.status === 401 && !isAuthEndpoint) {
    useAuthStore.getState().clearAuth();
    window.location.href = "/login";
    throw new ApiError(401, "登录状态已失效，请重新登录");
  }
  if (response.status === 204) {
    return undefined as T;
  }
  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // 响应不是合法 JSON（如后端未启动时代理返回的 500 纯文本），保持 data 为 null
  }
  if (!response.ok) {
    const record = data as Record<string, unknown> | null;
    const detail =
      record && typeof record.detail === "string" ? record.detail : `请求失败 (${response.status})`;
    throw new ApiError(response.status, detail);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body } as RequestInit),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body } as RequestInit),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  postForm: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form }),
  putForm: <T>(path: string, form: FormData) => request<T>(path, { method: "PUT", body: form }),
};
