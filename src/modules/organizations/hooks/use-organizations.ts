import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  updateOrganizationStatus,
  getAllOrganisationsHistory,
  getOrganisationHistory,
  getCountries,
  createOrganizationAsync,
} from "../api/organizations.api";
import type {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  UpdateOrganizationStatusRequest,
} from "../types/organization.types";

// Query keys
export const organizationKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationKeys.all, "list"] as const,
  list: (params?: { limit?: number; cursor?: string }) =>
    [...organizationKeys.lists(), params] as const,
  details: () => [...organizationKeys.all, "detail"] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  countries: () => [...organizationKeys.all, "countries"] as const,
  histories: () => [...organizationKeys.all, "history"] as const,
  allHistory: (params?: { limit?: number; cursor?: string }) =>
    [...organizationKeys.histories(), "all", params] as const,
  history: (id: string, params?: { limit?: number; cursor?: string }) =>
    [...organizationKeys.histories(), id, params] as const,
};

// List organizations
export function useOrganizations(params?: { limit?: number; cursor?: string }) {
  return useQuery({
    queryKey: organizationKeys.list(params),
    queryFn: () => listOrganizations(params),
  });
}

// Get single organization
export function useOrganization(organisationId: string) {
  return useQuery({
    queryKey: organizationKeys.detail(organisationId),
    queryFn: () => getOrganization(organisationId),
    enabled: !!organisationId,
  });
}

export function useCountries() {
  return useQuery({
    queryKey: organizationKeys.countries(),
    queryFn: () => getCountries(),
  });
}

// Create organization
export function useCreateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: CreateOrganizationRequest) => createOrganization(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}

// Update organization
export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOrganizationRequest }) =>
      updateOrganization(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      queryClient.setQueryData(organizationKeys.detail(data.organisation_id), data);
    },
  });
}

// Update organization status
export function useUpdateOrganizationStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOrganizationStatusRequest }) =>
      updateOrganizationStatus(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      queryClient.setQueryData(organizationKeys.detail(data.organisation_id), data);
    },
  });
}

// All organisations history (super_admin only)
export function useAllOrganisationsHistory(params?: { limit?: number; cursor?: string }) {
  return useQuery({
    queryKey: organizationKeys.allHistory(params),
    queryFn: () => getAllOrganisationsHistory(params),
  });
}

// Single organisation history
export function useOrganisationHistory(
  organisationId: string,
  params?: { limit?: number; cursor?: string },
) {
  return useQuery({
    queryKey: organizationKeys.history(organisationId, params),
    queryFn: () => getOrganisationHistory(organisationId, params),
    enabled: !!organisationId,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Job hooks (async organisation provisioning)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create organisation (async, job-based).
 * Returns job acceptance payload; use SSE stream for progress tracking.
 */
export function useCreateOrganizationAsync() {
  return useMutation({
    mutationFn: (payload: CreateOrganizationRequest) => createOrganizationAsync(payload),
  });
}
