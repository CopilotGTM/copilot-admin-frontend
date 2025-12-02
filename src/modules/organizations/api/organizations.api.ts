import axiosInstance from "@/core/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";
import type {
  OrganizationSummary,
  OrganizationDetail,
  ListOrganizationsResponse,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  UpdateOrganizationStatusRequest,
  DeleteOrganizationResponse,
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
): Promise<OrganizationDetail> {
  const res = await axiosInstance.put<ApiResponse<OrganizationDetail>>(
    `${BASE}/${organisation_id}/status`,
    payload,
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to update status");
  }
  return res.data.data;
}

export async function deleteOrganization(
  organisation_id: string,
): Promise<DeleteOrganizationResponse> {
  const res = await axiosInstance.delete<ApiResponse<DeleteOrganizationResponse>>(
    `${BASE}/${organisation_id}/delete`,
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to delete organization");
  }
  return res.data.data;
}
