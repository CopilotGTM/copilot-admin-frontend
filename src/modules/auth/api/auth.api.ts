import axiosInstance from "@/core/api/axios-instance";
import type { AdminAuthResponse, AdminTokens } from "../types/auth.types";

const AUTH_ENDPOINTS = {
  login: "/auth/login",
  refresh: "/auth/refresh",
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
  const response = await axiosInstance.post<AdminTokens>(AUTH_ENDPOINTS.refresh, {
    refresh_token,
  });
  return response.data;
}

export async function logoutAdmin(): Promise<void> {
  await axiosInstance.post(AUTH_ENDPOINTS.logout);
}
