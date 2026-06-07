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

const CATEGORY_THUMBNAILS: Record<string, string> = {
  한식: "🍲",
  면류: "🍜",
  일식: "🍣",
  중식: "🥟",
  양식: "🍕",
  분식: "🌯",
  샐러드: "🥗",
  카페: "☕",
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
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");

    let filtered = [...posts];
    if (category && category !== "전체") {
      filtered = filtered.filter(
        (p) => p.category === category || p.food_categories?.includes(category),
      );
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
    const post = posts.find((p) => p.id === id);
    if (!post) return new HttpResponse(null, { status: 404 });
    if (post.current_participants >= post.max_participants) {
      return HttpResponse.json({ message: "이미 마감된 모임이에요" }, { status: 400 });
    }
    post.current_participants += 1;
    if (post.current_participants >= post.max_participants) {
      post.status = "closed";
    }
    const user = userFromAuthHeader(request.headers.get("Authorization"));
    if (user && id) joinedSet(user.id).add(id);
    return HttpResponse.json({ message: "참여 신청이 완료됐어요" });
  }),

  // Posts: Leave — DELETE /posts/:id/leave
  http.delete(/\/posts\/[^/?]+\/leave(\?.*)?$/, ({ request }) => {
    const id = postIdFromUrl(request.url);
    const post = posts.find((p) => p.id === id);
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

  // Users: 내 모임 목록 — GET /users/me/posts (?type=joined → 참여 중)
  http.get(/\/users\/me\/posts(\?.*)?$/, ({ request }) => {
    const user = userFromAuthHeader(request.headers.get("Authorization"));
    if (!user) return new HttpResponse(null, { status: 401 });
    const type = new URL(request.url).searchParams.get("type");
    if (type === "joined") {
      const set = joinedSet(user.id);
      return HttpResponse.json(posts.filter((p) => set.has(p.id)));
    }
    return HttpResponse.json(posts.filter((p) => p.host_id === user.id));
  }),

  // Posts: Detail — GET /posts/:id
  http.get(/\/posts\/[^/?]+(\?.*)?$/, ({ request }) => {
    const id = postIdFromUrl(request.url);
    const post = posts.find((p) => p.id === id);
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
    const primary = food[0] ?? "한식";
    const host = userFromAuthHeader(request.headers.get("Authorization"));
    const newPost = createPost({
      menu: body.title,
      category: primary,
      food_categories: food,
      thumbnail: CATEGORY_THUMBNAILS[primary] ?? "🍽️",
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
    return HttpResponse.json({ post_id: newPost.id }, { status: 201 });
  }),

  // Posts: Update — PUT /posts/:id
  http.put(/\/posts\/[^/?]+(\?.*)?$/, async ({ request }) => {
    const id = postIdFromUrl(request.url);
    const post = posts.find((p) => p.id === id);
    if (!post) return new HttpResponse(null, { status: 404 });

    const body = (await request.json()) as Partial<CreatePostBody>;
    if (body.title !== undefined) post.menu = body.title;
    if (body.food_categories !== undefined) {
      post.food_categories = body.food_categories;
      post.category = body.food_categories[0] ?? post.category;
      post.thumbnail = CATEGORY_THUMBNAILS[post.category] ?? post.thumbnail;
    }
    if (body.location !== undefined) post.location = body.location;
    if (body.meeting_time !== undefined) post.meeting_time = body.meeting_time;
    if (body.max_participants !== undefined) post.max_participants = body.max_participants;
    if (body.memo !== undefined) post.memo = body.memo;
    if (body.kakao_link !== undefined) post.kakao_link = body.kakao_link;

    return HttpResponse.json(post);
  }),

  // Posts: Delete — DELETE /posts/:id
  http.delete(/\/posts\/[^/?]+(\?.*)?$/, ({ request }) => {
    const id = postIdFromUrl(request.url);
    const idx = posts.findIndex((p) => p.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    posts.splice(idx, 1);
    return HttpResponse.json({ message: "모집글이 삭제됐어요" });
  }),
];
