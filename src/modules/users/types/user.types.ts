// User types

export type UserAppRole = "member" | "admin";
export type SupabaseUserStatus = "ACTIVE" | "INACTIVE" | "PASSWORD_CHANGE_REQUIRED";
export type AdminUserStatus = "pending" | "approved" | "rejected" | "suspended" | "deactivated";
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
