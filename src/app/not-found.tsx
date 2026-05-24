import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없어요 | 성공회대 밥친구",
};

export default function NotFound() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-4 bg-white">
      <p className="text-5xl">🍽️</p>
      <h1 className="text-[20px] font-bold text-grey-900">페이지를 찾을 수 없어요</h1>
      <p className="text-[14px] text-grey-500">요청하신 페이지가 존재하지 않아요</p>
      <Link
        href="/"
        className="mt-2 px-6 py-2.5 rounded-full bg-primary text-grey-900 text-[14px] font-semibold"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
