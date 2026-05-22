import { faker } from "@faker-js/faker";

const FOOD_GROUPS = [
  { category: "한식", thumbnail: "🍲", menus: ["부대찌개 + 공기밥", "김치찌개", "된장찌개", "비빔밥", "순두부찌개"] },
  { category: "면류", thumbnail: "🍜", menus: ["짜장면", "짬뽕", "칼국수", "냉면", "라볶이"] },
  { category: "일식", thumbnail: "🍣", menus: ["스시로 런치세트", "돈카츠 정식", "우동", "규동", "텐동"] },
  { category: "양식", thumbnail: "🍕", menus: ["파스타", "피자", "버거 세트", "리조또", "샌드위치"] },
  { category: "분식", thumbnail: "🌯", menus: ["떡볶이 세트", "김밥", "순대국", "튀김 정식", "라면"] },
  { category: "중식", thumbnail: "🥟", menus: ["마라탕", "짜장면", "탕수육", "마파두부", "볶음밥"] },
];

const LOCATIONS = [
  "학생회관 1층", "학생회관 2층", "정문 앞 골목",
  "스타벅스 맞은편", "도서관 앞", "체육관 앞", "편의점 앞",
];

const MEMOS = [
  "조용히 먹어요", "대화 환영!", "빠른 식사 선호해요",
  "같이 걸어가요", "주문 미리 정해가요", "자리 맡아둘게요",
];

export interface PostData {
  id: string;
  host_id: string;
  thumbnail: string;
  category: string;
  title: string;
  location: string;
  meeting_time: string;
  max_participants: number;
  current_participants: number;
  status: "active" | "urgent" | "closed";
  deadline: string;
  memo?: string;
  kakao_link?: string;
}

let _id = 100;

export function createPost(overrides?: Partial<PostData>): PostData {
  const group = faker.helpers.arrayElement(FOOD_GROUPS);
  const maxParticipants = faker.number.int({ min: 2, max: 6 });
  const currentParticipants = faker.number.int({ min: 1, max: maxParticipants });
  const meetingTime = faker.date.soon({ days: 1 });
  const deadline = new Date(meetingTime.getTime() - 30 * 60 * 1000);

  const isClosed = currentParticipants >= maxParticipants;
  const isUrgent = !isClosed && deadline.getTime() - Date.now() < 30 * 60 * 1000;
  const status: PostData["status"] = isClosed ? "closed" : isUrgent ? "urgent" : "active";

  return {
    id: String(++_id),
    host_id: String(faker.number.int({ min: 1, max: 10 })),
    thumbnail: group.thumbnail,
    category: group.category,
    title: faker.helpers.arrayElement(group.menus),
    location: faker.helpers.arrayElement(LOCATIONS),
    meeting_time: meetingTime.toISOString(),
    max_participants: maxParticipants,
    current_participants: currentParticipants,
    status,
    deadline: deadline.toISOString(),
    memo: faker.datatype.boolean(0.5)
      ? faker.helpers.arrayElement(MEMOS)
      : undefined,
    kakao_link: faker.datatype.boolean(0.3)
      ? `https://open.kakao.com/o/mock${_id}`
      : undefined,
    ...overrides,
  };
}

export function createPosts(count: number, overrides?: Partial<PostData>): PostData[] {
  return Array.from({ length: count }, () => createPost(overrides));
}
