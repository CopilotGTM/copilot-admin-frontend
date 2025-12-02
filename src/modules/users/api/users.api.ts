import axiosInstance from "@/core/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";
import type {
  UserProfile,
  ListUsersResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserAdminStatusRequest,
  UpdateUserAdminStatusResponse,
  UpdateUserDetailsRequest,
  UpdateUserDetailsResponse,
  ListUserHistoryResponse,
} from "../types/user.types";

const BASE = "/users" as const;

export async function createUser(payload: CreateUserRequest): Promise<CreateUserResponse> {
  const res = await axiosInstance.post<ApiResponse<CreateUserResponse>>(
    `${BASE}/create_user`,
    payload,
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to create user");
  }
  return res.data.data;
}

export async function getUserProfile(user_id: string): Promise<UserProfile> {
  const res = await axiosInstance.get<ApiResponse<UserProfile>>(
    `${BASE}/${user_id}/profile`,
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to fetch user profile");
  }
  return res.data.data;
}

export async function listUsers(params: {
  limit?: number;
  cursor?: string;
  organisation_id?: string;
} = {}): Promise<ListUsersResponse> {
  const res = await axiosInstance.get<ApiResponse<ListUsersResponse>>(
    `${BASE}/list_users`,
    { params },
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to fetch users");
  }
  return res.data.data;
}

export async function updateUserAdminStatus(
  user_id: string,
  payload: UpdateUserAdminStatusRequest,
): Promise<UpdateUserAdminStatusResponse> {
  const res = await axiosInstance.put<ApiResponse<UpdateUserAdminStatusResponse>>(
    `${BASE}/${user_id}/admin_status`,
    payload,
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to update user admin status");
  }
  return res.data.data;
}

export async function updateUserDetails(
  user_id: string,
  payload: UpdateUserDetailsRequest,
): Promise<UpdateUserDetailsResponse> {
  const res = await axiosInstance.put<ApiResponse<UpdateUserDetailsResponse>>(
    `${BASE}/${user_id}/update`,
    payload,
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to update user");
  }
  return res.data.data;
}

export async function listUserActionHistory(params: {
  organisation_id: string;
  limit?: number;
  cursor?: string;
}): Promise<ListUserHistoryResponse> {
  const { organisation_id, ...rest } = params;
  const res = await axiosInstance.get<ApiResponse<ListUserHistoryResponse>>(
    `${BASE}/history/organisation/${organisation_id}`,
    { params: rest },
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to fetch user history");
  }
  return res.data.data;
}
