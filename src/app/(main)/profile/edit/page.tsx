"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();

  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = nickname.trim();
  const valid = trimmed.length > 0 && trimmed !== user?.nickname;

  const handleSave = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateProfile({ nickname: trimmed });
      router.replace("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "프로필 수정에 실패했어요");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <TopBar
        title="프로필 수정"
        leftAction={
          <button
            onClick={() => router.back()}
            className="w-11 h-11 flex items-center justify-center text-grey-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />

      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-5 space-y-6">
        <section>
          <label className="text-[11px] font-bold text-grey-500 uppercase tracking-[1.2px] mb-2 block">
            닉네임
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full h-[52px] px-4 bg-grey-100 rounded-2xl text-[15px] text-grey-900 outline-none focus:bg-grey-200 transition-colors placeholder:text-grey-400"
            placeholder="닉네임을 입력해주세요"
            maxLength={20}
          />
          <p className="text-[12px] text-grey-500 mt-1.5">
            다른 사람에게 보여지는 이름이에요.
          </p>
        </section>

        {error && <p className="text-[13px] font-medium text-red-500 text-center">{error}</p>}
      </main>

      <div className="p-5 pb-8 bg-white border-t border-grey-100">
        <button
          onClick={handleSave}
          disabled={!valid || submitting}
          className="btn-primary disabled:bg-grey-200 disabled:text-grey-500 disabled:shadow-none"
        >
          {submitting ? "저장 중…" : "저장"}
        </button>
      </div>
    </div>
  );
}
