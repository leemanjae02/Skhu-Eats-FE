import { http, HttpResponse } from "msw";
import membersData from "../data/members.json";
import { createMembers } from "../factories/member.factory";
import { User } from "@/types/auth";

interface Member extends User {
  password: string;
}

interface LoginBody { email: string; password: string }
interface SendCodeBody { email: string }
interface VerifyCodeBody { email: string; code: string }
interface CheckNicknameBody { nickname: string }
interface RegisterBody {
  email: string; password: string; nickname: string;
  department: string; admission_year: string;
  bio?: string; category?: string[];
}

const members: Member[] = [
  ...membersData.map(m => ({
    ...m,
    avatar: m.avatar || null
  })),
  ...createMembers(10)
];

const pendingCodes = new Map<string, string>();
const activeSessions = new Map<string, string>(); // token → email

const sanitizeUser = (user: Member): User => {
  const { password, ...safeUser } = user;
  return safeUser;
};

export const memberHandlers = [
  // Auth: Login
  http.post(/\/auth\/login$/, async ({ request }) => {
    console.log(`[MSW Handler] Intercepted POST /api/auth/login`);
    try {
      const body = await request.json() as LoginBody;
      console.log(`[MSW Handler] Body:`, body);

      const { email, password } = body;
      const user = members.find(
        (m) => m.email === email && m.password === password,
      );

      if (user) {
        console.log(`[MSW Handler] Login success for ${email}`);
        const token = `mock-jwt-token-${Math.random().toString(36).slice(2, 11)}`;
        activeSessions.set(token, user.email);
        return HttpResponse.json({
          message: "Login successful",
          user: sanitizeUser(user),
          token,
        });
      }
      console.log(`[MSW Handler] Login failed for ${email}`);
      return new HttpResponse(JSON.stringify({ message: "아이디 또는 비밀번호가 틀렸어요" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      console.error(`[MSW Handler] Error parsing login body:`, err);
      return new HttpResponse(JSON.stringify({ message: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }),

  // Auth: Send Code
  http.post(/\/auth\/send-code$/, async ({ request }) => {
    console.log(`[MSW Handler] Intercepted POST /api/auth/send-code`);
    const { email } = (await request.json()) as SendCodeBody;
    if (!email.endsWith("@skhu.ac.kr")) {
      return HttpResponse.json({ message: "학교 이메일만 사용 가능해요" }, { status: 400 });
    }
    pendingCodes.set(email, "123456");
    return HttpResponse.json({ message: "인증코드가 발송됐어요" });
  }),

  // Auth: Verify Code
  http.post(/\/auth\/verify-code$/, async ({ request }) => {
    console.log(`[MSW Handler] Intercepted POST /api/auth/verify-code`);
    const { email, code } = (await request.json()) as VerifyCodeBody;
    if (pendingCodes.get(email) === code) {
      pendingCodes.delete(email);
      return HttpResponse.json({ verified: true });
    }
    return HttpResponse.json({ message: "인증코드가 올바르지 않아요" }, { status: 400 });
  }),

  // Auth: Check Nickname
  http.post(/\/auth\/check-nickname$/, async ({ request }) => {
    console.log(`[MSW Handler] Intercepted POST /api/auth/check-nickname`);
    const { nickname } = (await request.json()) as CheckNicknameBody;
    const taken = members.some((m) => m.nickname === nickname);
    if (taken) {
      return HttpResponse.json({ message: "이미 사용 중인 닉네임이에요" }, { status: 409 });
    }
    return HttpResponse.json({ available: true });
  }),

  // Auth: Register
  http.post(/\/auth\/register$/, async ({ request }) => {
    console.log(`[MSW Handler] Intercepted POST /api/auth/register`);
    const body = (await request.json()) as RegisterBody;
    const newUser: Member = {
      id: String(members.length + 101),
      email: body.email,
      password: body.password,
      nickname: body.nickname,
      department: body.department,
      admissionYear: body.admission_year,
      avatar: null,
      bio: body.bio,
      category: body.category,
    };
    members.push(newUser);
    const token = `mock-jwt-token-${Math.random().toString(36).slice(2, 11)}`;
    activeSessions.set(token, newUser.email);
    return HttpResponse.json(
      {
        message: "회원가입이 완료됐어요",
        user: sanitizeUser(newUser),
        token,
      },
      { status: 201 },
    );
  }),

  // Member: Get Me
  http.get(/\/users\/me$/, ({ request }) => {
    console.log(`[MSW Handler] Intercepted GET /api/members/me`);
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    const email = token ? activeSessions.get(token) : undefined;
    const user = email ? members.find((m) => m.email === email) : members[0];
    if (!user) return new HttpResponse(null, { status: 401 });
    return HttpResponse.json(sanitizeUser(user));
  }),
];
