import axiosInstance from "@/core/api/axios-instance";

const PASSWORD_ENDPOINTS = {
  forgotPassword: "/admin/auth/forget-password",
  resetPassword: "/admin/auth/reset-password",
} as const;

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
  const response = await axiosInstance.post<ForgotPasswordResponse>(
    PASSWORD_ENDPOINTS.forgotPassword,
    payload
  );
  return response.data;
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
  const response = await axiosInstance.post<ResetPasswordResponse>(
    PASSWORD_ENDPOINTS.resetPassword,
    payload
  );
  return response.data;
}
