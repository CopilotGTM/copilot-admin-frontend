// Auth module types

export interface AdminUser {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  state: "ACTIVE" | "PASSWORD_CHANGE_REQUIRED";
  created_at: string;
  email_verified: boolean;
  last_login_at: string;
}

export interface AdminTokens {
  access_token: string;
  refresh_token: string;
}

// The login response returns user data with optional tokens/password_reset_link
export type AdminAuthResponse = AdminUser & {
  tokens?: AdminTokens;
  password_reset_link?: string;
};

export interface AdminAuthResponseWrapper {
  success: boolean;
  message: string;
  data: AdminAuthResponse;
}

export interface GenericResponse {
  status: "SUCCESS" | "ERROR";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  message: string;
}

export interface AuthState {
  access_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  adminUser: AdminUser | null;
  user: AdminUser | null; // Alias for adminUser for compatibility
  setAuth: (
    access_token: string,
    refresh_token: string,
    adminUser: AdminUser | null,
    rememberFor30Days?: boolean,
  ) => void;
  clearAuth: () => void;
  updateTokens: (access_token: string, refresh_token: string) => void;
}
