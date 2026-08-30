import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AccessEnum } from "../access/accessEnum";

interface UserInfo {
  id: number;
  username: string;
  role: AccessEnum;
  avatar: string;
}

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  setAuth: (token: string, user: UserInfo) => void;
  setUser: (user: UserInfo) => void;
  updateUser: (partial: Partial<UserInfo>) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : state.user,
        })),
      clearAuth: () => set({ user: null, token: null }),
    }),
    {
      name: "judge-auth",
    }
  )
);

export { useAuthStore };
export type { UserInfo };
