import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { AuthState } from "../types/auth.types";
import { TOKEN_COOKIE_KEY } from "../../../types/constants";

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
      isHydrated: false,
      adminUser: null,
      user: null, // Alias for adminUser
      setAuth: (
        access_token,
        refresh_token,
        adminUser,
        rememberFor30Days = false,
      ) => {
        tokenCookieExpiryDays = rememberFor30Days ? 30 : 2 / 24;
        set({ 
          access_token, 
          refresh_token, 
          isAuthenticated: true, 
          adminUser,
          user: adminUser, // Keep in sync
        });
      },
      clearAuth: () => {
        Cookies.remove(TOKEN_COOKIE_KEY);
        set({ 
          access_token: null, 
          refresh_token: null, 
          isAuthenticated: false, 
          adminUser: null,
          user: null,
        });
      },
      updateTokens: (access_token, refresh_token) => {
        // Preserve adminUser and isAuthenticated as-is; do not change cookie expiry
        const current = get();
        set({
          access_token,
          refresh_token,
          isAuthenticated: current.isAuthenticated || true,
          adminUser: current.adminUser,
          user: current.adminUser,
        });
      },
    }),
    {
      name: TOKEN_COOKIE_KEY,
      storage: createJSONStorage(() => cookieStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
          // Sync user alias after rehydration
          state.user = state.adminUser;
        }
      },
    },
  ),
);

export default useAuthStore;
