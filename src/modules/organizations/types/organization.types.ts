// Organization types

export type OrganizationStatus = 
  | "provisioning" 
  | "pending" 
  | "approved" 
  | "rejected" 
  | "suspended" 
  | "deactivated" 
  | "failed";

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
  country?: string;
  sales_team_size?: number;
  company_address?: string;
  linked_urls?: string[];
  website_urls?: string[];
  summary?: string;
  logo_url?: string;
}

export interface UpdateOrganizationRequest {
  organisation_name?: string;
  country?: string;
  sales_team_size?: number;
  company_address?: string;
  linked_urls?: string[];
  website_urls?: string[];
  summary?: string;
  logo_url?: string;
  is_active?: boolean;
}

export interface UpdateOrganizationStatusRequest {
  status: OrganizationStatus;
  note?: string;
}

export interface DeleteOrganizationResponse {
  organisation_id: string;
  organisation_name: string;
  schema_name: string | null;
}

// History types
export type OrganisationEventType =
  | "created"
  | "approved"
  | "rejected"
  | "suspended"
  | "reinstated"
  | "status_changed"
  | "field_changed"
  | "user_added"
  | "user_removed"
  | "role_changed"
  | "note_added"
  | "system_migration"
  | "deleted";

export interface OrganisationHistoryItem {
  id: string;
  organisation_id: string;
  action: OrganisationEventType;
  note: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  actor_admin_id: string | null;
}

export interface OrganisationHistoryResponse {
  history: OrganisationHistoryItem[];
  cursor: string | null;
}

export interface UpdateStatusResponse {
  organisation_id: string;
  status: OrganizationStatus;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
}
