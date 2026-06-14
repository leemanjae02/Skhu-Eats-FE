"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/lib/toast";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/badge";
import { postService } from "@/services/post.service";
import { Post, Participation } from "@/types/post";

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
  const searchParams = useSearchParams();
  const tab: TabKey = searchParams.get("tab") === "joined" ? "joined" : "created";

  const [createdPosts, setCreatedPosts] = useState<Post[]>([]);
  const [joinedItems, setJoinedItems] = useState<Participation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams.get("tab")) router.replace("/friends?tab=created");
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        if (tab === "created") {
          setCreatedPosts(await postService.getMyPosts("created"));
        } else {
          const res = await postService.getHistory(1, 50);
          setJoinedItems(
            res.data.filter(
              (p) => p.participation_status?.toLowerCase() !== "completed",
            ),
          );
        }
      } catch {
        if (tab === "created") setCreatedPosts([]);
        else setJoinedItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [tab]);

  const handleEdit = (id: string) => router.push(`/create?edit=${id}`);

  const handleDelete = async (id: string) => {
    if (busyId) return;
    if (!window.confirm("이 모집글을 삭제할까요?")) return;
    setBusyId(id);
    try {
      await postService.deletePost(id);
      setCreatedPosts((prev) => prev.filter((p) => p.post_id !== id));
    } catch (err) {
      const reason = err instanceof Error && err.message ? ` ${err.message}` : "";
      toast.error(`삭제에 실패했어요.${reason}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleLeave = async (postId: string, participationId: string) => {
    if (busyId) return;
    if (!window.confirm("참여를 취소할까요?")) return;
    setBusyId(participationId);
    try {
      await postService.leavePost(postId);
      setJoinedItems((prev) => prev.filter((p) => p.participation_id !== participationId));
    } catch (err) {
      const reason = err instanceof Error && err.message ? ` ${err.message}` : "";
      toast.error(`참여 취소에 실패했어요.${reason}`);
    } finally {
      setBusyId(null);
    }
  };

  const isEmpty = tab === "created" ? createdPosts.length === 0 : joinedItems.length === 0;

  return (
    <div className="flex flex-col h-full bg-white">
      <TopBar
        showLogo
        rightAction={
          <button className="text-[14px] font-medium text-grey-600 px-4">필터</button>
        }
      />

      <div className="flex bg-white border-b border-grey-200 shrink-0">
        {(
          [
            { key: "created", label: "내가 만든" },
            { key: "joined", label: "참여 중" },
          ] as { key: TabKey; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => router.replace(`/friends?tab=${t.key}`)}
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
        ) : isEmpty ? (
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
        ) : tab === "created" ? (
          createdPosts.map((post) => {
            const t = fmt(post.meeting_time);
            const isClosed = post.status === "closed";
            return (
              <PostCard
                key={post.post_id}
                postId={post.post_id}
                month={t.month}
                day={t.day}
                time={t.time}
                title={post.title}
                location={post.location}
                currentParticipants={post.current_participants}
                maxParticipants={post.max_participants}
                isClosed={isClosed}
                statusLabel={post.status === "urgent" ? "마감임박" : isClosed ? "마감" : "모집중"}
                statusVariant={post.status === "urgent" ? "urgent" : isClosed ? "closed" : "active"}
                onNavigate={() => router.push(`/post/${post.post_id}`)}
                actions={
                  <>
                    <button
                      onClick={() => handleEdit(post.post_id)}
                      className="h-[30px] px-3.5 rounded-full bg-grey-100 text-[13px] font-bold text-grey-700"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(post.post_id)}
                      disabled={busyId === post.post_id}
                      className="h-[30px] px-3.5 rounded-full bg-red-50 text-[13px] font-bold text-red-500 disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </>
                }
              />
            );
          })
        ) : (
          joinedItems.map((item) => {
            const t = fmt(item.meeting_time);
            const isClosed = item.post_status?.toLowerCase() === "closed";
            return (
              <PostCard
                key={item.participation_id}
                postId={item.post_id}
                month={t.month}
                day={t.day}
                time={t.time}
                title={item.title}
                location={item.location}
                currentParticipants={item.current_participants}
                maxParticipants={item.max_participants}
                isClosed={isClosed}
                statusLabel={item.post_status_label ?? (isClosed ? "마감" : "모집중")}
                statusVariant={isClosed ? "closed" : "active"}
                onNavigate={() => router.push(`/post/${item.post_id}`)}
                actions={
                  item.can_cancel ? (
                    <button
                      onClick={() => handleLeave(item.post_id, item.participation_id)}
                      disabled={busyId === item.participation_id}
                      className="h-[30px] px-3.5 rounded-full bg-red-50 text-[13px] font-bold text-red-500 disabled:opacity-50"
                    >
                      참여 취소
                    </button>
                  ) : null
                }
              />
            );
          })
        )}
      </main>
    </div>
  );
}

function PostCard({
  postId, month, day, time, title, location,
  currentParticipants, maxParticipants, isClosed,
  statusLabel, statusVariant, onNavigate, actions,
}: {
  postId: string; month: string; day: string; time: string;
  title: string; location: string;
  currentParticipants: number; maxParticipants: number;
  isClosed: boolean; statusLabel: string;
  statusVariant: "urgent" | "closed" | "active" | "food";
  onNavigate: () => void;
  actions: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-grey-200 rounded-2xl p-4 flex gap-3.5">
      <button
        onClick={onNavigate}
        className={
          isClosed
            ? "flex flex-col items-center w-10 bg-grey-100 rounded-xl py-1.5 shrink-0"
            : "flex flex-col items-center w-10 bg-primary-100 rounded-xl py-1.5 shrink-0"
        }
      >
        <span className={isClosed ? "text-[10px] font-bold text-grey-500 tracking-wider" : "text-[10px] font-bold text-primary-700 tracking-wider"}>
          {month}
        </span>
        <span className={isClosed ? "text-[22px] font-bold text-grey-500 leading-none" : "text-[22px] font-bold text-primary-700 leading-none"}>
          {day}
        </span>
      </button>

      <div className="flex-1 min-w-0">
        <button onClick={onNavigate} className="block w-full text-left">
          <h3 className="text-[17px] font-bold text-grey-900 truncate mb-1">{title}</h3>
          <p className="text-[13px] font-medium text-grey-600 mb-2.5">{location} · {time}</p>
          <div className="text-[13px] font-medium text-grey-500 mb-2.5">
            {currentParticipants}/{maxParticipants}명 참여
          </div>
        </button>
        <div className="flex gap-2">{actions}</div>
      </div>

      <div className="shrink-0">
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>
    </div>
  );
}
