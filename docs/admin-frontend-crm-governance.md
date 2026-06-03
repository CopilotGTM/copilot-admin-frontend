# Admin Frontend CRM Governance

## Backend Contract

The admin frontend edits organisation app governance through:

```http
PATCH /organisations/{organisation_id}/app-settings
```

Request payload:

```json
{
  "crm": {
    "provider": "copilotgtm"
  },
  "channels": {
    "enabled": ["slack", "whatsapp", "teams", "google_chat"]
  },
  "integrations": {
    "google": {
      "gmail_read_enabled": false
    }
  }
}
```

The backend returns normalized organisation preferences on organisation list/detail responses. Missing preferences mean the organisation uses internal CopilotGTM CRM and all internal CRM write scopes are allowed.

CRM provider changes are only allowed before the organisation has any deals. After any deal exists, the backend rejects changing `crm.provider` from one CRM source to another. Messaging channel changes remain allowed.

Canonical CRM response shape:

```json
{
  "crm": {
    "mode": "internal",
    "provider": "copilotgtm",
    "write_policy": {
      "allowed_scopes": ["backend-owned-scope"]
    }
  }
}
```

Do not send or read `internal_writes_enabled` or `write_policy.internal_records`. Those fields are redundant and are not part of the final contract.

## Frontend File Map

- `src/modules/organizations/types/organization.types.ts`
  - Owns TypeScript types for `OrganisationPreferences`, `OrganisationAppSettings`, CRM providers, channels, Google integration settings, and write scopes.
- `src/modules/organizations/lib/app-settings-policy.ts`
  - Normalizes backend preferences.
  - Applies only UI-safe defaults for missing provider/channel values.
  - Preserves backend-provided `write_policy.allowed_scopes` and `capabilities` as response data.
- `src/modules/organizations/api/organizations.api.ts`
  - Sends the narrow update payload to the backend app-settings endpoint.
- `src/modules/organizations/components/organization-app-settings.tsx`
  - Renders the CRM provider selector, messaging channel controls, Google OAuth permission controls, and current policy summary.
- `src/app/(root)/organizations/[id]/page.tsx`
  - Renders the organisation Users and Settings tabs and delegates settings UI to the organizations module.
- `tests/unit/organizations/app-settings-policy.test.ts`
  - Covers default preferences, legacy key normalization, external CRM behavior, and explicit scope preservation.

## UI Behavior

- CopilotGTM CRM:
  - `mode` is `internal`.
  - `write_policy.allowed_scopes` is displayed only when the backend sends it.
  - The Settings panel shows internal writes as enabled when at least one write scope is allowed.
- HubSpot or Salesforce:
  - `mode` is `external`.
  - `write_policy.allowed_scopes` is empty.
  - The Settings panel shows internal writes as disabled.
- Channels:
  - Missing channel preferences mean all supported channels are enabled.
  - The admin UI persists only `channels.enabled`.
- Google:
  - Missing Google preferences mean Gmail read access is disabled.
  - The admin UI persists only `integrations.google.gmail_read_enabled`.
  - `gmail_read_enabled` controls the Gmail read OAuth scope only; Gmail send remains a separate backend scope decision.

## Future Scope Controls

The current admin UI intentionally does not expose per-scope write toggles and does not define the CRM scope taxonomy. If the product later needs to disable specific actions, add a backend-provided scope catalog first; do not duplicate backend scopes in the frontend.
