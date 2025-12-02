// Organization types

export type OrganizationStatus = "pending" | "approved" | "rejected" | "suspended" | "deactivated";
export type UpdatableOrgStatus = "approved" | "rejected" | "suspended";

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
  status: OrganizationStatus;
  created_at: string;
  updated_at: string;
}

export type OrganizationDetail = OrganizationListItem;

export interface ListOrganizationsResponse {
  organizations: OrganizationListItem[];
  cursor: string | null;
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

export interface UpdateOrganizationStatusRequest {
  status: UpdatableOrgStatus;
  note?: string;
}

export interface DeleteOrganizationResponse {
  organisation_id: string;
  organisation_name: string;
  schema_name: string | null;
}
