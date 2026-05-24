"use client";

import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function ProfilePage() {
  return (
    <AuthGuard title="마이페이지">
      <div className="flex flex-col h-full bg-white">
        <TopBar title="마이페이지" />
        <main className="flex-1 overflow-y-auto no-scrollbar flex items-center justify-center">
          <p className="text-[14px] text-grey-400">준비 중이에요</p>
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
