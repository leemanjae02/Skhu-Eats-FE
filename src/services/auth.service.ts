import { RegisterPayload, LoginResponse, RegisterResponse, User, UpdateProfilePayload } from "@/types/auth";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { message?: string }).message ?? `HTTP ${res.status}`);
  return json as T;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { message?: string }).message ?? `HTTP ${res.status}`);
  return json as T;
}

async function del(path: string): Promise<void> {
  const res = await fetch(path, { method: "DELETE" });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { message?: string }).message ?? `HTTP ${res.status}`);
  }
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { message?: string }).message ?? `HTTP ${res.status}`);
  return json as T;
}

export const authService = {
  login: (email: string, password: string) =>
    post<LoginResponse>("/auth/login", { email, password }),

  sendCode: (email: string) =>
    post<{ message: string }>("/auth/send-code", { email }),

  // 성공 시 200 { message }, 실패 시 4xx → 호출부에서 예외로 판별
  verifyCode: (email: string, code: string) =>
    post<{ message: string }>("/auth/verify-code", { email, code }),

  checkNickname: (nickname: string) =>
    get<{ available: boolean }>(`/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`),

  register: (data: RegisterPayload) =>
    post<RegisterResponse>("/auth/register", data),

  refresh: () =>
    post<LoginResponse>("/auth/refresh", {}),

  getMe: () =>
    get<User>("/users/me"),

  updateProfile: (data: UpdateProfilePayload) =>
    patch<User>("/users/me", data),

  withdraw: () =>
    del("/users/me"),
};
