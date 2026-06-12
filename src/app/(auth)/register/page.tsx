"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/common/Chip";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/lib/store/useAuthStore";

const FOOD_CATEGORIES = [
  { id: "면류", label: "🍜 면류" },
  { id: "한식", label: "🍚 한식" },
  { id: "일식", label: "🍣 일식" },
  { id: "양식", label: "🍕 양식" },
  { id: "중식", label: "🥟 중식" },
  { id: "분식", label: "🌯 분식" },
];

const DEPARTMENTS = [
  "소프트웨어공학과",
  "컴퓨터공학과",
  "정보통신공학과",
  "경영학과",
  "경제학과",
  "사회복지학과",
  "영어학과",
  "기계공학과",
  "전자공학과",
  "간호학과",
  "기타",
];

interface Step1Fields {
  emailId: string;
  password: string;
}

interface Step2Fields {
  nickname: string;
  department: string;
  admissionYear: string;
}

type Step = 1 | 2;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, _hasHydrated } = useAuthStore();
  const [step, setStep] = useState<Step>(1);

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      router.replace("/");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);

  const [nicknameStatus, setNicknameStatus] = useState<"idle" | "ok" | "taken">("idle");
  const [nicknameLoading, setNicknameLoading] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [apiError, setApiError] = useState("");

  const {
    register: reg1,
    getValues: getStep1Values,
    trigger: trigger1,
    formState: { errors: errors1 },
    handleSubmit: handleSubmit1,
  } = useForm<Step1Fields>();

  const {
    register: reg2,
    watch: watch2,
    getValues: getStep2Values,
    formState: { errors: errors2, isSubmitting: isSubmitting2 },
    handleSubmit: handleSubmit2,
  } = useForm<Step2Fields>();

  const watchedNickname = watch2("nickname", "");
  useEffect(() => {
    setNicknameStatus("idle");
  }, [watchedNickname]);

  const handleSendCode = async () => {
    const valid = await trigger1("emailId");
    if (!valid) return;
    const emailId = getStep1Values("emailId");
    setCodeError("");
    setCodeLoading(true);
    try {
      await authService.sendCode(`${emailId}@office.skhu.ac.kr`);
      setCodeSent(true);
    } catch {
      setCodeError("인증코드 발송에 실패했어요.");
    } finally {
      setCodeLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const emailId = getStep1Values("emailId");
    setCodeError("");
    setCodeLoading(true);
    try {
      // 성공 시 200, 코드가 틀리면 4xx 예외 → catch 에서 처리
      await authService.verifyCode(`${emailId}@office.skhu.ac.kr`, code);
      setCodeVerified(true);
    } catch {
      setCodeError("인증코드가 올바르지 않아요.");
    } finally {
      setCodeLoading(false);
    }
  };

  const handleCheckNickname = async () => {
    const nickname = getStep2Values("nickname");
    if (!nickname) return;
    setNicknameLoading(true);
    try {
      const { available } = await authService.checkNickname(nickname);
      setNicknameStatus(available ? "ok" : "taken");
    } catch {
      setNicknameStatus("taken");
    } finally {
      setNicknameLoading(false);
    }
  };

  const onStep1Submit = handleSubmit1(() => {
    if (!codeVerified) {
      setCodeError("이메일 인증을 완료해주세요.");
      return;
    }
    setApiError("");
    setStep(2);
  });

  const onStep2Submit = handleSubmit2(async (data) => {
    if (nicknameStatus !== "ok") {
      setApiError("닉네임 중복확인을 완료해주세요.");
      return;
    }
    setApiError("");
    const { emailId, password } = getStep1Values();
    try {
      const res = await authService.register({
        email: `${emailId}@office.skhu.ac.kr`,
        password,
        nickname: data.nickname,
        department: data.department,
        admission_year: data.admissionYear,
        food_categories: selectedCategories,
      });
      setAuth({
        id: res.user_id,
        user_id: res.user_id,
        email: res.email,
        nickname: res.nickname,
        avatar: null,
        department: res.department,
        admission_year: res.admission_year,
        bio: res.bio,
      });
      router.replace("/");
    } catch {
      setApiError("회원가입에 실패했어요. 다시 시도해주세요.");
    }
  });

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  if (!_hasHydrated) {
    return (
      <div className="flex flex-col flex-1 bg-white">
        <header className="h-[52px]" />
        <div className="flex-1" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex flex-col flex-1 bg-white">
        <header className="h-[52px]" />
        <div className="flex-1" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-white">
      <header className="flex items-center justify-between px-2 py-1 h-[52px] shrink-0">
        <button
          onClick={() => (step === 1 ? router.push("/login") : setStep(1))}
          className="w-11 h-11 flex items-center justify-center rounded-[12px] text-grey-700 active:bg-grey-100"
        >
          <ArrowLeft className="w-[22px] h-[22px]" />
        </button>
        <span className="text-[13px] font-semibold text-grey-500 pr-4">
          {step} / 2
        </span>
      </header>

      <div className="flex gap-1.5 px-5 pb-1">
        {([1, 2] as Step[]).map((s) => (
          <div
            key={s}
            className={`h-[3px] flex-1 rounded-full transition-colors ${
              step >= s ? "bg-primary-500" : "bg-grey-200"
            }`}
          />
        ))}
      </div>

      <main className="flex-1 overflow-y-auto px-5 pt-8 pb-6 no-scrollbar animate-fade-slide-up">
        {step === 1 && (
          <form id="step1-form" onSubmit={onStep1Submit} className="space-y-5">
            <h1 className="text-[26px] font-bold text-grey-900 leading-[34px] tracking-[-0.5px] mb-8">
              학교 이메일로
              <br />
              시작해볼까요?
            </h1>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-grey-500 tracking-[1.2px] uppercase">
                이메일
              </span>
              <div className="relative flex items-center">
                <Input
                  {...reg1("emailId", {
                    required: "이메일을 입력해주세요",
                    pattern: {
                      value: /^[a-zA-Z0-9._-]+(@office\.skhu\.ac\.kr)?$/,
                      message: "올바른 학번 또는 이메일을 입력해주세요",
                    },
                  })}
                  placeholder="학번 또는 아이디"
                  disabled={codeVerified}
                  className="pr-28"
                  onChange={(e) => {
                    reg1("emailId").onChange(e);
                    setCodeSent(false);
                    setCodeVerified(false);
                  }}
                />
                <span className="absolute right-4 text-[13px] font-medium text-grey-400 pointer-events-none">
                  @office.skhu.ac.kr
                </span>
              </div>
              {errors1.emailId && (
                <p className="text-[12px] text-red-500 px-1">{errors1.emailId.message}</p>
              )}
              {!codeVerified && (
                <Button
                  type="button"
                  variant={codeSent ? "weakPrimary" : "primary"}
                  size="pill"
                  onClick={handleSendCode}
                  disabled={codeLoading}
                >
                  {codeSent ? "재발송" : "인증코드 발송"}
                </Button>
              )}
            </div>

            {codeSent && !codeVerified && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-grey-500 tracking-[1.2px] uppercase">
                  인증코드
                </span>
                <div className="flex gap-2">
                  <Input
                    placeholder="6자리 숫자 입력"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="weakPrimary"
                    size="pill"
                    onClick={handleVerifyCode}
                    disabled={code.length !== 6 || codeLoading}
                    className="shrink-0"
                  >
                    확인
                  </Button>
                </div>
                {process.env.NODE_ENV === "development" && (
                  <p className="text-[12px] text-grey-400 px-1">
                    테스트 코드: <strong className="text-grey-700">123456</strong>
                  </p>
                )}
              </div>
            )}

            {codeVerified && (
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                이메일 인증이 완료됐어요
              </p>
            )}

            {codeError && (
              <p className="flex items-center gap-1.5 text-[13px] text-red-500">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {codeError}
              </p>
            )}

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-grey-500 tracking-[1.2px] uppercase">
                비밀번호
              </span>
              <Input
                {...reg1("password", {
                  required: "비밀번호를 입력해주세요",
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/,
                    message: "영문, 숫자, 특수문자(@$!%*#?&)를 포함해 8자 이상 입력해주세요",
                  },
                })}
                type="password"
                placeholder="8자 이상, 영문+숫자+특수문자"
              />
              {errors1.password && (
                <p className="text-[12px] text-red-500 px-1">{errors1.password.message}</p>
              )}
            </div>
          </form>
        )}

        {step === 2 && (
          <form id="step2-form" onSubmit={onStep2Submit} className="space-y-5">
            <h1 className="text-[26px] font-bold text-grey-900 leading-[34px] tracking-[-0.5px] mb-8">
              나를 소개해주세요
            </h1>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-grey-500 tracking-[1.2px] uppercase">
                닉네임
              </span>
              <div className="flex gap-2">
                <Input
                  {...reg2("nickname", {
                    required: "닉네임을 입력해주세요",
                    maxLength: { value: 10, message: "최대 10자까지 입력 가능해요" },
                  })}
                  placeholder="예) 밥순이 (최대 10자)"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="weakPrimary"
                  size="pill"
                  onClick={handleCheckNickname}
                  disabled={!watchedNickname || nicknameLoading}
                  className="shrink-0"
                >
                  중복확인
                </Button>
              </div>
              {errors2.nickname && (
                <p className="text-[12px] text-red-500 px-1">{errors2.nickname.message}</p>
              )}
              {nicknameStatus === "ok" && (
                <p className="flex items-center gap-1 text-[12px] font-semibold text-green-600 px-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 사용 가능한 닉네임이에요
                </p>
              )}
              {nicknameStatus === "taken" && (
                <p className="flex items-center gap-1 text-[12px] font-semibold text-red-500 px-1">
                  <AlertCircle className="w-3.5 h-3.5" /> 이미 사용 중인 닉네임이에요
                </p>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-grey-500 tracking-[1.2px] uppercase">
                학과
              </span>
              <div className="relative">
                <select
                  {...reg2("department", { required: "학과를 선택해주세요" })}
                  className="w-full h-[52px] bg-grey-100 border-none rounded-[14px] px-4 text-[16px] text-grey-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                  <option value="">학과를 선택해주세요</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-grey-400 text-lg">›</span>
              </div>
              {errors2.department && (
                <p className="text-[12px] text-red-500 px-1">{errors2.department.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-grey-500 tracking-[1.2px] uppercase">
                입학연도
              </span>
              <div className="relative">
                <select
                  {...reg2("admissionYear", { required: "입학연도를 선택해주세요" })}
                  className="w-full h-[52px] bg-grey-100 border-none rounded-[14px] px-4 text-[16px] text-grey-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                  <option value="">입학연도를 선택해주세요</option>
                  {Array.from({ length: 10 }, (_, i) => 2026 - i).map((y) => (
                    <option key={y} value={String(y)}>
                      {y}년 ({String(y).slice(2)}학번)
                    </option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-grey-400 text-lg">›</span>
              </div>
              {errors2.admissionYear && (
                <p className="text-[12px] text-red-500 px-1">{errors2.admissionYear.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-grey-500 tracking-[1.2px] uppercase">
                선호 음식
              </span>
              <p className="text-[12px] text-grey-400">복수 선택 가능해요</p>
              <div className="flex flex-wrap gap-2">
                {FOOD_CATEGORIES.map((cat) => (
                  <Chip
                    key={cat.id}
                    active={selectedCategories.includes(cat.id)}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {cat.label}
                  </Chip>
                ))}
              </div>
            </div>

            {apiError && (
              <p className="flex items-center gap-1.5 text-[13px] text-red-500">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {apiError}
              </p>
            )}
          </form>
        )}
      </main>

      <div className="px-5 pb-8 pt-4 shrink-0">
        {step === 1 ? (
          <Button form="step1-form" type="submit" className="w-full">
            다음
          </Button>
        ) : (
          <Button
            form="step2-form"
            type="submit"
            className="w-full"
            disabled={nicknameStatus !== "ok" || isSubmitting2}
          >
            {isSubmitting2 ? "가입 중..." : "시작하기"}
          </Button>
        )}
      </div>
    </div>
  );
}
