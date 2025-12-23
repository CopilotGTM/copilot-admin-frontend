import axiosInstance from "@/core/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";
import type {
  OrganizationSummary,
  OrganizationDetail,
  ListOrganizationsResponse,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  UpdateOrganizationStatusRequest,
  OrganisationHistoryResponse,
  UpdateStatusResponse,
  CountriesResponse,
  CreateOrganisationJobAccepted,
} from "../types/organization.types";

const BASE = "/organisations" as const;

export async function createOrganization(
  payload: CreateOrganizationRequest,
): Promise<OrganizationSummary> {
  const res = await axiosInstance.post<ApiResponse<OrganizationSummary>>(
    `${BASE}/create_organisation`,
    payload,
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to create organization");
  }
  return res.data.data;
}

export async function listOrganizations(params: {
  limit?: number;
  cursor?: string;
} = {}): Promise<ListOrganizationsResponse> {
  const res = await axiosInstance.get<ApiResponse<ListOrganizationsResponse>>(
    `${BASE}/list_organisations`,
    { params },
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to fetch organizations");
  }
  return res.data.data;
}

export async function getOrganization(
  organisation_id: string,
): Promise<OrganizationDetail> {
  const res = await axiosInstance.get<ApiResponse<OrganizationDetail>>(
    `${BASE}/${organisation_id}`,
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to fetch organization");
  }
  return res.data.data;
}

export async function updateOrganization(
  organisation_id: string,
  payload: UpdateOrganizationRequest,
): Promise<OrganizationDetail> {
  const res = await axiosInstance.put<ApiResponse<OrganizationDetail>>(
    `${BASE}/${organisation_id}/update`,
    payload,
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to update organization");
  }
  return res.data.data;
}

export async function updateOrganizationStatus(
  organisation_id: string,
  payload: UpdateOrganizationStatusRequest,
): Promise<UpdateStatusResponse> {
  const res = await axiosInstance.put<ApiResponse<UpdateStatusResponse>>(
    `${BASE}/${organisation_id}/status`,
    payload,
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to update status");
  }
  return res.data.data;
}

// History endpoints
export async function getAllOrganisationsHistory(params: {
  limit?: number;
  cursor?: string;
} = {}): Promise<OrganisationHistoryResponse> {
  const res = await axiosInstance.get<ApiResponse<OrganisationHistoryResponse>>(
    `${BASE}/all_organisations_history`,
    { params },
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to fetch history");
  }
  return res.data.data;
}

export async function getOrganisationHistory(
  organisation_id: string,
  params: { limit?: number; cursor?: string } = {},
): Promise<OrganisationHistoryResponse> {
  const res = await axiosInstance.get<ApiResponse<OrganisationHistoryResponse>>(
    `${BASE}/${organisation_id}/history`,
    { params },
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to fetch organization history");
  }
  return res.data.data;
}

export async function getCountries(): Promise<CountriesResponse> {
  const res = await axiosInstance.get<ApiResponse<CountriesResponse>>(
    `${BASE}/countries`,
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to fetch countries");
  }
  return res.data.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Job endpoints (async organisation provisioning)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create organisation (async, job-based).
 * Returns a job acceptance payload; use SSE stream for progress tracking.
 */
export async function createOrganizationAsync(
  payload: CreateOrganizationRequest,
): Promise<CreateOrganisationJobAccepted> {
  const res = await axiosInstance.post<ApiResponse<CreateOrganisationJobAccepted>>(
    `${BASE}/create_organisation`,
    payload,
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to create organization");
  }
  return res.data.data;
}
