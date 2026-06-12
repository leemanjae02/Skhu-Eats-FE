import { http, HttpResponse } from "msw";
import { createPosts, createPost, PostData } from "../factories/post.factory";
import { userFromAuthHeader } from "../store";

const posts: PostData[] = createPosts(10);
// 데모: 초기 글 일부를 첫 번째 회원(밥순이)이 만든 글로 지정
posts.slice(0, 2).forEach((p) => {
  p.host_id = "1";
  p.host_nickname = "밥순이";
});

// 유저별 참여(joined) 모집글 추적 (userId → Set<postId>)
const joinedByUser = new Map<string, Set<string>>();
const joinedSet = (userId: string) => {
  let set = joinedByUser.get(userId);
  if (!set) {
    set = new Set();
    joinedByUser.set(userId, set);
  }
  return set;
};

// 참여 이력 (userId → 참여 기록 목록)
interface HistoryRecord {
  participation_id: string;
  post_id: string;
  title: string;
  location: string;
  meeting_time: string;
  status: "completed" | "upcoming";
}
const historyByUser = new Map<string, HistoryRecord[]>();
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
// 데모: 첫 번째 회원(밥순이)의 지난 참여 이력 시드
historyByUser.set("1", [
  { participation_id: "h1", post_id: "201", title: "김치찌개 + 공기밥", location: "학생회관 1층", meeting_time: daysAgo(3), status: "completed" },
  { participation_id: "h2", post_id: "202", title: "떡볶이 세트", location: "정문 분식집", meeting_time: daysAgo(8), status: "completed" },
  { participation_id: "h3", post_id: "203", title: "스시로 런치세트", location: "정문 스시로", meeting_time: daysAgo(14), status: "completed" },
]);
const pushHistory = (userId: string, post: PostData) => {
  const list = historyByUser.get(userId) ?? [];
  if (list.some((h) => h.post_id === post.post_id)) return;
  list.unshift({
    participation_id: `h-${post.post_id}`,
    post_id: post.post_id,
    title: post.title,
    location: post.location,
    meeting_time: post.meeting_time,
    status: new Date(post.meeting_time).getTime() < Date.now() ? "completed" : "upcoming",
  });
  historyByUser.set(userId, list);
};

// POST /posts 요청 본문 (API 명세 기준)
interface CreatePostBody {
  title: string;
  food_categories: string[];
  location: string;
  meeting_time: string;
  max_participants: number;
  memo?: string;
  kakao_link?: string;
}

// "/posts/{id}" 또는 "/posts/{id}/join" 에서 id 추출
const postIdFromUrl = (url: string): string | undefined => {
  const m = new URL(url).pathname.match(/\/posts\/([^/?]+)/);
  return m?.[1];
};

// 명세: 하루 최대 3개 모집글 작성 (POST_429_DAILY_LIMIT)
let dailyCreatedCount = 0;
const DAILY_LIMIT = 3;

export const postHandlers = [
  // Posts: List — GET /posts (호스트 직후 /posts 만 매칭, /users/me/posts 제외)
  http.get(/\/\/[^/]+\/posts(\?.*)?$/, ({ request }) => {
    const url = new URL(request.url);
    const timeSlot = url.searchParams.get("time_slot");
    const status = url.searchParams.get("status");

    let filtered = [...posts];
    if (timeSlot) {
      // time_slot 필터: 추후 서버 스펙 확정 시 구현. 현재는 무시.
    }
    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    // urgent 우선 → meeting_time 순
    filtered.sort((a, b) => {
      if (a.status === "urgent" && b.status !== "urgent") return -1;
      if (a.status !== "urgent" && b.status === "urgent") return 1;
      return new Date(a.meeting_time).getTime() - new Date(b.meeting_time).getTime();
    });

    return HttpResponse.json(filtered);
  }),

  // Posts: Join — POST /posts/:id/join
  http.post(/\/posts\/[^/?]+\/join(\?.*)?$/, ({ request }) => {
    const id = postIdFromUrl(request.url);
    const post = posts.find((p) => p.post_id === id);
    if (!post) return new HttpResponse(null, { status: 404 });
    if (post.current_participants >= post.max_participants) {
      return HttpResponse.json({ message: "이미 마감된 모임이에요" }, { status: 400 });
    }
    post.current_participants += 1;
    if (post.current_participants >= post.max_participants) {
      post.status = "closed";
    }
    const user = userFromAuthHeader(request.headers.get("Authorization"));
    if (user && id) {
      joinedSet(user.id).add(id);
      pushHistory(user.id, post);
    }
    return HttpResponse.json({ message: "참여 신청이 완료됐어요" });
  }),

  // Posts: Leave — DELETE /posts/:id/leave
  http.delete(/\/posts\/[^/?]+\/leave(\?.*)?$/, ({ request }) => {
    const id = postIdFromUrl(request.url);
    const post = posts.find((p) => p.post_id === id);
    if (!post) return new HttpResponse(null, { status: 404 });
    if (post.current_participants > 0) {
      post.current_participants -= 1;
      if (post.current_participants < post.max_participants && post.status === "closed") {
        post.status = "active";
      }
    }
    const user = userFromAuthHeader(request.headers.get("Authorization"));
    if (user && id) joinedSet(user.id).delete(id);
    return HttpResponse.json({ message: "참여 취소가 완료됐어요" });
  }),

  // Posts: My created posts — GET /posts/myposts
  http.get(/\/posts\/myposts(\?.*)?$/, ({ request }) => {
    const user = userFromAuthHeader(request.headers.get("Authorization"));
    if (!user) return new HttpResponse(null, { status: 401 });
    return HttpResponse.json(posts.filter((p) => p.host_id === user.id));
  }),

  // Users: 내 참여 중인 모임 목록 — GET /users/me/posts
  http.get(/\/users\/me\/posts(\?.*)?$/, ({ request }) => {
    const user = userFromAuthHeader(request.headers.get("Authorization"));
    if (!user) return new HttpResponse(null, { status: 401 });
    const set = joinedSet(user.id);
    return HttpResponse.json(posts.filter((p) => set.has(p.post_id)));
  }),

  // Users: 내 참여 이력 — GET /users/me/history (?page=&limit=)
  http.get(/\/users\/me\/history(\?.*)?$/, ({ request }) => {
    const user = userFromAuthHeader(request.headers.get("Authorization"));
    if (!user) return new HttpResponse(null, { status: 401 });
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10) || 20);
    const all = historyByUser.get(user.id) ?? [];
    const start = (page - 1) * limit;
    return HttpResponse.json({
      items: all.slice(start, start + limit),
      page,
      limit,
      total: all.length,
    });
  }),

  // Posts: Detail — GET /posts/:id
  http.get(/\/posts\/[^/?]+(\?.*)?$/, ({ request }) => {
    const id = postIdFromUrl(request.url);
    const post = posts.find((p) => p.post_id === id);
    if (!post) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(post);
  }),

  // Posts: Create — POST /posts
  http.post(/\/\/[^/]+\/posts(\?.*)?$/, async ({ request }) => {
    const body = (await request.json()) as CreatePostBody;

    if (dailyCreatedCount >= DAILY_LIMIT) {
      return HttpResponse.json(
        {
          code: "POST_429_DAILY_LIMIT",
          message: "하루 최대 모집글 작성 개수 3개를 초과했어요",
        },
        { status: 429 },
      );
    }

    const food = body.food_categories ?? [];
    const host = userFromAuthHeader(request.headers.get("Authorization"));
    const newPost = createPost({
      title: body.title,
      food_categories: food,
      location: body.location,
      meeting_time: body.meeting_time,
      max_participants: body.max_participants,
      memo: body.memo,
      kakao_link: body.kakao_link,
      current_participants: 1, // 작성자
      status: "active",
      ...(host ? { host_id: host.id, host_nickname: host.nickname } : {}),
    });
    posts.unshift(newPost);
    dailyCreatedCount += 1;

    // 명세 성공 응답: { post_id }
    return HttpResponse.json({ post_id: newPost.post_id }, { status: 201 });
  }),

  // Posts: Update — PATCH /posts/:id
  http.patch(/\/posts\/[^/?]+(\?.*)?$/, async ({ request }) => {
    const id = postIdFromUrl(request.url);
    const post = posts.find((p) => p.post_id === id);
    if (!post) return new HttpResponse(null, { status: 404 });

    const body = (await request.json()) as Partial<CreatePostBody>;
    if (body.title !== undefined) post.title = body.title;
    if (body.food_categories !== undefined) {
      post.food_categories = body.food_categories;
    }
    if (body.location !== undefined) post.location = body.location;
    if (body.meeting_time !== undefined) post.meeting_time = body.meeting_time;
    if (body.max_participants !== undefined) post.max_participants = body.max_participants;
    if (body.memo !== undefined) post.memo = body.memo;
    if (body.kakao_link !== undefined) post.kakao_link = body.kakao_link;
    post.updated_at = new Date().toISOString();

    return HttpResponse.json(post);
  }),

  // Posts: Delete — DELETE /posts/:id
  http.delete(/\/posts\/[^/?]+(\?.*)?$/, ({ request }) => {
    const id = postIdFromUrl(request.url);
    const idx = posts.findIndex((p) => p.post_id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    posts.splice(idx, 1);
    return HttpResponse.json({ message: "모집글이 삭제됐어요" });
  }),
];
