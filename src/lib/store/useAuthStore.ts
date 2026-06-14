import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, UpdateProfilePayload } from "@/types/auth";
import { authService } from "@/services/auth.service";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAuth: (user: User) => void;
  logout: () => Promise<void>;
  withdraw: () => Promise<void>;
  updateProfile: (data: UpdateProfilePayload) => Promise<void>;
  setHasHydrated: (state: boolean) => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setAuth: (user) => set({ user, isAuthenticated: true }),
      logout: async () => {
        try {
          await fetch("/auth/logout", { method: "POST" });
        } finally {
          set({ user: null, isAuthenticated: false });
        }
      },
      withdraw: async () => {
        try {
          await authService.withdraw();
          // 쿠키(auth-token/refresh-token) 정리
          await fetch("/auth/logout", { method: "POST" });
        } finally {
          set({ user: null, isAuthenticated: false });
        }
      },
      updateProfile: async (data) => {
        const updated = await authService.updateProfile(data);
        set({ user: { ...updated, id: updated.user_id ?? updated.id ?? "" } });
      },
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      initAuth: async () => {
        if (!get().isAuthenticated) return;
        const normalize = (u: User): User => ({ ...u, id: u.user_id ?? u.id ?? "" });
        try {
          const user = await authService.getMe();
          set({ user: normalize(user), isAuthenticated: true });
        } catch {
          // 쿠키 만료 → refresh 시도
          try {
            await authService.refresh();
            const user = await authService.getMe();
            set({ user: normalize(user), isAuthenticated: true });
          } catch {
            set({ user: null, isAuthenticated: false });
          }
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
