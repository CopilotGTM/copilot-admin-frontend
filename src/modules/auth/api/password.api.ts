import axiosInstance from "@/core/api/axios-instance";

const PASSWORD_ENDPOINTS = {
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
} as const;

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token_hash: string;
  new_password: string;
  confirm_password?: string;
  action?: "forgot" | "force_change";
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
