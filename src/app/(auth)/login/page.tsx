"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/common/Card";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface LoginForm {
  emailId: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      router.replace("/");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = handleSubmit(async ({ emailId, password }) => {
    try {
      const fullEmail = emailId.includes("@")
        ? emailId
        : `${emailId}@office.skhu.ac.kr`;
      const res = await authService.login(fullEmail, password);
      setAuth({
        id: res.user_id,
        user_id: res.user_id,
        email: fullEmail,
        nickname: res.nickname,
        avatar: null,
      });
      router.replace("/");
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "로그인에 실패했습니다.",
      });
    }
  });

  if (!_hasHydrated) {
    return (
      <div className="flex flex-col flex-1 bg-white">
        <TopBar showLogo />
        <div className="flex-1" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex flex-col flex-1 bg-white">
        <TopBar showLogo />
        <div className="flex-1" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-white">
      <TopBar
        showLogo
        rightAction={
          <button className="text-[14px] font-medium text-grey-600 px-[10px] py-[6px]">
            도움말
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto px-6 py-7 flex flex-col no-scrollbar animate-fade-slide-up">
        <section className="mb-8">
          <h1 className="text-[26px] font-bold text-grey-900 leading-[36px] tracking-[-0.6px] mb-2">
            오늘 점심,
            <br />
            <span className="hl">같이 먹을 친구</span>를<br />
            찾아보세요
          </h1>
          <p className="text-[15px] text-grey-600 leading-[22px]">
            학교 이메일로 간편하게 시작해요
          </p>
        </section>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-grey-500 tracking-[1.2px] uppercase">
              이메일
            </span>
            <div className="relative flex items-center">
              <Input
                {...register("emailId", {
                  required: "이메일을 입력해주세요",
                  pattern: {
                    value: /^[a-zA-Z0-9._-]+(@office\.skhu\.ac\.kr)?$/,
                    message: "올바른 학번 또는 이메일을 입력해주세요",
                  },
                })}
                className="pr-24"
                placeholder="학번 또는 아이디"
                disabled={isSubmitting}
              />
              <span className="absolute right-4 text-[13px] font-medium text-grey-400">
                @office.skhu.ac.kr
              </span>
            </div>
            {errors.emailId && (
              <p className="text-sm font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                {errors.emailId.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-grey-500 tracking-[1.2px] uppercase">
              비밀번호
            </span>
            <Input
              {...register("password", {
                required: "비밀번호를 입력해주세요",
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/,
                  message: "영문, 숫자, 특수문자(@$!%*#?&)를 포함해 8자 이상 입력해주세요",
                },
              })}
              type="password"
              placeholder="비밀번호 입력"
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-sm font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {errors.root && (
            <p className="text-sm font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
              {errors.root.message}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </Button>

          <div className="flex items-center justify-center gap-0 mt-4">
            <Link
              href="#"
              className="text-[13px] font-medium text-grey-600 px-[10px] py-1"
            >
              아이디 찾기
            </Link>
            <span className="text-grey-300 text-[13px]">|</span>
            <Link
              href="#"
              className="text-[13px] font-medium text-grey-600 px-[10px] py-1"
            >
              비밀번호 재설정
            </Link>
            <span className="text-grey-300 text-[13px]">|</span>
            <Link
              href="/register"
              className="text-[13px] font-bold text-grey-900 px-[10px] py-1"
            >
              회원가입
            </Link>
          </div>
        </form>

        <div className="flex items-center gap-3 mt-8 mb-4 text-grey-500">
          <div className="flex-1 h-[1px] bg-grey-200" />
          <span className="text-[11px] font-semibold tracking-[0.5px] whitespace-nowrap uppercase">
            오늘의 밥친구 추천
          </span>
          <div className="flex-1 h-[1px] bg-grey-200" />
        </div>

        <div className="space-y-[10px] mb-8">
          <Card
            thumbnail="🍜"
            category="분식"
            status="active"
            time="12:15"
            title="부대찌개 + 공기밥"
            location="학생회관 1층"
            currentParticipants={3}
            maxParticipants={4}
            avatars={[]}
          />
          <Card
            thumbnail="🍣"
            category="일식"
            status="active"
            time="13:00"
            title="스시로 런치세트"
            location="정문 스시로"
            currentParticipants={2}
            maxParticipants={4}
            avatars={[]}
          />
        </div>
      </main>
    </div>
  );
}
