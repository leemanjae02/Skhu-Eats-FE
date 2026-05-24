import { RegisterPayload, AuthResponse, User } from "@/types/auth";

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

export const authService = {
  login: (email: string, password: string) =>
    post<Omit<AuthResponse, "access_token" | "refresh_token">>("/auth/login", { email, password }),

  sendCode: (email: string) =>
    post<{ message: string }>("/auth/send-code", { email }),

  verifyCode: (email: string, code: string) =>
    post<{ verified: boolean }>("/auth/verify-code", { email, code }),

  checkNickname: (nickname: string) =>
    post<{ available: boolean }>("/auth/check-nickname", { nickname }),

  register: (data: RegisterPayload) =>
    post<Omit<AuthResponse, "access_token" | "refresh_token">>("/auth/register", data),

  refresh: () =>
    post<{ message: string }>("/auth/refresh", {}),

  getMe: () =>
    get<User>("/users/me"),
};
