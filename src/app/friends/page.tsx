"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function FriendsPage() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  if (!_hasHydrated || !isAuthenticated) {
    return <div className="flex-1 bg-white" />;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <TopBar title="밥친구" />
      <main className="flex-1 overflow-y-auto no-scrollbar flex items-center justify-center">
        <p className="text-[14px] text-grey-400">준비 중이에요</p>
      </main>
      <BottomNav />
    </div>
  );
}
