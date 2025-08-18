import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { AdminUser } from "../../lib/auth";

interface AuthState {
  access_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
  adminUser: AdminUser | null;
  setAuth: (
    access_token: string,
    refresh_token: string,
    adminUser: AdminUser | null,
    rememberFor30Days?: boolean,
  ) => void;
  clearAuth: () => void;
  updateTokens: (access_token: string, refresh_token: string) => void;
}

const TOKEN_COOKIE_KEY = "cg_auth";

// Will be updated just-in-time by setAuth before save
let tokenCookieExpiryDays = 2 / 24; // 2 hours by default

const cookieStorage = {
  getItem: (name: string) => {
    const value = Cookies.get(name);
    return value ?? null;
  },
  setItem: (name: string, value: unknown) => {
    Cookies.set(name, String(value), {
      expires: tokenCookieExpiryDays,
      secure: true,
      sameSite: "strict",
    });
  },
  removeItem: (name: string) => Cookies.remove(name),
};

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      access_token: null,
      refresh_token: null,
      isAuthenticated: false,
      adminUser: null,
      setAuth: (
        access_token,
        refresh_token,
        adminUser,
        rememberFor30Days = false,
      ) => {
        tokenCookieExpiryDays = rememberFor30Days ? 30 : 2 / 24;
        set({ access_token, refresh_token, isAuthenticated: true, adminUser });
      },
      clearAuth: () => {
        Cookies.remove(TOKEN_COOKIE_KEY);
        set({ access_token: null, refresh_token: null, isAuthenticated: false, adminUser: null });
      },
      updateTokens: (access_token, refresh_token) => {
        // Preserve adminUser and isAuthenticated as-is; do not change cookie expiry
        const current = get();
        set({
          access_token,
          refresh_token,
          isAuthenticated: current.isAuthenticated || true,
          adminUser: current.adminUser,
        });
      },
    }),
    {
      name: TOKEN_COOKIE_KEY,
      storage: createJSONStorage(() => cookieStorage),
    },
  ),
);

export default useAuthStore;
