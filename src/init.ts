import type { AccessEnum } from "./access/accessEnum";
import { api } from "./api/request";
import { useAuthStore } from "./store/User";

export function initializeApp() {
  const token = useAuthStore.getState().token;

  if (token) {
    api
      .get<{ id: number; username: string; role: AccessEnum }>("/auth/me")
      .then((data) => {
        useAuthStore.getState().setUser({ ...data, avatar: "" });
      })
      .catch(() => {
        useAuthStore.getState().clearAuth();
      });
  }
}
