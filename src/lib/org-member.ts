import restAxiosInstance from "../core/rest-client/rest-client.axios";

export type ApiStatus = "SUCCESS" | "ERROR";

export interface ApiResponse<T> {
  status: ApiStatus;
  message: string;
  data: T | null;
}

// --- Types ---
export type UserAppRole = "member" | "admin";
export type SupabaseUserStatus = "ACTIVE" | "INACTIVE" | "PASSWORD_CHANGE_REQUIRED";
export type AdminUserStatus = "pending" | "approved" | "rejected" | "suspended" | "deactivated";

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  organisation_id: string;
  user_role: UserAppRole;
  job_title?: string;
  organisation_role: string;
}

export interface CreateUserResponse {
  user_id: string;
  email: string;
  created_at: string;
}

export interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  organisation_id: string;
  organisation_role: string;
  job_title: string;
  status: SupabaseUserStatus;
  admin_status: AdminUserStatus;
  created_at: string;
  updated_at: string;
}

export type UserListItem = UserProfile;

export interface ListUsersResponse {
  users: UserListItem[];
  cursor: string | null;
}

export interface UpdateUserAdminStatusRequest {
  admin_status: AdminUserStatus;
  note?: string;
}

export interface UpdateUserAdminStatusResponse {
  user_id: string;
  status: SupabaseUserStatus;
  admin_status: AdminUserStatus;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface UpdateUserDetailsRequest {
  first_name?: string;
  last_name?: string;
  job_title?: string;
  organisation_role?: string;
  user_role?: UserAppRole;
}

export type UpdateUserDetailsResponse = UserProfile;

export type UserEventType =
  | "created"
  | "updated"
  | "status_changed"
  | "role_changed"
  | "deleted"
  | "login"
  | "password_reset"
  | "email_verified"
  | "field_changed";

export interface UserHistoryItem {
  id: string;
  user_id: string;
  action: UserEventType;
  note: string;
  details: Record<string, unknown>;
  created_at: string;
  actor_admin_id: string;
}

export interface ListUserHistoryResponse {
  history: UserHistoryItem[];
  cursor: string | null;
}

// --- Base path (baseURL already includes '/admin') ---
const BASE = "/users" as const;

// --- API Calls ---
export async function createUser(payload: CreateUserRequest): Promise<CreateUserResponse> {
  const res = await restAxiosInstance.post<ApiResponse<CreateUserResponse>>(
    `${BASE}/create_user`,
    payload,
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to create user");
  }
  return res.data.data;
}

export async function getUserProfile(user_id: string): Promise<UserProfile> {
  const res = await restAxiosInstance.get<ApiResponse<UserProfile>>(
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
  const res = await restAxiosInstance.get<ApiResponse<ListUsersResponse>>(
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
  const res = await restAxiosInstance.put<ApiResponse<UpdateUserAdminStatusResponse>>(
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
  const res = await restAxiosInstance.put<ApiResponse<UpdateUserDetailsResponse>>(
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
  const res = await restAxiosInstance.get<ApiResponse<ListUserHistoryResponse>>(
    `${BASE}/history/organisation/${organisation_id}`,
    { params: rest },
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to fetch user history");
  }
  return res.data.data;
}
