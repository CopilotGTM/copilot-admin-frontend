# CRM Governance Policy

## Purpose

Organization CRM and integration behavior is controlled from the organization preference payload. The backend sends this payload during login/profile responses so the main app can hide unavailable actions, and the backend also enforces the same policy on write APIs.

## Canonical Preference Shape

```json
{
  "crm": {
    "mode": "internal",
    "provider": "copilotgtm",
    "write_policy": {
      "allowed_scopes": ["backend-owned-scope"]
    }
  },
  "channels": {
    "enabled": ["slack", "whatsapp", "teams", "google_chat"]
  },
  "capabilities": {
    "backend_owned_capability": true
  }
}
```

## Defaults

If an organization has no preference data, the backend normalizes it to:

- CRM provider: `copilotgtm`
- CRM mode: `internal`
- Internal writes: all scopes allowed
- Channels: `slack`, `whatsapp`, `teams`, `google_chat`
- CRM write scopes: all internal CRM write scopes

This protects existing organizations from losing functionality after the preference rollout.

## External CRM Behavior

For HubSpot, the stored policy is:

```json
{
  "crm": {
    "mode": "external",
    "provider": "hubspot",
    "write_policy": {
      "allowed_scopes": []
    }
  }
}
```

Salesforce follows the same external model with `provider: "salesforce"`.

When CRM mode is external, the main app should hide internal create/edit actions for CRM-owned records. The backend also rejects internal CRM write routes because no write scopes are allowed.

CRM provider changes are locked after any deal exists in the organisation. This prevents switching from one CRM source to another after CRM records have been created or synced. Channel settings can still be changed.

## Scope Enforcement

The backend does not use a broad write-enabled flag. Internal CRM write routes check named scopes owned by the backend. The admin frontend must treat `write_policy.allowed_scopes` as opaque response data unless the backend later provides a scope catalog endpoint.

The frontend can use backend-provided `capabilities` for UI decisions, but backend scopes are the real source of enforcement.

## Backward Compatibility

The backend accepts older preference data and normalizes it:

- `crm.source: "copilot_gtm"` becomes `crm.provider: "copilotgtm"`
- `integrations.enabled_sources` becomes `channels.enabled`

New writes should use only the canonical shape.

`internal_writes_enabled` and `write_policy.internal_records` are intentionally not part of the contract. The CRM provider/mode and `write_policy.allowed_scopes` fully describe the same behavior.

## Admin Settings

Admin organization settings control:

- CRM provider: `copilotgtm`, `hubspot`, or `salesforce`
- Channel availability: Slack, WhatsApp, Teams, Google Chat

The current admin UI does not expose per-scope toggles and does not define scope lists. Scope lists are normalized and returned by the backend.

If partial write control is needed later, the next change should add a backend-provided scope catalog and admin controls for `crm.write_policy.allowed_scopes` instead of hardcoding backend scopes in the frontend.
