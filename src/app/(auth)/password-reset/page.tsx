"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";

type Step = 1 | 2 | 3 | "done";

interface Step1Fields { emailId: string }
interface Step3Fields { newPassword: string; confirmPassword: string }

export default function PasswordResetPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register: reg1,
    handleSubmit: handleSubmit1,
    getValues: getValues1,
    formState: { errors: errors1, isSubmitting: isSubmitting1 },
  } = useForm<Step1Fields>();

  const {
    register: reg3,
    handleSubmit: handleSubmit3,
    getValues: getValues3,
    formState: { errors: errors3, isSubmitting: isSubmitting3 },
  } = useForm<Step3Fields>();

  const onStep1Submit = handleSubmit1(async ({ emailId }) => {
    const fullEmail = `${emailId}@office.skhu.ac.kr`;
    setApiError("");
    try {
      await authService.resetSendCode(fullEmail);
      setEmail(fullEmail);
      setStep(2);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "인증코드 발송에 실패했어요.");
    }
  });

  const handleVerifyCode = async () => {
    setCodeError("");
    setCodeLoading(true);
    try {
      await authService.resetVerifyCode(email, code);
      setStep(3);
    } catch {
      setCodeError("인증코드가 올바르지 않아요.");
    } finally {
      setCodeLoading(false);
    }
  };

  const onStep3Submit = handleSubmit3(async ({ newPassword }) => {
    setApiError("");
    try {
      await authService.resetPassword(email, newPassword);
      setStep("done");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "비밀번호 변경에 실패했어요.");
    }
  });

  const stepNum = step === "done" ? 3 : (step as number);

  return (
    <div className="flex flex-col flex-1 bg-white">
      <header className="flex items-center justify-between px-2 py-1 h-[52px] shrink-0">
        <button
          onClick={() => (step === 1 || step === "done" ? router.push("/login") : setStep((s) => (s === 3 ? 2 : s === 2 ? 1 : s) as Step))}
          className="w-11 h-11 flex items-center justify-center rounded-[12px] text-grey-700 active:bg-grey-100"
        >
          <ArrowLeft className="w-[22px] h-[22px]" />
        </button>
        {step !== "done" && (
          <span className="text-[13px] font-semibold text-grey-500 pr-4">
            {stepNum} / 3
          </span>
        )}
      </header>

      {step !== "done" && (
        <div className="flex gap-1.5 px-5 pb-1">
          {([1, 2, 3] as number[]).map((s) => (
            <div
              key={s}
              className={`h-[3px] flex-1 rounded-full transition-colors ${
                stepNum >= s ? "bg-primary-500" : "bg-grey-200"
              }`}
            />
          ))}
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-5 pt-8 pb-6 no-scrollbar animate-fade-slide-up">
        {step === 1 && (
          <form id="step1-form" onSubmit={onStep1Submit} className="space-y-5">
            <h1 className="text-[26px] font-bold text-grey-900 leading-[34px] tracking-[-0.5px] mb-8">
              가입한 이메일을
              <br />
              입력해주세요
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
                  className="pr-28"
                />
                <span className="absolute right-4 text-[13px] font-medium text-grey-400 pointer-events-none">
                  @office.skhu.ac.kr
                </span>
              </div>
              {errors1.emailId && (
                <p className="text-[12px] text-red-500 px-1">{errors1.emailId.message}</p>
              )}
            </div>
            {apiError && (
              <p className="flex items-center gap-1.5 text-[13px] text-red-500">
                <AlertCircle className="w-4 h-4 shrink-0" /> {apiError}
              </p>
            )}
          </form>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h1 className="text-[26px] font-bold text-grey-900 leading-[34px] tracking-[-0.5px] mb-8">
              인증코드를
              <br />
              입력해주세요
            </h1>
            <p className="text-[14px] text-grey-600 -mt-6">
              <span className="font-semibold text-grey-900">{email}</span>로 발송됐어요
            </p>
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-grey-500 tracking-[1.2px] uppercase">
                인증코드
              </span>
              <div className="flex gap-2">
                <Input
                  placeholder="6자리 숫자 입력"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
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
              {codeError && (
                <p className="flex items-center gap-1.5 text-[13px] text-red-500">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {codeError}
                </p>
              )}
              {process.env.NODE_ENV === "development" && (
                <p className="text-[12px] text-grey-400 px-1">
                  테스트 코드: <strong className="text-grey-700">123456</strong>
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="weakPrimary"
              size="pill"
              onClick={async () => {
                try {
                  await authService.resetSendCode(email);
                } catch {}
              }}
            >
              코드 재발송
            </Button>
          </div>
        )}

        {step === 3 && (
          <form id="step3-form" onSubmit={onStep3Submit} className="space-y-5">
            <h1 className="text-[26px] font-bold text-grey-900 leading-[34px] tracking-[-0.5px] mb-8">
              새 비밀번호를
              <br />
              설정해주세요
            </h1>
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-grey-500 tracking-[1.2px] uppercase">
                새 비밀번호
              </span>
              <Input
                {...reg3("newPassword", {
                  required: "비밀번호를 입력해주세요",
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/,
                    message: "영문, 숫자, 특수문자(@$!%*#?&)를 포함해 8자 이상 입력해주세요",
                  },
                })}
                type="password"
                placeholder="8자 이상, 영문+숫자+특수문자"
              />
              {errors3.newPassword && (
                <p className="text-[12px] text-red-500 px-1">{errors3.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-grey-500 tracking-[1.2px] uppercase">
                비밀번호 확인
              </span>
              <Input
                {...reg3("confirmPassword", {
                  required: "비밀번호를 다시 입력해주세요",
                  validate: (v) => v === getValues3("newPassword") || "비밀번호가 일치하지 않아요",
                })}
                type="password"
                placeholder="비밀번호 재입력"
              />
              {errors3.confirmPassword && (
                <p className="text-[12px] text-red-500 px-1">{errors3.confirmPassword.message}</p>
              )}
            </div>
            {apiError && (
              <p className="flex items-center gap-1.5 text-[13px] text-red-500">
                <AlertCircle className="w-4 h-4 shrink-0" /> {apiError}
              </p>
            )}
          </form>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <CheckCircle2 className="w-16 h-16 text-primary-500" />
            <h1 className="text-[24px] font-bold text-grey-900">비밀번호가 변경됐어요</h1>
            <p className="text-[14px] text-grey-500">새 비밀번호로 로그인해주세요</p>
          </div>
        )}
      </main>

      <div className="px-5 pb-8 pt-4 shrink-0">
        {step === 1 && (
          <Button form="step1-form" type="submit" className="w-full" disabled={isSubmitting1}>
            {isSubmitting1 ? "발송 중..." : "인증코드 발송"}
          </Button>
        )}
        {step === 3 && (
          <Button form="step3-form" type="submit" className="w-full" disabled={isSubmitting3}>
            {isSubmitting3 ? "변경 중..." : "비밀번호 변경"}
          </Button>
        )}
        {step === "done" && (
          <Button className="w-full" onClick={() => router.replace("/login")}>
            로그인하기
          </Button>
        )}
      </div>
    </div>
  );
}
