import { RegisterPayload, LoginResponse, RegisterResponse, User, UpdateProfilePayload, MyPageResponse } from "@/types/auth";

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

  verifyCode: (email: string, code: string) =>
    post<{ message: string }>("/auth/verify-code", { email, code }),

  checkNickname: (nickname: string) =>
    get<{ available: boolean; message: string }>(`/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`),

  register: (data: RegisterPayload) =>
    post<RegisterResponse>("/auth/register", data),

  refresh: () =>
    post<LoginResponse>("/auth/refresh", {}),

  getMe: () =>
    get<User>("/users/me"),

  getMyPage: (params?: { history_limit?: number }) => {
    const query = params?.history_limit !== undefined ? `?history_limit=${params.history_limit}` : "";
    return get<MyPageResponse>(`/users/me/mypage${query}`);
  },

  updateProfile: (data: UpdateProfilePayload) =>
    patch<User>("/users/me", data),

  withdraw: () =>
    del("/users/me"),

  resetSendCode: (email: string) =>
    post<{ message: string }>("/auth/password/reset/send-code", { email }),

  resetVerifyCode: (email: string, code: string) =>
    post<{ message: string }>("/auth/password/reset/verify-code", { email, code }),

  resetPassword: (email: string, new_password: string) =>
    post<{ message: string }>("/auth/password/reset", { email, new_password }),
};
