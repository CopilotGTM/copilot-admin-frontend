import { LoginInput } from "../app/schemas/auth";
import { useAuthStore } from "@/modules/auth/store";
import restAxiosInstance from "../core/rest-client/rest-client.axios";
import { clearRememberedEmail } from "./remember-me";

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

export interface AdminAuthResponse {
  status: "SUCCESS" | "ERROR";
  message: string;
  data: AdminUser & {
    tokens?: AdminTokens;
    password_reset_link?: string;
  };
}

export const login = async (data: LoginInput): Promise<AdminAuthResponse> => {
  const response = await restAxiosInstance.post<AdminAuthResponse>(
    "/auth/login",
    data,
  );
  return response.data;
};

export const refreshAccessToken = async (
  refresh_token: string,
): Promise<AdminTokens> => {
  const response = await restAxiosInstance.post<{ data: AdminTokens }>(
    "/auth/access_token",
    { refresh_token },
  );
  return response.data.data;
};

export const logout = (): void => {
  if (globalThis.window !== undefined) {
    const { clearAuth } = useAuthStore.getState();
    clearAuth();
    clearRememberedEmail();
  }
};
