import restAxiosInstance from "../core/rest-client/rest-client.axios";
import { ForgotPasswordInput, ResetPasswordInput } from "../app/schemas/auth";

export interface GenericResponse {
  status: "SUCCESS" | "ERROR";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  message: string;
}

export const sendResetPasswordLink = async (
  data: ForgotPasswordInput,
): Promise<GenericResponse> => {
  const response = await restAxiosInstance.post<GenericResponse>(
    "/auth/forgot-password",
    data,
  );
  return response.data;
};

export const resetPassword = async (
  data: ResetPasswordInput,
): Promise<GenericResponse> => {
  const response = await restAxiosInstance.post<GenericResponse>(
    "/auth/reset-password",
    {
      action: data.action,
      new_password: data.new_password,
      confirm_password: data.confirm_password,
      token_hash: data.token_hash
    },
  );
  return response.data;
};
