import { http, HttpResponse } from "msw";
import {
  Member,
  members,
  pendingCodes,
  activeSessions,
  sanitizeUser,
  makeTokens,
  userFromAuthHeader,
} from "../store";

interface LoginBody { email: string; password: string }
interface SendCodeBody { email: string }
interface VerifyCodeBody { email: string; code: string }
interface CheckNicknameBody { nickname: string }
interface RegisterBody {
  email: string; password: string; nickname: string;
  department: string; admission_year: string;
  bio?: string; category?: string[];
}
interface RefreshBody { refresh_token: string }

export const memberHandlers = [
  // Auth: Login
  http.post(/\/auth\/login$/, async ({ request }) => {
    console.log(`[MSW Handler] Intercepted POST /auth/login`);
    try {
      const body = await request.json() as LoginBody;
      const { email, password } = body;
      const user = members.find(m => m.email === email && m.password === password);

      if (user) {
        const tokens = makeTokens(user.email);
        return HttpResponse.json({
          message: "Login successful",
          user: sanitizeUser(user),
          ...tokens,
        });
      }
      return new HttpResponse(
        JSON.stringify({ message: "아이디 또는 비밀번호가 틀렸어요" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      console.error(`[MSW Handler] Error parsing login body:`, err);
      return new HttpResponse(
        JSON.stringify({ message: "Invalid request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }),

  // Auth: Send Code
  http.post(/\/auth\/send-code$/, async ({ request }) => {
    const { email } = (await request.json()) as SendCodeBody;
    if (!email.endsWith("@office.skhu.ac.kr")) {
      return HttpResponse.json({ message: "학교 이메일만 사용 가능해요" }, { status: 400 });
    }
    pendingCodes.set(email, "123456");
    return HttpResponse.json({ message: "인증코드가 발송됐어요" });
  }),

  // Auth: Verify Code
  http.post(/\/auth\/verify-code$/, async ({ request }) => {
    const { email, code } = (await request.json()) as VerifyCodeBody;
    if (pendingCodes.get(email) === code) {
      pendingCodes.delete(email);
      // 실제 백엔드 스펙: 200 { message }
      return HttpResponse.json({ message: "이메일 인증 완료" });
    }
    return HttpResponse.json({ message: "인증코드가 올바르지 않아요" }, { status: 400 });
  }),

  // Auth: Check Nickname — 스펙대로 항상 200, available: true/false
  http.post(/\/auth\/check-nickname$/, async ({ request }) => {
    const { nickname } = (await request.json()) as CheckNicknameBody;
    const taken = members.some(m => m.nickname === nickname);
    return HttpResponse.json({ available: !taken });
  }),

  // Auth: Register
  http.post(/\/auth\/register$/, async ({ request }) => {
    const body = (await request.json()) as RegisterBody;
    const emailTaken = members.some(m => m.email === body.email);
    if (emailTaken) {
      return HttpResponse.json({ message: "이미 사용 중인 이메일이에요" }, { status: 409 });
    }
    const nicknameTaken = members.some(m => m.nickname === body.nickname);
    if (nicknameTaken) {
      return HttpResponse.json({ message: "이미 사용 중인 닉네임이에요" }, { status: 409 });
    }
    const newUser: Member = {
      id: String(members.length + 101),
      email: body.email,
      password: body.password,
      nickname: body.nickname,
      department: body.department,
      admission_year: body.admission_year,
      avatar: null,
      bio: body.bio,
      category: body.category,
    };
    members.push(newUser);
    const { access_token } = makeTokens(newUser.email);
    return HttpResponse.json(
      { message: "회원가입이 완료됐어요", user: sanitizeUser(newUser), access_token },
      { status: 201 },
    );
  }),

  // Auth: Refresh
  http.post(/\/auth\/refresh$/, async ({ request }) => {
    const body = (await request.json()) as RefreshBody;
    const session = activeSessions.get(body.refresh_token);
    if (!session || session.type !== "refresh") {
      return HttpResponse.json({ message: "유효하지 않은 refresh_token이에요" }, { status: 401 });
    }
    // 기존 refresh token 무효화
    activeSessions.delete(body.refresh_token);
    const newAccess = `mock-access-${Math.random().toString(36).slice(2, 11)}`;
    activeSessions.set(newAccess, { email: session.email, type: "access" });
    return HttpResponse.json({ access_token: newAccess });
  }),

  // Auth: Logout
  http.post(/\/auth\/logout$/, async ({ request }) => {
    const body = (await request.json()) as RefreshBody;
    const session = activeSessions.get(body.refresh_token);
    if (session) activeSessions.delete(body.refresh_token);
    return HttpResponse.json({ message: "로그아웃 됐어요" });
  }),

  // Member: Get Me
  http.get(/\/users\/me$/, ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? activeSessions.get(token) : undefined;
    if (!session || session.type !== "access") {
      return new HttpResponse(null, { status: 401 });
    }
    const user = members.find(m => m.email === session.email);
    if (!user) return new HttpResponse(null, { status: 401 });
    return HttpResponse.json(sanitizeUser(user));
  }),

  // Member: 프로필 수정 — PUT /users (명세: 닉네임만 수정)
  http.put(/\/users(\?.*)?$/, async ({ request }) => {
    const user = userFromAuthHeader(request.headers.get("Authorization"));
    if (!user) {
      return HttpResponse.json(
        { code: "AUTH_401_TOKEN_REQUIRED", message: "로그인이 필요해요" },
        { status: 401 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as { nickname?: string };
    if (typeof body.nickname !== "string" || body.nickname.trim().length === 0) {
      return HttpResponse.json(
        { code: "INVALID_REQUEST", message: "입력값 형식이 올바르지 않아요" },
        { status: 400 },
      );
    }

    const nickname = body.nickname.trim();
    const taken = members.some((m) => m.id !== user.id && m.nickname === nickname);
    if (taken) {
      return HttpResponse.json(
        { code: "USER_409_NICK", message: "이미 사용 중인 닉네임이에요" },
        { status: 409 },
      );
    }

    user.nickname = nickname;
    // 명세 응답: { userId, email, nickname } (풀 프로필 유지하여 화면 정보 보존)
    return HttpResponse.json(sanitizeUser(user));
  }),

  // Member: 회원 탈퇴 — DELETE /users/me (Hard Delete + 토큰 폐기, 204)
  http.delete(/\/users\/me$/, ({ request }) => {
    const user = userFromAuthHeader(request.headers.get("Authorization"));
    if (!user) return new HttpResponse(null, { status: 401 });

    // User 행 실제 삭제
    const idx = members.findIndex((m) => m.id === user.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    members.splice(idx, 1);

    // 해당 사용자의 access/refresh 토큰 모두 폐기
    for (const [token, session] of activeSessions) {
      if (session.email === user.email) activeSessions.delete(token);
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
