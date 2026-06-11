import membersData from "./data/members.json";
import { createMembers } from "./factories/member.factory";
import { User } from "@/types/auth";

export interface Member extends User {
  password: string;
}

export const members: Member[] = [
  ...membersData.map((m) => ({ ...m, avatar: m.avatar || null })),
  ...createMembers(10),
];

export const pendingCodes = new Map<string, string>();
export const activeSessions = new Map<
  string,
  { email: string; type: "access" | "refresh" }
>();

export const sanitizeUser = (user: Member): User => {
  // password 제외, 명세 GET /users/me: { userId, email, nickname } 포함 (풀 프로필 유지)
  return {
    id: user.id,
    userId: user.id,
    email: user.email,
    nickname: user.nickname,
    avatar: user.avatar,
    department: user.department,
    admission_year: user.admission_year,
    bio: user.bio,
    category: user.category,
  };
};

export const makeTokens = (email: string) => {
  const access_token = `mock-access-${Math.random().toString(36).slice(2, 11)}`;
  const refresh_token = `mock-refresh-${Math.random().toString(36).slice(2, 11)}`;
  activeSessions.set(access_token, { email, type: "access" });
  activeSessions.set(refresh_token, { email, type: "refresh" });
  return { access_token, refresh_token };
};

/** Authorization 헤더의 access token 으로 현재 유저를 해석 */
export const userFromAuthHeader = (authHeader: string | null): Member | undefined => {
  const token = authHeader?.replace("Bearer ", "");
  const session = token ? activeSessions.get(token) : undefined;
  if (!session || session.type !== "access") return undefined;
  return members.find((m) => m.email === session.email);
};
