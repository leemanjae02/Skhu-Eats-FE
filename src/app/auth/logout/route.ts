import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverFetchRaw } from "@/lib/fetch";

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("auth-token")?.value;
  const refreshToken = cookieStore.get("refresh-token")?.value;

  if (refreshToken) {
    await serverFetchRaw("/auth/logout", undefined, {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
  }

  const res = NextResponse.json({ message: "로그아웃 되었습니다." });
  res.cookies.delete("auth-token");
  res.cookies.delete("refresh-token");
  return res;
}
