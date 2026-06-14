"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { postService } from "@/services/post.service";
import { Post } from "@/types/post";

const FILTERS = ["전체", "한식", "일식", "중식", "양식", "분식", "면류", "찌개"];

const FOOD_CATEGORY_ENUM: Record<string, string> = {
  한식: "KOREAN",
  일식: "JAPANESE",
  중식: "CHINESE",
  양식: "WESTERN",
  분식: "BUNSIK",
  면류: "NOODLE",
  찌개: "STEW",
};

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeFilter, setActiveFilter] = useState("전체");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const food_category = FOOD_CATEGORY_ENUM[activeFilter];
        const data = await postService.getPosts(food_category ? { food_category } : undefined);
        setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [activeFilter]);

  const filteredPosts = posts;

  const toDisplayStatus = (p: { status: string; current_participants: number; max_participants: number }): "active" | "urgent" | "closed" => {
    if (p.status === "CLOSED") return "closed";
    if (p.current_participants >= p.max_participants - 1) return "urgent";
    return "active";
  };

  const stats = useMemo(() => {
    const open = posts.filter((p) => p.status === "OPEN");
    return {
      active: open.length,
      urgent: open.filter((p) => p.current_participants >= p.max_participants - 1).length,
    };
  }, [posts]);

  const rightAction = (
    <Link href="/notifications" className="relative p-2">
      <Bell className="w-[22px] h-[22px] text-grey-700" />
      <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-[1.5px] border-white" />
    </Link>
  );

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <TopBar showLogo rightAction={rightAction} />

      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col">
        <section className="px-5 py-6 bg-white shrink-0">
          <h1 className="text-2xl font-bold text-grey-900 leading-8 tracking-tight">
            {user?.nickname}님,
            <br />
            오늘 점심 <span className="hl">같이 먹을래요?</span>
          </h1>
          <div className="flex items-center gap-1 mt-2.5 text-[13px] font-medium text-grey-600">
            <span>
              모집 중{" "}
              <strong className="font-bold text-grey-900">
                {stats.active + stats.urgent}
              </strong>
            </span>
            <div className="w-0.5 h-0.5 rounded-full bg-grey-400 mx-1" />
            <span>
              마감 임박{" "}
              <strong className="font-bold text-grey-900">
                {stats.urgent}
              </strong>
            </span>
          </div>
        </section>

        <div className="h-2 bg-grey-100 shrink-0" />

        <section className="px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar bg-white sticky top-0 z-10 border-b border-grey-50 shrink-0">
          {FILTERS.map((filter) => (
            <Chip
              key={filter}
              active={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </Chip>
          ))}
        </section>

        <section className="flex-1 bg-grey-50 px-5 py-4 space-y-2.5">
          {isLoading ? (
            <div className="py-20 text-center text-grey-400 text-sm font-medium">
              밥친구를 찾고 있어요...
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post.post_id} onClick={() => router.push(`/post/${post.post_id}`)}>
                <Card
                  thumbnail=""
                  category={post.food_categories[0] ?? ""}
                  status={toDisplayStatus(post)}
                  time={formatTime(post.meeting_time)}
                  title={post.title}
                  location={post.location}
                  currentParticipants={post.current_participants}
                  maxParticipants={post.max_participants}
                  avatars={[]}
                />
              </div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 bg-grey-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
              <div>
                <div className="text-[17px] font-bold text-grey-700 mb-1">
                  {activeFilter === "전체"
                    ? "모집글이 아직 없어요"
                    : `${activeFilter} 모집글이 없어요`}
                </div>
                <p className="text-[14px] text-grey-500 leading-relaxed">
                  아직 모집 중인 밥친구가 없어요.
                  <br />
                  직접 모집해보는 건 어떨까요?
                </p>
              </div>
              <button
                onClick={() => router.push("/create")}
                className="btn-primary w-auto px-7 h-12 text-[15px] leading-[48px] mt-2"
              >
                + 모집하기
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
