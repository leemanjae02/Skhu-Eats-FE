import { faker } from "@faker-js/faker";

const DEPARTMENTS = [
  "소프트웨어공학과", "컴퓨터공학과", "정보통신공학과",
  "경영학과", "경제학과", "사회복지학과",
  "영어학과", "기계공학과", "전자공학과", "간호학과",
];

const FOOD_CATEGORIES = ["면류", "한식", "일식", "양식", "중식", "분식"];

const AVATARS = ["🍚", "🍜", "🍣", "🍕", "🥟", "🌯", "🍱", "🥘", "🍲", "🥗"];

const NICKNAME_POOL = [
  "밥순이", "밥돌이", "점심왕", "먹보킹", "맛집헌터",
  "배고픈곰", "점심이", "저녁이", "국밥러버", "면순이",
  "한식킹", "맛있어", "먹자고", "배부름", "냠냠이",
];

const BIOS = [
  "빠르게 먹고 싶을 때 같이 먹어요!",
  "대화하면서 먹는 거 좋아요 😊",
  "조용히 식사해요",
  "뭐든 잘 먹어요!",
  "맛집 탐방 좋아해요",
  "혼밥 탈출 원해요",
  "밥 먹으면서 친해져요",
];

export interface MemberData {
  id: string;
  email: string;
  password: string;
  nickname: string;
  department: string;
  admissionYear: string;
  avatar: string | null;
  bio: string;
  category: string[];
}

let _id = 100;

export function createMember(overrides?: Partial<MemberData>): MemberData {
  const year = faker.number.int({ min: 2018, max: 2026 });
  const studentNum = `${year}${faker.number.int({ min: 1000, max: 9999 })}`;

  return {
    id: String(++_id),
    email: `${studentNum}@skhu.ac.kr`,
    password: "test1234!",
    nickname: faker.helpers.arrayElement(NICKNAME_POOL),
    department: faker.helpers.arrayElement(DEPARTMENTS),
    admissionYear: String(year),
    avatar: faker.helpers.arrayElement(AVATARS),
    bio: faker.helpers.arrayElement(BIOS),
    category: faker.helpers.arrayElements(FOOD_CATEGORIES, { min: 1, max: 3 }),
    ...overrides,
  };
}

export function createMembers(count: number, overrides?: Partial<MemberData>): MemberData[] {
  return Array.from({ length: count }, () => createMember(overrides));
}
