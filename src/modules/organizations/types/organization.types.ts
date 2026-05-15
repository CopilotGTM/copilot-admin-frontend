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
  agent_name?: string;
  domain?: string[];
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
  /** Active provisioning job, if any (present for status=provisioning) */
  active_job?: ActiveJob;
  preferences?: OrganisationPreferences;
}

export type OrganizationDetail = OrganizationListItem;

export type OrganisationCrmProvider = "copilotgtm" | "hubspot" | "salesforce";
export type LegacyOrganisationCrmProvider = "copilot_gtm";
export type OrganisationCrmMode = "internal" | "external";
export type OrganisationChannelSource = "slack" | "whatsapp" | "teams" | "google_chat";

export interface OrganisationCrmSettings {
  provider: OrganisationCrmProvider;
  mode: OrganisationCrmMode;
  write_policy: {
    allowed_scopes: string[];
  };
}

export interface OrganisationChannelSettings {
  enabled: OrganisationChannelSource[];
}

export interface OrganisationAppSettings {
  crm: OrganisationCrmSettings;
  channels: OrganisationChannelSettings;
  capabilities: OrganisationCapabilities;
}

export interface OrganisationCapabilities {
  [key: string]: boolean;
}

export interface OrganisationPreferences {
  crm?: Partial<OrganisationCrmSettings> & {
    source?: OrganisationCrmProvider | LegacyOrganisationCrmProvider;
    writes_enabled?: boolean;
  };
  channels?: Partial<OrganisationChannelSettings>;
  capabilities?: OrganisationCapabilities;
  integrations?: {
    enabled_sources?: OrganisationChannelSource[];
  };
  [key: string]: unknown;
}

export interface UpdateOrganisationAppSettingsRequest {
  crm?: Pick<OrganisationCrmSettings, "provider">;
  channels?: OrganisationChannelSettings;
}

export interface ListOrganizationsResponse {
  organizations: OrganizationListItem[];
  cursor: string | null;
}

export interface CreateOrganizationRequest {
  organisation_name: string;
  agent_name?: string;
  domain?: string[];
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
  agent_name?: string;
  domain?: string[];
  country?: string;
  sales_team_size?: number;
  company_address?: string;
  linked_urls?: string[];
  website_urls?: string[];
  summary?: string;
  logo_url?: string;
  is_active?: boolean;
}

export interface Country {
  code: string;
  name: string;
}

export interface CountriesResponse {
  countries: Country[];
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
  organisation_name?: string;
  organisation_status?: OrganizationStatus;
  action: OrganisationEventType;
  note: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  actor_admin_id: string | null;
  actor_admin_name?: string | null;
  actor_admin_email?: string | null;
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

// ─────────────────────────────────────────────────────────────────────────────
// Job Types (async organisation provisioning)
// ─────────────────────────────────────────────────────────────────────────────

export type OrganisationJobType = "create" | "update" | "delete" | "migrate";

export type OrganisationJobStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";

/** Returned immediately when POST /create_organisation is called */
export interface CreateOrganisationJobAccepted {
  job_id: string;
  job_type: OrganisationJobType;
  status: OrganisationJobStatus;
  message: string;
  stream_url: string;
}

/** Active job info embedded in organization list items (for provisioning orgs) */
export interface ActiveJob {
  job_id: string;
  job_type: OrganisationJobType;
  status: OrganisationJobStatus;
  progress: number;
  status_message: string | null;
  stream_url: string;
  created_at: string;
}

/** SSE status event payload */
export interface JobStatusEvent {
  job_id: string;
  status: OrganisationJobStatus;
  progress: number;
  status_message: string | null;
  result_data: Record<string, unknown> | null;
  error_message: string | null;
  error_code: string | null;
  updated_at: string;
  completed_at?: string | null;
}

/** SSE complete event payload (lightweight terminal signal) */
export interface JobCompleteEvent {
  message: "job_completed" | "job_already_terminal" | string;
}
