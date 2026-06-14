import { Post, CreatePostPayload, CreatePostResponse, JoinPostResponse, HistoryResponse } from "@/types/post";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { message?: string }).message ?? `HTTP ${res.status}`);
  return json as T;
}

// join_status는 스웨거 명세상 string이나 boolean 모두 허용 — 내부적으로 boolean으로 정규화
const toJoinedBool = (v: unknown): boolean => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toUpperCase() === "JOINED";
  return !!v;
};

export const postService = {
  getPosts: (params?: { time_slot?: string; status?: string }) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return fetchApi<Post[]>(`/posts${query}`);
  },

  getPost: async (id: string) => {
    const data = await fetchApi<Post & { join_status: unknown }>(`/posts/${id}`);
    return {
      ...data,
      join_status: data.join_status !== undefined ? toJoinedBool(data.join_status) : undefined,
    } as Post;
  },

  // 내 모임 목록 — created(내가 만든) / joined(참여 중)
  getMyPosts: (type: "created" | "joined" = "created") =>
    fetchApi<Post[]>(type === "joined" ? "/users/me/posts" : "/posts/myposts"),

  // 내 참여 이력 (페이지네이션)
  getHistory: (page = 1, limit = 20) =>
    fetchApi<HistoryResponse>(`/users/me/history?page=${page}&limit=${limit}`),

  createPost: (data: CreatePostPayload) =>
    fetchApi<CreatePostResponse>("/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  updatePost: (id: string, data: Partial<CreatePostPayload>) =>
    fetchApi<Post>(`/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  deletePost: (id: string) =>
    fetchApi<{ message: string }>(`/posts/${id}`, { method: "DELETE" }),

  joinPost: async (id: string) => {
    const data = await fetchApi<JoinPostResponse & { join_status: unknown }>(`/posts/${id}/join`, { method: "POST" });
    return { ...data, join_status: toJoinedBool(data.join_status) } as JoinPostResponse;
  },

  leavePost: (id: string) =>
    fetchApi<{ message: string }>(`/posts/${id}/leave`, { method: "DELETE" }),
};
