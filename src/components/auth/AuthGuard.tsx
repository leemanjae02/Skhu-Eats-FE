"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { TopBar } from "../layout/TopBar";
import { BottomNav } from "../layout/BottomNav";

interface AuthGuardProps {
  children: React.ReactNode;
  title?: string;
  showLogo?: boolean;
  rightAction?: React.ReactNode;
}

export function AuthGuard({ 
  children, 
  title, 
  showLogo = false,
  rightAction 
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // 하이드레이션 전이거나 인증되지 않은 경우 (리다이렉트 전) 골격 UI 렌더링
  if (!_hasHydrated || !isAuthenticated) {
    return (
      <div className="flex flex-col h-full bg-white">
        <TopBar 
          title={title} 
          showLogo={showLogo} 
          rightAction={rightAction}
        />
        <div className="flex-1 bg-white" />
        <BottomNav />
      </div>
    );
  }

  return <>{children}</>;
}
