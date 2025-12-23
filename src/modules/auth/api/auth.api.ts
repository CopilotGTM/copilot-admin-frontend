import axiosInstance, { rawAxiosInstance } from "@/core/api/axios-instance";
import type { AdminAuthResponse, AdminTokens } from "../types/auth.types";
import type { ApiResponse } from "@/types/api.types";

const AUTH_ENDPOINTS = {
  // Per docs: base '/admin/auth'
  login: "/auth/login",
  refresh: "/auth/refresh-token",
  logout: "/auth/logout",
} as const;

export interface LoginPayload {
  email: string;
  password: string;
}

export async function loginAdmin(payload: LoginPayload): Promise<AdminAuthResponse> {
  const response = await axiosInstance.post<AdminAuthResponse>(AUTH_ENDPOINTS.login, payload);
  return response.data;
}

export async function refreshTokens(refresh_token: string): Promise<AdminTokens> {
  const response = await rawAxiosInstance.post<ApiResponse<AdminTokens>>(AUTH_ENDPOINTS.refresh, {
    refresh_token,
  });

  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to refresh token");
  }

  return response.data.data;
}

export async function logoutAdmin(): Promise<void> {
  await axiosInstance.post(AUTH_ENDPOINTS.logout);
}
