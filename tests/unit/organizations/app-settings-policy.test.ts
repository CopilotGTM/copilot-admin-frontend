import {
  areAppSettingsEqual,
  normalizeAppSettingsValue,
  normalizePreferences,
} from "../../../src/modules/organizations/lib/app-settings-policy";

describe("app settings policy", () => {
  it("normalizes missing preferences to internal CopilotGTM defaults", () => {
    const settings = normalizePreferences(undefined);

    expect(settings.crm.provider).toBe("copilotgtm");
    expect(settings.crm.mode).toBe("internal");
    expect(settings.crm.write_policy.allowed_scopes).toEqual([]);
    expect(settings.capabilities).toEqual({});
    expect(settings.channels.enabled).toEqual(["slack", "whatsapp", "teams", "google_chat"]);
  });

  it("normalizes legacy preference keys", () => {
    const settings = normalizePreferences({
      crm: { source: "copilot_gtm" },
      integrations: { enabled_sources: ["teams", "slack"] },
    });

    expect(settings.crm.provider).toBe("copilotgtm");
    expect(settings.channels.enabled).toEqual(["slack", "teams"]);
  });

  it("defaults Gmail read access to disabled unless explicitly enabled", () => {
    expect(normalizePreferences(undefined).integrations.google.gmail_read_enabled).toBe(false);
    expect(
      normalizePreferences({
        integrations: { google: {} },
      }).integrations.google.gmail_read_enabled,
    ).toBe(false);
    expect(
      normalizePreferences({
        integrations: { google: { gmail_read_enabled: true } },
      }).integrations.google.gmail_read_enabled,
    ).toBe(true);
  });

  it("derives no internal write scopes for external CRM providers", () => {
    const settings = normalizePreferences({
      crm: { provider: "hubspot" },
      channels: { enabled: ["slack"] },
    });

    expect(settings.crm.mode).toBe("external");
    expect(settings.crm.write_policy).toEqual({
      allowed_scopes: [],
    });
    expect(settings.capabilities).toEqual({});
  });

  it("compares settings by canonical provider and channel order", () => {
    const left = normalizeAppSettingsValue({
      crm: { provider: "copilotgtm" },
      channels: { enabled: ["teams", "slack"] },
    });
    const right = normalizeAppSettingsValue({
      crm: { provider: "copilotgtm" },
      channels: { enabled: ["slack", "teams"] },
    });

    expect(left.channels.enabled).toEqual(["slack", "teams"]);
    expect(areAppSettingsEqual(left, right)).toBe(true);
  });

  it("preserves backend-provided write scopes and capabilities without interpreting them", () => {
    const settings = normalizePreferences({
      crm: {
        provider: "copilotgtm",
        write_policy: { allowed_scopes: ["backend-owned:scope"] },
      },
      capabilities: { backend_owned_capability: true },
    });

    expect(settings.crm.write_policy.allowed_scopes).toEqual(["backend-owned:scope"]);
    expect(settings.capabilities).toEqual({ backend_owned_capability: true });
  });
});
