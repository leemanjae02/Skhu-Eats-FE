export interface User {
  id: string;
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
