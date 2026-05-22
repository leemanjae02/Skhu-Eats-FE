"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();

  const [isMounted, setIsMounted] = useState(
    () => typeof window !== "undefined" && useAuthStore.getState()._hasHydrated,
  );

  useEffect(() => {
    if (!isMounted) setIsMounted(true);
  }, [isMounted]);

  if (!isMounted || !_hasHydrated) {
    return <div className="flex-1 bg-white" />;
  }

  if (!isAuthenticated) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-white animate-fade-slide-up">
      <TopBar
        showLogo
        rightAction={
          <div className="relative p-2 cursor-pointer">
            <Bell className="w-[22px] h-[22px] text-grey-700" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-[1.5px] border-white" />
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto no-scrollbar">
        <section className="px-5 py-6 bg-white">
          <h1 className="text-2xl font-bold text-grey-900 leading-8 tracking-tight">
            {user?.nickname}님,<br />
            오늘 점심 같이 먹을래요?
          </h1>
          <div className="flex items-center gap-1 mt-2.5 text-[13px] font-medium text-grey-600">
            <span>모집 중 <strong className="font-bold text-grey-900">3</strong></span>
            <div className="w-0.5 h-0.5 rounded-full bg-grey-400 mx-1" />
            <span>마감 임박 <strong className="font-bold text-grey-900">1</strong></span>
          </div>
        </section>

        <div className="h-2 bg-grey-100" />

        <section className="px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar bg-white sticky top-0 z-10 border-b border-grey-50">
          <Chip active>전체</Chip>
          <Chip>점심</Chip>
          <Chip>저녁</Chip>
          <Chip>학생회관</Chip>
          <Chip>정문</Chip>
          <Chip>한식</Chip>
          <Chip>일식</Chip>
        </section>

        <section className="flex-1 bg-grey-50 px-5 py-4 space-y-2.5 min-h-screen">
          <Card
            thumbnail="🍲"
            category="한식"
            status="urgent"
            time="12:15"
            title="부대찌개 + 공기밥"
            location="학생회관 1층"
            currentParticipants={3}
            maxParticipants={4}
            avatars={[]}
          />
          <Card
            thumbnail="🥘"
            category="한식"
            status="active"
            time="12:30"
            title="김치찌개 + 공기밥"
            location="정문 앞 한솥"
            currentParticipants={1}
            maxParticipants={3}
            avatars={[]}
          />
          <Card
            thumbnail="🍣"
            category="일식"
            status="active"
            time="13:00"
            title="스시로 런치세트"
            location="정문 스시로"
            currentParticipants={2}
            maxParticipants={4}
            avatars={[]}
          />
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
