import type {
  OrganisationAppSettings,
  OrganisationCapabilities,
  OrganisationChannelSource,
  OrganisationCrmProvider,
  OrganisationCrmSettings,
  OrganisationPreferences,
} from "../types/organization.types";

export const CRM_PROVIDER_OPTIONS: {
  value: OrganisationCrmProvider;
  label: string;
  description: string;
}[] = [
  {
    value: "copilotgtm",
    label: "CopilotGTM CRM",
    description: "CopilotGTM owns internal CRM records and keeps create/edit actions available.",
  },
  {
    value: "hubspot",
    label: "HubSpot",
    description: "HubSpot owns CRM records. Internal CRM create/edit actions stay unavailable.",
  },
  {
    value: "salesforce",
    label: "Salesforce",
    description: "Salesforce owns CRM records. Internal CRM create/edit actions stay unavailable.",
  },
];

export const CHANNEL_OPTIONS: {
  value: OrganisationChannelSource;
  label: string;
  description: string;
}[] = [
  { value: "slack", label: "Slack", description: "Expose Slack integration surfaces." },
  { value: "whatsapp", label: "WhatsApp", description: "Expose WhatsApp integration surfaces." },
  { value: "teams", label: "Microsoft Teams", description: "Expose Teams integration surfaces." },
  { value: "google_chat", label: "Google Chat", description: "Expose Google Chat integration surfaces." },
];

const INTERNAL_CRM_PROVIDER: OrganisationCrmProvider = "copilotgtm";

type PartialAppSettingsInput = Omit<Partial<OrganisationAppSettings>, "crm" | "channels"> & {
  crm?: Partial<OrganisationCrmSettings>;
  channels?: {
    enabled?: readonly OrganisationChannelSource[];
  };
};

export const DEFAULT_CHANNEL_SOURCES = CHANNEL_OPTIONS.map((option) => option.value);

export function getCrmProviderLabel(provider: OrganisationCrmProvider): string {
  return CRM_PROVIDER_OPTIONS.find((option) => option.value === provider)?.label ?? provider;
}

export function deriveCrmSettings(
  provider: OrganisationCrmProvider,
  allowedScopes?: readonly string[],
): OrganisationCrmSettings {
  const internalRecords = provider === INTERNAL_CRM_PROVIDER;

  return {
    provider,
    mode: internalRecords ? "internal" : "external",
    write_policy: {
      allowed_scopes: internalRecords ? normalizeWriteScopes(allowedScopes) : [],
    },
  };
}

export function normalizePreferences(preferences: OrganisationPreferences | undefined): OrganisationAppSettings {
  const rawProvider = preferences?.crm?.provider ?? preferences?.crm?.source;
  const provider = normalizeCrmProvider(rawProvider);
  const allowedScopes = preferences?.crm?.write_policy?.allowed_scopes;
  const enabledChannels =
    preferences?.channels?.enabled ??
    preferences?.integrations?.enabled_sources ??
    DEFAULT_CHANNEL_SOURCES;

  return normalizeAppSettingsValue({
    crm: deriveCrmSettings(provider, allowedScopes),
    channels: {
      enabled: enabledChannels,
    },
    capabilities: preferences?.capabilities,
  });
}

export function normalizeAppSettingsValue(
  value: PartialAppSettingsInput | null | undefined,
): OrganisationAppSettings {
  const crm = deriveCrmSettings(
    normalizeCrmProvider(value?.crm?.provider),
    value?.crm?.write_policy?.allowed_scopes,
  );
  const channels = {
    enabled: normalizeChannelSources(value?.channels?.enabled ?? DEFAULT_CHANNEL_SOURCES),
  };

  return {
    crm,
    channels,
    capabilities: normalizeCapabilities(value?.capabilities),
  };
}

export function areAppSettingsEqual(
  left: PartialAppSettingsInput | null | undefined,
  right: PartialAppSettingsInput | null | undefined,
): boolean {
  const normalizedLeft = normalizeAppSettingsValue(left);
  const normalizedRight = normalizeAppSettingsValue(right);

  return (
    normalizedLeft.crm.provider === normalizedRight.crm.provider &&
    normalizedLeft.channels.enabled.join("|") === normalizedRight.channels.enabled.join("|")
  );
}

function normalizeCrmProvider(
  provider: OrganisationCrmProvider | "copilot_gtm" | undefined,
): OrganisationCrmProvider {
  const canonicalProvider = provider === "copilot_gtm" ? INTERNAL_CRM_PROVIDER : provider;
  if (canonicalProvider && CRM_PROVIDER_OPTIONS.some((option) => option.value === canonicalProvider)) {
    return canonicalProvider;
  }
  return INTERNAL_CRM_PROVIDER;
}

function normalizeChannelSources(
  sources: readonly OrganisationChannelSource[] | undefined,
): OrganisationChannelSource[] {
  const selected = new Set(sources ?? DEFAULT_CHANNEL_SOURCES);
  return CHANNEL_OPTIONS.map((option) => option.value).filter((source) => selected.has(source));
}

function normalizeWriteScopes(scopes: readonly string[] | undefined): string[] {
  return (scopes ?? []).filter((scope): scope is string => typeof scope === "string");
}

function normalizeCapabilities(capabilities: OrganisationCapabilities | undefined): OrganisationCapabilities {
  return Object.fromEntries(
    Object.entries(capabilities ?? {}).filter((entry): entry is [string, boolean] => typeof entry[1] === "boolean"),
  );
}
