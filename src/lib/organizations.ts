import restAxiosInstance from "../core/rest-client/rest-client.axios";

export type ApiStatus = "SUCCESS" | "ERROR";

export interface ApiResponse<T> {
  status: ApiStatus;
  message: string;
  data: T | null;
}

export interface CreateOrganizationRequest {
  organisation_name: string;
  country: string;
  sales_team_size: number;
  company_address: string;
  billing_address: string;
  linked_urls: string[];
  website_urls: string[];
  summary: string;
  logo_url: string;
}

export interface OrganizationSummary {
  organisation_id: string;
  organisation_name: string;
  schema_name: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationListItem {
  organisation_id: string;
  organisation_name: string;
  is_active: boolean;
  country: string;
  sales_team_size: number;
  company_address: string;
  billing_address: string;
  linked_urls: string[];
  website_urls: string[];
  summary: string;
  logo_url: string;
  status: "pending" | "approved" | "rejected" | "suspended" | "deactivated";
  created_at: string;
  updated_at: string;
}

export interface ListOrganizationsResponse {
  organizations: OrganizationListItem[];
  cursor: string | null;
}

export interface UpdateOrganizationRequest {
  organisation_name?: string;
  country?: string;
  sales_team_size?: number;
  company_address?: string;
  billing_address?: string;
  linked_urls?: string[];
  website_urls?: string[];
  summary?: string;
  logo_url?: string;
  is_active?: boolean;
}

export type OrganizationDetail = OrganizationListItem;

export interface DeleteOrganizationResponse {
  organisation_id: string;
  organisation_name: string;
  schema_name: string | null;
}

// NOTE: baseURL likely already includes "/admin". Keep BASE without the extra prefix to avoid double "/admin".
const BASE = "/organisations" as const;

export async function createOrganization(
  payload: CreateOrganizationRequest,
): Promise<OrganizationSummary> {
  const res = await restAxiosInstance.post<ApiResponse<OrganizationSummary>>(
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
  const res = await restAxiosInstance.get<ApiResponse<ListOrganizationsResponse>>(
    `${BASE}/list_organisations`,
    { params },
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to fetch organizations");
  }
  return res.data.data;
}

export async function updateOrganization(
  organisation_id: string,
  payload: UpdateOrganizationRequest,
): Promise<OrganizationDetail> {
  const res = await restAxiosInstance.put<ApiResponse<OrganizationDetail>>(
    `${BASE}/${organisation_id}/update`,
    payload,
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to update organization");
  }
  return res.data.data;
}

export async function deleteOrganization(
  organisation_id: string,
): Promise<DeleteOrganizationResponse> {
  const res = await restAxiosInstance.delete<ApiResponse<DeleteOrganizationResponse>>(
    `${BASE}/${organisation_id}/delete`,
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to delete organization");
  }
  return res.data.data;
}

// --- Update Organization Status ---
export type UpdatableOrgStatus = "approved" | "rejected" | "suspended";

export interface UpdateOrganizationStatusRequest {
  status: UpdatableOrgStatus;
  note?: string;
}

// --- Get Organization by ID ---
export async function getOrganization(
  organisation_id: string,
): Promise<OrganizationDetail> {
  const res = await restAxiosInstance.get<ApiResponse<OrganizationDetail>>(
    `${BASE}/${organisation_id}`,
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to fetch organization");
  }
  return res.data.data;
}

export async function updateOrganizationStatus(
  organisation_id: string,
  payload: UpdateOrganizationStatusRequest,
): Promise<OrganizationDetail> {
  const res = await restAxiosInstance.put<ApiResponse<OrganizationDetail>>(
    `${BASE}/${organisation_id}/status`,
    payload,
  );
  if (res.data.status !== "SUCCESS" || !res.data.data) {
    throw new Error(res.data.message || "Failed to update status");
  }
  return res.data.data;
}
