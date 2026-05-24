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
  const { isAuthenticated, _hasHydrated, initAuth } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated) {
      initAuth();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [_hasHydrated, isAuthenticated, router]);

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
