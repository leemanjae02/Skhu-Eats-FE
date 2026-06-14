export interface User {
  id: string;
  /** API 명세 GET /users/me 의 user_id (id 와 동일 값) */
  user_id?: string;
  email: string;
  nickname: string;
  avatar: string | null;
  department?: string;
  admission_year?: string | number;
  bio?: string;
  food_categories?: string[];
}

/** POST /auth/login, POST /auth/refresh 응답 */
export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  nickname: string;
  user_id: string;
}

/** POST /auth/register 응답 */
export interface RegisterResponse {
  message: string;
  user_id: string;
  email: string;
  nickname: string;
  department?: string;
  admission_year?: number;
  bio?: string;
  email_verified?: boolean;
}

/** PATCH /users/me — 내 프로필 수정 요청 본문 (명세: 닉네임만 수정) */
export interface UpdateProfilePayload {
  nickname: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  nickname: string;
  department: string;
  /** API 명세: integer */
  admission_year: number;
  bio?: string;
  food_categories?: string[];
}

/** GET /users/me/mypage 이력 미리보기 항목 */
export interface MyPageHistoryPreview {
  participation_id: string;
  participation_status: string;
  post_id: string;
  title: string;
  food_categories: string[];
  location: string;
  meeting_time: string;
  max_participants: number;
  post_status: string;
  post_status_label: string;
}

/** GET /users/me/mypage 응답 */
export interface MyPageResponse {
  user_id: string;
  email: string;
  nickname: string;
  department: string;
  admission_year: number;
  bio?: string;
  food_categories: string[];
  avatar?: string;
  total_join_count: number;
  total_post_count: number;
  manner_score: number;
  recent_histories: MyPageHistoryPreview[];
}
