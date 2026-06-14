import { http, HttpResponse } from "msw";
import { userFromAuthHeader } from "../store";
import { NotificationType } from "@/types/notification";

interface MockNotification {
  id: string;
  user_id: string;
  post_id: string | null;
  type: NotificationType;
  message: string;
  sub_message: string | null;
  is_read: boolean;
  created_at: string;
}

const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 3_600_000).toISOString();
const daysAgo = (d: number) =>
  new Date(Date.now() - d * 86_400_000).toISOString();

// post.factory의 _id는 100에서 시작해 ++_id → createPosts(10) = 101~110
const notifications: MockNotification[] = [
  {
    id: "n1",
    user_id: "1",
    post_id: "101",
    type: "new_join",
    message: "김철수님이 참여했어요",
    sub_message: "부대찌개 + 공기밥 · 학생회관 1층",
    is_read: false,
    created_at: hoursAgo(0.1),
  },
  {
    id: "n2",
    user_id: "1",
    post_id: "101",
    type: "reminder",
    message: "식사 시간 1시간 전이에요",
    sub_message: "12:15 부대찌개 + 공기밥 — 잊지 마세요!",
    is_read: false,
    created_at: hoursAgo(0.7),
  },
  {
    id: "n3",
    user_id: "1",
    post_id: "101",
    type: "new_join",
    message: "이영희님이 참여했어요",
    sub_message: "부대찌개 + 공기밥 · 학생회관 1층",
    is_read: true,
    created_at: hoursAgo(2),
  },
  {
    id: "n4",
    user_id: "1",
    post_id: "102",
    type: "left",
    message: "박민준님이 참여를 취소했어요",
    sub_message: "스시로 런치세트 · 정문 스시로",
    is_read: true,
    created_at: daysAgo(1),
  },
  {
    id: "n5",
    user_id: "1",
    post_id: "103",
    type: "full",
    message: "식사가 완료됐어요 🎉",
    sub_message: "김치찌개 + 공기밥 모임이 종료됐습니다",
    is_read: true,
    created_at: daysAgo(1),
  },
  {
    id: "n6",
    user_id: "1",
    post_id: null,
    type: "cancelled",
    message: "모집글이 취소됐어요",
    sub_message: "스시로 런치세트 모임이 취소됐습니다",
    is_read: true,
    created_at: daysAgo(1),
  },
];

const notifIdFromUrl = (url: string): string | undefined => {
  const m = new URL(url).pathname.match(/\/notifications\/([^/?]+)\/read/);
  return m?.[1];
};

export const notificationHandlers = [
  // GET /notifications(?is_read=)
  http.get(/\/notifications(\?.*)?$/, ({ request }) => {
    const user = userFromAuthHeader(request.headers.get("Authorization"));
    if (!user) return new HttpResponse(null, { status: 401 });

    const isReadParam = new URL(request.url).searchParams.get("is_read");
    let result = notifications.filter((n) => n.user_id === user.id);
    if (isReadParam === "true") result = result.filter((n) => n.is_read);
    if (isReadParam === "false") result = result.filter((n) => !n.is_read);

    return HttpResponse.json(result);
  }),

  // PATCH /notifications/read-all — 전체 읽음 (순서 중요: :id/read 보다 먼저)
  http.patch(/\/notifications\/read-all(\?.*)?$/, ({ request }) => {
    const user = userFromAuthHeader(request.headers.get("Authorization"));
    if (!user) return new HttpResponse(null, { status: 401 });

    notifications
      .filter((n) => n.user_id === user.id)
      .forEach((n) => { n.is_read = true; });

    return HttpResponse.json({ message: "전체 읽음 처리 완료" });
  }),

  // PATCH /notifications/:id/read — 단건 읽음
  http.patch(/\/notifications\/[^/?]+\/read(\?.*)?$/, ({ request }) => {
    const user = userFromAuthHeader(request.headers.get("Authorization"));
    if (!user) return new HttpResponse(null, { status: 401 });

    const id = notifIdFromUrl(request.url);
    const notif = notifications.find(
      (n) => n.id === id && n.user_id === user.id,
    );
    if (!notif) return new HttpResponse(null, { status: 404 });

    notif.is_read = true;
    return HttpResponse.json({ message: "읽음 처리 완료" });
  }),
];
