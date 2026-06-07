"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, AlertTriangle } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { postService } from "@/services/post.service";

const CATEGORIES = [
  { label: "🍚 한식", value: "한식" },
  { label: "🍣 일식", value: "일식" },
  { label: "🥢 중식", value: "중식" },
  { label: "🍕 양식", value: "양식" },
  { label: "🌯 분식", value: "분식" },
  { label: "🍜 면류", value: "면류" },
  { label: "🥗 샐러드", value: "샐러드" },
  { label: "☕ 카페", value: "카페" },
];

const LOCATION_PRESETS = ["학생회관 1층 식당", "정문 앞 먹자골목", "후문 카페거리"];

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // step 1
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  // step 2
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [memo, setMemo] = useState("");
  const [kakaoLink, setKakaoLink] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (value: string) => {
    setCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value],
    );
  };

  const step1Valid = title.trim().length > 0 && categories.length > 0;
  const resolvedLocation = location === "직접 입력" ? customLocation.trim() : location;
  const step2Valid = useMemo(
    () => Boolean(date && time && resolvedLocation),
    [date, time, resolvedLocation],
  );

  const handleSubmit = async () => {
    if (!step2Valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const meetingTime = new Date(`${date}T${time}:00`).toISOString();
      const { post_id } = await postService.createPost({
        title: title.trim(),
        food_categories: categories,
        location: resolvedLocation,
        meeting_time: meetingTime,
        max_participants: maxParticipants,
        memo: memo.trim() || undefined,
        kakao_link: kakaoLink.trim() || undefined,
      });
      router.replace(`/post/${post_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "모집글 작성에 실패했어요");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <TopBar
        title="모집하기"
        leftAction={
          <button
            onClick={() => (step === 2 ? setStep(1) : router.back())}
            className="w-11 h-11 flex items-center justify-center text-grey-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
        rightAction={
          <span className="text-[14px] font-medium text-grey-500 px-3">{step}/2</span>
        }
      />

      {/* step progress */}
      <div className="px-5 pt-2.5 bg-white">
        <div className="flex gap-1.5 h-1">
          <div className="flex-1 bg-primary rounded-full" />
          <div className={step >= 2 ? "flex-1 bg-primary rounded-full" : "flex-1 bg-grey-200 rounded-full"} />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto no-scrollbar">
        {step === 1 ? (
          <div className="p-5">
            <section className="mb-7">
              <h2 className="text-[22px] font-bold text-grey-900 leading-tight mb-1">
                어떤 메뉴를 먹을까요?
              </h2>
              <p className="text-[14px] text-grey-500 mb-5">메뉴 이름을 직접 입력해주세요</p>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-grey-100 rounded-2xl p-4 text-[20px] font-bold text-grey-900 outline-none focus:bg-grey-200 transition-colors placeholder:text-grey-300 placeholder:font-normal resize-none"
                rows={2}
                placeholder="예) 부대찌개 + 공기밥"
              />
            </section>

            <section>
              <h3 className="text-[11px] font-bold text-grey-500 uppercase tracking-[1.2px] mb-3">
                카테고리
              </h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => toggleCategory(cat.value)}
                    className={
                      categories.includes(cat.value)
                        ? "h-[38px] px-4 rounded-full text-[14px] font-semibold bg-primary-100 text-primary-700 border-[1.5px] border-primary-300"
                        : "h-[38px] px-4 rounded-full text-[14px] font-medium bg-grey-100 text-grey-700 border-[1.5px] border-transparent"
                    }
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="p-5 space-y-6">
            <section>
              <h2 className="text-[22px] font-bold text-grey-900 leading-tight mb-1">
                언제, 어디서 만날까요?
              </h2>
              <p className="text-[14px] text-grey-500">날짜와 장소를 설정해주세요</p>
            </section>

            <section>
              <label className="text-[11px] font-bold text-grey-500 uppercase tracking-[1.2px] mb-2 block">
                날짜 / 시작 시간
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 h-[52px] px-4 bg-grey-100 rounded-2xl text-[15px] font-semibold text-grey-900 outline-none focus:bg-grey-200 transition-colors"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="flex-1 h-[52px] px-4 bg-grey-100 rounded-2xl text-[15px] font-semibold text-grey-900 outline-none focus:bg-grey-200 transition-colors"
                />
              </div>
            </section>

            <section>
              <label className="text-[11px] font-bold text-grey-500 uppercase tracking-[1.2px] mb-2 block">
                만날 장소
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[...LOCATION_PRESETS, "직접 입력"].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className={
                      location === loc
                        ? "h-[38px] px-4 rounded-full text-[14px] font-semibold bg-primary-100 text-primary-700 border-[1.5px] border-primary-300"
                        : "h-[38px] px-4 rounded-full text-[14px] font-medium bg-grey-100 text-grey-700 border-[1.5px] border-transparent"
                    }
                  >
                    {loc}
                  </button>
                ))}
              </div>
              {location === "직접 입력" && (
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full h-[52px] px-4 bg-grey-100 rounded-2xl text-[15px] text-grey-900 outline-none focus:bg-grey-200 transition-colors placeholder:text-grey-400"
                  placeholder="장소를 입력해주세요"
                />
              )}
            </section>

            <section>
              <label className="text-[11px] font-bold text-grey-500 uppercase tracking-[1.2px] mb-2 block">
                모집 인원 (작성자 포함)
              </label>
              <div className="flex items-center bg-grey-100 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMaxParticipants((n) => Math.max(2, n - 1))}
                  className="w-[52px] h-[52px] flex items-center justify-center text-grey-600 disabled:text-grey-300"
                  disabled={maxParticipants <= 2}
                >
                  <Minus className="w-[18px] h-[18px]" />
                </button>
                <div className="flex-1 text-center text-[20px] font-bold text-grey-900">
                  {maxParticipants}명
                </div>
                <button
                  type="button"
                  onClick={() => setMaxParticipants((n) => Math.min(4, n + 1))}
                  className="w-[52px] h-[52px] flex items-center justify-center text-grey-600 disabled:text-grey-300"
                  disabled={maxParticipants >= 4}
                >
                  <Plus className="w-[18px] h-[18px]" />
                </button>
              </div>
              <p className="text-[12px] text-grey-500 mt-1.5">최소 2명 · 최대 4명</p>
            </section>

            <section>
              <label className="text-[11px] font-bold text-grey-500 uppercase tracking-[1.2px] mb-2 block">
                한줄 메모 <span className="text-grey-400 font-normal normal-case tracking-normal">(선택)</span>
              </label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={2}
                className="w-full bg-grey-100 rounded-2xl p-4 text-[15px] text-grey-900 outline-none focus:bg-grey-200 transition-colors placeholder:text-grey-400 resize-none"
                placeholder="예) 빨리 먹는 편이에요!"
              />
            </section>

            <section>
              <label className="text-[11px] font-bold text-grey-500 uppercase tracking-[1.2px] mb-2 block">
                오픈카톡 링크 <span className="text-grey-400 font-normal normal-case tracking-normal">(선택)</span>
              </label>
              <input
                type="text"
                value={kakaoLink}
                onChange={(e) => setKakaoLink(e.target.value)}
                className="w-full h-[52px] px-4 bg-grey-100 rounded-2xl text-[15px] text-grey-900 outline-none focus:bg-grey-200 transition-colors placeholder:text-grey-400"
                placeholder="https://open.kakao.com/o/…"
              />
              <p className="text-[12px] text-grey-500 mt-1.5">참여 확정 후 참여자에게만 공개됩니다</p>
            </section>

            <div className="flex items-center gap-2.5 p-3.5 bg-orange-50 rounded-xl">
              <AlertTriangle className="w-[18px] h-[18px] text-orange-500 shrink-0" />
              <span className="text-[13px] font-semibold text-orange-500">
                하루 최대 3개까지 모집글을 작성할 수 있어요
              </span>
            </div>

            {error && (
              <p className="text-[13px] font-medium text-red-500 text-center">{error}</p>
            )}
          </div>
        )}
      </main>

      <div className="p-5 pb-8 bg-white border-t border-grey-100">
        {step === 1 ? (
          <button
            onClick={() => step1Valid && setStep(2)}
            disabled={!step1Valid}
            className="btn-primary disabled:bg-grey-200 disabled:text-grey-500 disabled:shadow-none"
          >
            다음
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!step2Valid || submitting}
            className="btn-primary disabled:bg-grey-200 disabled:text-grey-500 disabled:shadow-none"
          >
            {submitting ? "게시 중…" : "게시하기"}
          </button>
        )}
      </div>
    </div>
  );
}
