import "server-only";

const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return headers;
}

function buildAuthHeaders(token?: string): Record<string, string> {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function serverFetch<T = unknown>(
  path: string,
  token?: string,
  init?: RequestInit,
): Promise<T> {
  if (!BASE)
    throw new Error("[serverFetch] NEXT_PUBLIC_API_BASE_URL is not configured");

  const method = (init?.method ?? "GET").toUpperCase();
  const isSafeMethod = ["GET", "HEAD"].includes(method);
  const isFormData = init?.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isSafeMethod && !isFormData ? { "Content-Type": "application/json" } : {}),
    ...normalizeHeaders(init?.headers),
    ...buildAuthHeaders(token),
  };

  const fetchOptions: RequestInit = {
    ...init,
    method,
    headers,
  };

  if (isSafeMethod) {
    delete fetchOptions.body;
  }

  const res = await fetch(`${BASE}${path}`, fetchOptions);

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { message?: string }).message ?? `HTTP ${res.status}`);
  return json as T;
}

export async function serverFetchRaw(
  path: string,
  token?: string,
  init?: RequestInit,
): Promise<{ status: number; data: unknown }> {
  if (!BASE)
    throw new Error("[serverFetch] NEXT_PUBLIC_API_BASE_URL is not configured");

  const method = (init?.method ?? "GET").toUpperCase();
  const isSafeMethod = ["GET", "HEAD"].includes(method);

  const headers: Record<string, string> = {
    ...(!isSafeMethod ? { "Content-Type": "application/json" } : {}),
    ...normalizeHeaders(init?.headers),
    ...buildAuthHeaders(token),
  };

  const fetchOptions: RequestInit = {
    ...init,
    method,
    headers,
  };

  // Ensure body is not present for GET/HEAD
  if (isSafeMethod) {
    delete fetchOptions.body;
  }

  const res = await fetch(`${BASE}${path}`, fetchOptions);

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}
