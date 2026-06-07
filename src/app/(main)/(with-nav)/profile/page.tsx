"use client";

import { TopBar } from "@/components/layout/TopBar";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Utensils, Crown, Bell, Lock, FileText, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex flex-col h-full bg-white">
      <TopBar
        title="마이페이지"
        rightAction={
          <button className="p-2 text-grey-700">
            <Settings className="w-5 h-5" />
          </button>
        }
      />
      <main className="flex-1 overflow-y-auto no-scrollbar pb-10">
        <section className="px-5 py-6 bg-white">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-14 h-14 border-2 border-primary-100">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="bg-primary-200 text-primary-700 text-xl font-bold">
                {user?.nickname?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-[22px] font-bold text-grey-900 tracking-tight">
                {user?.nickname}
              </h2>
              <p className="text-[14px] font-medium text-grey-600 mt-0.5">
                {user?.department} · {user?.admission_year?.slice(2)}학번
              </p>
            </div>
          </div>

          {user?.category && user.category.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {user.category.map((cat) => (
                <Badge key={cat} variant="food" className="h-7 px-3 text-[13px]">
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          {user?.bio && (
            <div className="bg-grey-100 rounded-xl px-3.5 py-3 text-[14px] text-grey-700 leading-relaxed mb-4">
              {user.bio}
            </div>
          )}

          <button className="btn-weak-primary w-full h-11 text-[15px] font-semibold">
            프로필 수정
          </button>
        </section>

        <div className="h-2 bg-grey-100" />

        <section className="bg-white">
          <div className="flex items-center gap-3.5 px-5 py-4 cursor-pointer active:bg-grey-50 border-b border-grey-100">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-primary-700" />
            </div>
            <div className="flex-1 font-semibold text-grey-900">총 참여</div>
            <div className="flex items-center gap-1.5 text-grey-900 font-bold">
              12회 <ChevronRight className="w-4.5 h-4.5 text-grey-400" />
            </div>
          </div>
          <div className="flex items-center gap-3.5 px-5 py-4 cursor-pointer active:bg-grey-50">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Crown className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 font-semibold text-grey-900">내가 만든 모임</div>
            <div className="flex items-center gap-1.5 text-grey-900 font-bold">
              5회 <ChevronRight className="w-4.5 h-4.5 text-grey-400" />
            </div>
          </div>
        </section>

        <div className="h-2 bg-grey-100" />

        <section className="bg-white">
           <div className="px-5 py-4 font-bold text-grey-900">참여 이력</div>
           {[
             { date: "3/25", menu: "김치찌개 + 공기밥", place: "학생회관 1층" },
             { date: "3/20", menu: "떡볶이 세트", place: "정문 분식집" },
             { date: "3/14", menu: "스시로 런치", place: "정문 스시로" },
           ].map((item, i) => (
             <div key={i} className="flex items-center justify-between px-5 py-3.5 border-t border-grey-100">
                <span className="text-[13px] font-medium text-grey-500 w-12">{item.date}</span>
                <div className="flex-1 px-2">
                  <div className="text-[15px] font-semibold text-grey-800">{item.menu}</div>
                  <div className="text-[13px] text-grey-500">{item.place}</div>
                </div>
                <Badge variant="closed">완료</Badge>
             </div>
           ))}
        </section>

        <div className="h-2 bg-grey-100" />

        <section className="bg-white">
           {[
             { icon: Bell, label: "알림 설정" },
             { icon: Lock, label: "개인정보 처리방침" },
             { icon: FileText, label: "이용약관" },
           ].map((item, i) => (
             <div key={i} className="flex items-center gap-3.5 px-5 py-4 cursor-pointer active:bg-grey-50 border-b last:border-b-0 border-grey-100">
                <div className="w-10 h-10 rounded-xl bg-grey-100 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-grey-600" />
                </div>
                <div className="flex-1 font-semibold text-grey-900">{item.label}</div>
                <ChevronRight className="w-4.5 h-4.5 text-grey-400" />
             </div>
           ))}
        </section>

        <section className="px-5 py-8 bg-white">
          <button
            onClick={logout}
            className="btn-weak-danger w-full h-12 text-[15px] font-semibold"
          >
            로그아웃
          </button>
        </section>
      </main>
    </div>
  );
}
