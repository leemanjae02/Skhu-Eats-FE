export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar: string | null;
  department?: string;
  admissionYear?: string;
  bio?: string;
  category?: string[];
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  nickname: string;
  department: string;
  admissionYear: string;
  bio?: string;
  category?: string[];
}
