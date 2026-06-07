export interface User {
  id: string;
  /** API 명세 GET /users/me 의 userId (id 와 동일 값) */
  userId?: string;
  email: string;
  nickname: string;
  avatar: string | null;
  department?: string;
  admission_year?: string;
  bio?: string;
  category?: string[];
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  nickname: string;
  department: string;
  admission_year: string;
  bio?: string;
  category?: string[];
}
