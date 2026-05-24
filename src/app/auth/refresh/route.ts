import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverFetchRaw } from "@/lib/fetch";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh-token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "refresh_token이 없습니다." }, { status: 401 });
  }

  const { status, data } = await serverFetchRaw("/auth/refresh", undefined, {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
    headers: { "Content-Type": "application/json" },
  });

  const d = data as Record<string, unknown>;
  if (status < 200 || status >= 300 || !d.access_token) {
    const res = NextResponse.json(data, { status });
    res.cookies.delete("auth-token");
    res.cookies.delete("refresh-token");
    return res;
  }

  const res = NextResponse.json({ message: "토큰이 갱신됐어요." });
  res.cookies.set("auth-token", d.access_token as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
