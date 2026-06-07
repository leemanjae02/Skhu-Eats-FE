import { User } from "./auth";

export type PostStatus = "active" | "urgent" | "closed";

export interface Post {
  id: string;
  host_id: string;
  host_nickname: string;
  menu: string;
  category: string;
  /** 명세 food_categories[] (다중 카테고리). category 는 대표값(첫 번째). */
  food_categories?: string[];
  thumbnail: string;
  meeting_time: string;
  location: string;
  memo?: string;
  max_participants: number;
  current_participants: number;
  status: PostStatus;
  created_at: string;
  kakao_link?: string;
  participants?: User[];
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
