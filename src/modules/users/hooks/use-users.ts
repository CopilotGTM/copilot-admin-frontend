import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listUsers,
  getUserProfile,
  createUser,
  updateUserDetails,
  updateUserAdminStatus,
  listUserActionHistory,
} from "../api/users.api";
import type {
  CreateUserRequest,
  UpdateUserDetailsRequest,
  UpdateUserAdminStatusRequest,
} from "../types/user.types";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params?: { limit?: number; cursor?: string; organisation_id?: string }) =>
    [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  histories: () => [...userKeys.all, "history"] as const,
  history: (params: { organisation_id: string; limit?: number; cursor?: string }) =>
    [...userKeys.histories(), params] as const,
};

// List users
export function useUsers(params?: { limit?: number; cursor?: string; organisation_id?: string }) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => listUsers(params),
  });
}

// Get single user profile
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
  });
}

// Create user
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: CreateUserRequest) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// Update user details
export function useUpdateUserDetails() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserDetailsRequest }) =>
      updateUserDetails(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.setQueryData(userKeys.detail(data.user_id), data);
    },
  });
}

// Update user admin status
export function useUpdateUserAdminStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserAdminStatusRequest }) =>
      updateUserAdminStatus(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.user_id) });
    },
  });
}

// List user action history
export function useUserActionHistory(params: {
  organisation_id: string;
  limit?: number;
  cursor?: string;
}) {
  return useQuery({
    queryKey: userKeys.history(params),
    queryFn: () => listUserActionHistory(params),
    enabled: !!params.organisation_id,
  });
}
