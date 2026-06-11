"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/badge";
import { postService } from "@/services/post.service";
import { Post } from "@/types/post";

type TabKey = "created" | "joined";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const fmt = (iso: string) => {
  const d = new Date(iso);
  return {
    month: MONTHS[d.getMonth()],
    day: String(d.getDate()),
    time: d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }),
  };
};

export default function FriendsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("created");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async (key: TabKey) => {
    setIsLoading(true);
    try {
      setPosts(await postService.getMyPosts(key));
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load(tab);
  }, [tab]);

  const handleEdit = (id: string) => router.push(`/create?edit=${id}`);

  const handleDelete = async (id: string) => {
    if (busyId) return;
    if (!window.confirm("이 모집글을 삭제할까요?")) return;
    setBusyId(id);
    try {
      await postService.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const reason = err instanceof Error && err.message ? ` ${err.message}` : "";
      toast.error(`삭제에 실패했어요.${reason}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleLeave = async (id: string) => {
    if (busyId) return;
    if (!window.confirm("참여를 취소할까요?")) return;
    setBusyId(id);
    try {
      await postService.leavePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const reason = err instanceof Error && err.message ? ` ${err.message}` : "";
      toast.error(`참여 취소에 실패했어요.${reason}`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <TopBar
        showLogo
        rightAction={
          <button className="text-[14px] font-medium text-grey-600 px-4">필터</button>
        }
      />

      {/* segment tabs */}
      <div className="flex bg-white border-b border-grey-200 shrink-0">
        {(
          [
            { key: "created", label: "내가 만든" },
            { key: "joined", label: "참여 중" },
          ] as { key: TabKey; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              tab === t.key
                ? "flex-1 text-center py-3.5 text-[16px] font-bold text-grey-900 border-b-2 border-primary-600"
                : "flex-1 text-center py-3.5 text-[16px] font-semibold text-grey-500"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto no-scrollbar bg-grey-50 p-5 space-y-2.5">
        {isLoading ? (
          <div className="py-20 text-center text-grey-400 text-sm font-medium">불러오는 중…</div>
        ) : posts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
            <span className="text-3xl">🍽️</span>
            <p className="text-[15px] font-bold text-grey-700">
              {tab === "created" ? "아직 만든 모임이 없어요" : "참여 중인 모임이 없어요"}
            </p>
            {tab === "created" && (
              <button
                onClick={() => router.push("/create")}
                className="text-[14px] font-semibold text-primary-600"
              >
                + 모집하기
              </button>
            )}
          </div>
        ) : (
          posts.map((post) => {
            const t = fmt(post.meeting_time);
            const isClosed = post.status === "closed";
            return (
              <div
                key={post.id}
                className="bg-white border border-grey-200 rounded-2xl p-4 flex gap-3.5"
              >
                <button
                  onClick={() => router.push(`/post/${post.id}`)}
                  className={
                    isClosed
                      ? "flex flex-col items-center w-10 bg-grey-100 rounded-xl py-1.5 shrink-0"
                      : "flex flex-col items-center w-10 bg-primary-100 rounded-xl py-1.5 shrink-0"
                  }
                >
                  <span
                    className={
                      isClosed
                        ? "text-[10px] font-bold text-grey-500 tracking-wider"
                        : "text-[10px] font-bold text-primary-700 tracking-wider"
                    }
                  >
                    {t.month}
                  </span>
                  <span
                    className={
                      isClosed
                        ? "text-[22px] font-bold text-grey-500 leading-none"
                        : "text-[22px] font-bold text-primary-700 leading-none"
                    }
                  >
                    {t.day}
                  </span>
                </button>

                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => router.push(`/post/${post.id}`)}
                    className="block w-full text-left"
                  >
                    <h3 className="text-[17px] font-bold text-grey-900 truncate mb-1">
                      {post.menu}
                    </h3>
                    <p className="text-[13px] font-medium text-grey-600 mb-2.5">
                      {post.location} · {t.time}
                    </p>
                    <div className="text-[13px] font-medium text-grey-500 mb-2.5">
                      {post.current_participants}/{post.max_participants}명 참여
                    </div>
                  </button>

                  <div className="flex gap-2">
                    {tab === "created" ? (
                      <>
                        <button
                          onClick={() => handleEdit(post.id)}
                          className="h-[30px] px-3.5 rounded-full bg-grey-100 text-[13px] font-bold text-grey-700"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={busyId === post.id}
                          className="h-[30px] px-3.5 rounded-full bg-red-50 text-[13px] font-bold text-red-500 disabled:opacity-50"
                        >
                          삭제
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleLeave(post.id)}
                        disabled={busyId === post.id}
                        className="h-[30px] px-3.5 rounded-full bg-red-50 text-[13px] font-bold text-red-500 disabled:opacity-50"
                      >
                        참여 취소
                      </button>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <Badge
                    variant={
                      post.status === "urgent"
                        ? "urgent"
                        : post.status === "closed"
                          ? "closed"
                          : "active"
                    }
                  >
                    {post.status === "urgent" ? "마감임박" : post.status === "closed" ? "마감" : "모집중"}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
