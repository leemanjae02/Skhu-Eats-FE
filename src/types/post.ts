export type PostStatus = "active" | "urgent" | "closed";

export interface Post {
  post_id: string;
  host_id: string;
  host_nickname: string;
  host_department?: string;
  host_admission_year?: string;
  host_manner_score?: number;
  title: string;
  food_categories: string[];
  location: string;
  meeting_time: string;
  deadline?: string;
  max_participants: number;
  current_participants: number;
  memo?: string;
  kakao_link?: string;
  status: PostStatus;
  status_label?: string;
  /** GET /posts/{postId} 상세 응답 전용 — 내 참여 여부 */
  join_status?: boolean;
  join_button_label?: string;
  can_join?: boolean;
  created_at: string;
  updated_at?: string;
}

/** POST /posts — 모집글 작성 요청 본문 (API 명세 기준) */
export interface CreatePostPayload {
  title: string;
  food_categories: string[];
  location: string;
  /** ISO 8601 */
  meeting_time: string;
  /** 2~4명 */
  max_participants: number;
  memo?: string;
  kakao_link?: string;
}

/** POST /posts 성공 응답 */
export interface CreatePostResponse {
  post_id: string;
}

/** POST /posts/{postId}/join 응답 */
export interface JoinPostResponse {
  post_id: string;
  current_participants: number;
  max_participants: number;
  status: PostStatus;
  status_label?: string;
  join_status: boolean;
  join_button_label?: string;
  can_join: boolean;
}

/** GET /users/me/history 항목 (참여 이력) */
export interface Participation {
  participation_id: string;
  post_id: string;
  title: string;
  location: string;
  meeting_time: string;
  status: "completed" | "upcoming";
}

/** GET /users/me/history 응답 (페이지네이션) */
export interface HistoryResponse {
  data: Participation[];
  page: number;
  limit: number;
  total_count: number;
}
