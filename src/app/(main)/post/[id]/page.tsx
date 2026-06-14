"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import {
  ArrowLeft,
  Share2,
  Clock,
  MapPin,
  MessageCircle,
  User as UserIcon,
  ExternalLink,
  Heart,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { postService } from "@/services/post.service";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Post } from "@/types/post";

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  const time = d.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} ${time}`;
};

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuthStore();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [joined, setJoined] = useState(false);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      try {
        const data = await postService.getPost(id);
        if (alive) {
          setPost(data);
          if (data.join_status !== undefined) setJoined(data.join_status);
        }
      } catch {
        if (alive) setNotFound(true);
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const isHost = !!post && !!user && post.host_id === (user.user_id ?? user.id);
  const isFull =
    !!post && post.current_participants >= post.max_participants && !joined;

  const handleToggleJoin = async () => {
    if (!post || acting || isHost) return;
    setActing(true);
    try {
      if (joined) {
        await postService.leavePost(post.post_id);
        setJoined(false);
        setPost({ ...post, current_participants: Math.max(0, post.current_participants - 1) });
      } else {
        await postService.joinPost(post.post_id);
        // 참여 후 kakao_link 등 참여자 전용 필드 포함한 최신 데이터 재조회
        const updated = await postService.getPost(post.post_id);
        setPost(updated);
        setJoined(updated.join_status ?? true);
      }
    } catch (err) {
      const action = joined ? "참여 취소" : "참여 신청";
      const reason = err instanceof Error && err.message ? ` ${err.message}` : "";
      toast.error(`${action}에 실패했어요.${reason}`);
    } finally {
      setActing(false);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: post?.title ?? "밥친구 모집", url: window.location.href }).catch(() => {});
    }
  };

  const tags = post?.food_categories?.length ? post.food_categories : [];

  return (
    <div className="flex flex-col h-full bg-white">
      <TopBar
        leftAction={
          <button
            onClick={() => router.back()}
            className="w-11 h-11 flex items-center justify-center text-grey-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
        rightAction={
          <button
            onClick={handleShare}
            className="w-11 h-11 flex items-center justify-center text-grey-700"
          >
            <Share2 className="w-5 h-5" />
          </button>
        }
      />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-grey-400 text-sm font-medium">
          불러오는 중…
        </div>
      ) : notFound || !post ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
          <span className="text-3xl">🍽️</span>
          <p className="text-[15px] font-bold text-grey-700">모집글을 찾을 수 없어요</p>
          <button onClick={() => router.replace("/")} className="text-[14px] font-semibold text-primary-600">
            홈으로 가기
          </button>
        </div>
      ) : (
        <>
          <main className="flex-1 overflow-y-auto no-scrollbar">
            {/* hero */}
            <section className="px-5 pt-4 pb-5 bg-white">
              <div className="flex gap-1.5 flex-wrap mb-2.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center h-[22px] px-2 rounded-full text-[12px] font-semibold bg-primary-100 text-primary-700"
                  >
                    #{t}
                  </span>
                ))}
                {post.status === "OPEN" && post.current_participants >= post.max_participants - 1 && (
                  <span className="inline-flex items-center h-[22px] px-2 rounded-full text-[12px] font-semibold bg-red-50 text-red-500">
                    마감임박
                  </span>
                )}
                {post.status === "CLOSED" && (
                  <span className="inline-flex items-center h-[22px] px-2 rounded-full text-[12px] font-semibold bg-grey-100 text-grey-500">
                    마감
                  </span>
                )}
              </div>
              <h2 className="text-[24px] font-bold text-grey-900 leading-8 tracking-[-0.5px] mb-4">
                {post.title}
              </h2>
              {/* seat indicator */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: post.max_participants }).map((_, i) => (
                  <div
                    key={i}
                    className={
                      i < post.current_participants
                        ? "w-9 h-9 rounded-full bg-primary-300 flex items-center justify-center"
                        : "w-9 h-9 rounded-full bg-grey-100 flex items-center justify-center"
                    }
                  >
                    <UserIcon
                      className={
                        i < post.current_participants
                          ? "w-4 h-4 text-grey-900"
                          : "w-4 h-4 text-grey-400"
                      }
                    />
                  </div>
                ))}
                <span className="text-[14px] font-semibold text-grey-600 ml-2">
                  <strong className="text-[18px] text-primary-600">
                    {post.current_participants}
                  </strong>
                  /{post.max_participants}명
                </span>
              </div>
            </section>

            <div className="h-2 bg-grey-100" />

            {/* info rows */}
            <InfoRow
              iconBg="bg-orange-50"
              icon={<Clock className="w-5 h-5 text-orange-500" />}
              title="식사 시간"
              sub={formatDateTime(post.meeting_time)}
            />
            <InfoRow
              iconBg="bg-blue-50"
              icon={<MapPin className="w-5 h-5 text-blue-500" />}
              title="만날 장소"
              sub={post.location}
            />
            {post.memo && (
              <InfoRow
                iconBg="bg-green-50"
                icon={<MessageCircle className="w-5 h-5 text-green-500" />}
                title="메모"
                sub={post.memo}
              />
            )}

            <div className="h-2 bg-grey-100" />

            {/* host */}
            <div className="flex items-center gap-3.5 px-5 py-4">
              <div className="w-10 h-10 rounded-full bg-primary-200 text-primary-700 text-base font-bold flex items-center justify-center shrink-0">
                {post.host_nickname?.[0] ?? "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold text-grey-900">{post.host_nickname}</div>
                <div className="text-[13px] text-grey-500">모집장</div>
              </div>
              <span className="inline-flex items-center gap-1 h-[22px] px-2 rounded-full text-[12px] font-semibold bg-primary-100 text-primary-700">
                <Heart className="w-3 h-3" /> 작성자
              </span>
            </div>

            {/* kakao */}
            {post.kakao_link && joined && (
              <>
                <div className="h-2 bg-grey-100" />
                <div className="px-5 py-4">
                  <a
                    href={post.kakao_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full h-[52px] px-4 bg-kakao rounded-2xl text-[15px] font-semibold text-grey-900"
                  >
                    <span>카카오 오픈채팅 참여하기</span>
                    <ExternalLink className="w-[18px] h-[18px]" />
                  </a>
                </div>
              </>
            )}
            <div className="h-2" />
          </main>

          {/* bottom CTA */}
          <div className="p-5 pb-8 bg-white border-t border-grey-100">
            {isHost ? (
              <button className="btn-primary disabled:bg-grey-200 disabled:text-grey-500 disabled:shadow-none" disabled>
                내가 만든 모임이에요
              </button>
            ) : isFull ? (
              <button className="btn-primary disabled:bg-grey-200 disabled:text-grey-500 disabled:shadow-none" disabled>
                모집이 마감됐어요
              </button>
            ) : joined ? (
              <button
                onClick={handleToggleJoin}
                disabled={acting}
                className="btn-weak-danger"
              >
                참여 취소하기
              </button>
            ) : (
              <button onClick={handleToggleJoin} disabled={acting} className="btn-primary">
                {acting ? "처리 중…" : "참여하기"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function InfoRow({
  iconBg,
  icon,
  title,
  sub,
}: {
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3.5 px-5 py-3.5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-grey-500">{title}</div>
        <div className="text-[15px] font-semibold text-grey-900">{sub}</div>
      </div>
    </div>
  );
}
