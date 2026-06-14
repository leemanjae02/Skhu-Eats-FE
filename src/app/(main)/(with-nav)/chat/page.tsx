"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";

export default function ChatPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-white">
      <TopBar
        title="채팅"
        leftAction={
          <button
            onClick={() => router.back()}
            className="w-11 h-11 flex items-center justify-center text-grey-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />
      <main className="flex-1 overflow-y-auto no-scrollbar flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-grey-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">💬</span>
          </div>
          <div>
            <h2 className="text-[17px] font-bold text-grey-700 mb-1">채팅 서비스 준비 중</h2>
            <p className="text-[14px] text-grey-500 leading-relaxed">
              조금만 기다려주세요!<br />
              곧 밥친구와 대화할 수 있어요.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
