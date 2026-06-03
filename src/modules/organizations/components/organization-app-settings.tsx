"use client";

import React, { useState } from "react";
import { Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  areAppSettingsEqual,
  CHANNEL_OPTIONS,
  CRM_PROVIDER_OPTIONS,
  normalizeAppSettingsValue,
  normalizePreferences,
} from "@/modules/organizations/lib/app-settings-policy";
import type {
  OrganisationAppSettings,
  OrganisationChannelSource,
  OrganisationCrmProvider,
  OrganizationDetail,
} from "@/modules/organizations/types";

interface OrganizationAppSettingsProps {
  readonly org: OrganizationDetail;
  readonly isSaving: boolean;
  readonly onSave: (settings: OrganisationAppSettings) => Promise<unknown>;
}

export function OrganizationAppSettings({ org, isSaving, onSave }: OrganizationAppSettingsProps) {
  const [settings, setSettings] = useState<OrganisationAppSettings>(() => normalizePreferences(org.preferences));

  React.useEffect(() => {
    setSettings(normalizePreferences(org.preferences));
  }, [org]);

  const normalizedOrgSettings = normalizePreferences(org.preferences);
  const safeSettings = normalizeAppSettingsValue(settings);
  const selectedCrm =
    CRM_PROVIDER_OPTIONS.find((option) => option.value === safeSettings.crm.provider) ??
    CRM_PROVIDER_OPTIONS[0];
  const internalCrmEnabled = safeSettings.crm.provider === "copilotgtm";
  const internalWritesEnabled = safeSettings.crm.write_policy.allowed_scopes.length > 0;
  const gmailReadEnabled = safeSettings.integrations.google.gmail_read_enabled;
  const hasChanges = !areAppSettingsEqual(safeSettings, normalizedOrgSettings);

  const setCrmProvider = (provider: OrganisationAppSettings["crm"]["provider"]) => {
    setSettings((current) =>
      normalizeAppSettingsValue({
        ...current,
        crm: { ...current.crm, provider },
      }),
    );
  };

  const toggleChannel = (source: OrganisationChannelSource, enabled: boolean) => {
    setSettings((current) => {
      const currentSources = new Set(normalizeAppSettingsValue(current).channels.enabled);
      if (enabled) {
        currentSources.add(source);
      } else {
        currentSources.delete(source);
      }
      return {
        ...normalizeAppSettingsValue(current),
        channels: {
          enabled: CHANNEL_OPTIONS.map((option) => option.value).filter((value) => currentSources.has(value)),
        },
      };
    });
  };

  const setGmailReadEnabled = (enabled: boolean) => {
    setSettings((current) => {
      const normalized = normalizeAppSettingsValue(current);
      return {
        ...normalized,
        integrations: {
          ...normalized.integrations,
          google: {
            ...normalized.integrations.google,
            gmail_read_enabled: enabled,
          },
        },
      };
    });
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-5">
        <Card>
          <CardHeader>
            <CardTitle>CRM Ownership</CardTitle>
            <CardDescription>Organisation-level source of truth for CRM records.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid gap-2">
              <label htmlFor="crm-source" className="text-sm font-medium text-fg-primary">
                CRM source
              </label>
              <Select value={safeSettings.crm.provider} onValueChange={(value) => setCrmProvider(value as OrganisationCrmProvider)}>
                <SelectTrigger id="crm-source" disabled={isSaving}>
                  <SelectValue placeholder="Select CRM" />
                </SelectTrigger>
                <SelectContent>
                  {CRM_PROVIDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-fg-muted">{selectedCrm.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communication Integrations</CardTitle>
            <CardDescription>Only assigned channels appear in the main app integrations area.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {CHANNEL_OPTIONS.map((option) => {
              const checked = safeSettings.channels.enabled.includes(option.value);
              return (
                <div key={option.value} className="flex items-start justify-between gap-3 rounded-md border border-border p-4">
                  <div>
                    <p className="text-sm font-medium text-fg-primary">{option.label}</p>
                    <p className="mt-1 text-sm text-fg-muted">{option.description}</p>
                  </div>
                  <Button
                    type="button"
                    variant={checked ? "secondary" : "outline"}
                    size="sm"
                    disabled={isSaving}
                    onClick={() => toggleChannel(option.value, !checked)}
                  >
                    {checked ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Google OAuth Permissions</CardTitle>
            <CardDescription>Organisation-level Gmail scope controls for Google connection flows.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-3 rounded-md border border-border p-4">
              <div>
                <p className="text-sm font-medium text-fg-primary">Gmail read access</p>
                <p className="mt-1 text-sm text-fg-muted">
                  Request Gmail read permission during Google OAuth for this organisation.
                </p>
              </div>
              <Button
                type="button"
                variant={gmailReadEnabled ? "secondary" : "outline"}
                size="sm"
                disabled={isSaving}
                onClick={() => setGmailReadEnabled(!gmailReadEnabled)}
              >
                {gmailReadEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button disabled={!hasChanges || isSaving} onClick={() => void onSave(safeSettings)}>
              <Save data-icon="inline-start" />
              {isSaving ? "Saving" : "Save settings"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Current Policy</CardTitle>
          <CardDescription>{org.organisation_name}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-fg-muted">CRM</span>
            <Badge variant={internalCrmEnabled ? "success" : "primary-subtle"}>{selectedCrm.label}</Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-fg-muted">Internal writes</span>
            <Badge variant={internalWritesEnabled ? "success" : "warning"}>
              {internalWritesEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-fg-muted">Write scopes</span>
            <Badge variant={internalWritesEnabled ? "secondary" : "warning"}>
              {safeSettings.crm.write_policy.allowed_scopes.length}
            </Badge>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm text-fg-muted">Assigned channels</span>
            <div className="flex flex-wrap justify-end gap-2">
              {safeSettings.channels.enabled.length > 0 ? (
                safeSettings.channels.enabled.map((source) => (
                  <Badge key={source} variant="secondary">
                    {CHANNEL_OPTIONS.find((option) => option.value === source)?.label ?? source}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary">None</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-fg-muted">Gmail read</span>
            <Badge variant={gmailReadEnabled ? "success" : "secondary"}>
              {gmailReadEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
