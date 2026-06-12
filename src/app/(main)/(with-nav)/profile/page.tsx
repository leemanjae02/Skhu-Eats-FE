"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Utensils, Crown, Bell, Lock, FileText, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { postService } from "@/services/post.service";
import { Participation } from "@/types/post";

const formatMonthDay = (iso: string) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

// avatar 값이 실제 이미지 URL일 때만 src 로 사용 (목업 데이터는 이모지라 그대로 두면 404)
const avatarSrc = (avatar?: string | null) =>
  avatar && /^(https?:\/\/|\/)/.test(avatar) ? avatar : undefined;

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, withdraw } = useAuthStore();

  const [history, setHistory] = useState<Participation[]>([]);
  const [totalJoined, setTotalJoined] = useState(0);
  const [createdCount, setCreatedCount] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [his, mine] = await Promise.all([
          postService.getHistory(),
          postService.getMyPosts("created"),
        ]);
        if (!alive) return;
        setHistory(his.data);
        setTotalJoined(his.total_count);
        setCreatedCount(mine.length);
      } catch {
        // 비로그인/실패 시 빈 상태 유지
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleWithdraw = async () => {
    if (!window.confirm("정말 탈퇴할까요?\n모든 정보가 삭제되며 되돌릴 수 없어요.")) return;
    await withdraw();
    router.replace("/login");
  };

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
              <AvatarImage src={avatarSrc(user?.avatar)} />
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

          {user?.food_categories && user.food_categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {user.food_categories.map((cat) => (
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

          <button
            onClick={() => router.push("/profile/edit")}
            className="btn-weak-primary w-full h-11 text-[15px] font-semibold"
          >
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
              {totalJoined}회 <ChevronRight className="w-4.5 h-4.5 text-grey-400" />
            </div>
          </div>
          <div className="flex items-center gap-3.5 px-5 py-4 cursor-pointer active:bg-grey-50">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Crown className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 font-semibold text-grey-900">내가 만든 모임</div>
            <div className="flex items-center gap-1.5 text-grey-900 font-bold">
              {createdCount}회 <ChevronRight className="w-4.5 h-4.5 text-grey-400" />
            </div>
          </div>
        </section>

        <div className="h-2 bg-grey-100" />

        <section className="bg-white">
           <div className="px-5 py-4 font-bold text-grey-900">참여 이력</div>
           {history.length === 0 ? (
             <div className="px-5 py-8 text-center text-[14px] text-grey-400">
               아직 참여한 모임이 없어요
             </div>
           ) : (
             history.map((item) => (
               <div key={item.participation_id} className="flex items-center justify-between px-5 py-3.5 border-t border-grey-100">
                  <span className="text-[13px] font-medium text-grey-500 w-12">
                    {formatMonthDay(item.meeting_time)}
                  </span>
                  <div className="flex-1 px-2">
                    <div className="text-[15px] font-semibold text-grey-800">{item.title}</div>
                    <div className="text-[13px] text-grey-500">{item.location}</div>
                  </div>
                  <Badge variant={item.status === "completed" ? "closed" : "active"}>
                    {item.status === "completed" ? "완료" : "예정"}
                  </Badge>
               </div>
             ))
           )}
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

        <section className="px-5 py-8 bg-white flex flex-col items-center gap-4">
          <button
            onClick={logout}
            className="btn-weak-danger w-full h-12 text-[15px] font-semibold"
          >
            로그아웃
          </button>
          <button
            onClick={handleWithdraw}
            className="text-[13px] font-medium text-grey-400 underline underline-offset-2"
          >
            회원 탈퇴
          </button>
        </section>
      </main>
    </div>
  );
}
