/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import type { OrganizationDetail, OrganizationListItem, UpdateOrganizationRequest } from "@/modules/organizations/types";
import { createOrganizationSchema, type CreateOrganizationInput } from "@/modules/organizations/schemas";
import { useCountries } from "@/modules/organizations/hooks";
import { OrganizationFormFields } from "./organization-form-fields";

export interface EditOrgDialogProps {
  trigger: React.ReactNode;
  org: OrganizationListItem;
  onUpdate: (organisation_id: string, payload: UpdateOrganizationRequest) => Promise<OrganizationDetail>;
}

function buildInitialValues(org: OrganizationListItem): CreateOrganizationInput {
  return {
    organisation_name: org.organisation_name ?? "",
    agent_name: org.agent_name ?? "",
    domain: org.domain ?? [],
    country: org.country ?? "",
    sales_team_size: org.sales_team_size ?? 0,
    company_address: org.company_address ?? "",
    linked_urls: org.linked_urls ?? [],
    website_urls: org.website_urls ?? [],
    summary: org.summary ?? "",
    logo_url: org.logo_url ?? "",
  };
}

export default function EditOrgDialog({ trigger, org, onUpdate }: Readonly<EditOrgDialogProps>) {
  const { data: countriesData } = useCountries();
  const original = React.useRef<CreateOrganizationInput>(buildInitialValues(org));

  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    mode: "onChange",
    defaultValues: original.current,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = form;

  function buildChangedPayload(values: CreateOrganizationInput): UpdateOrganizationRequest {
    const changed: UpdateOrganizationRequest = {};
    const keys = Object.keys(original.current) as (keyof CreateOrganizationInput)[];

    for (const key of keys) {
      const prevVal = original.current[key] as unknown;
      const currVal = values[key] as unknown;
      const equal = Array.isArray(prevVal) || Array.isArray(currVal)
        ? JSON.stringify(prevVal) === JSON.stringify(currVal)
        : prevVal === currVal;

      if (!equal) {
        if (key === "sales_team_size") {
          (changed as any)[key] = Number(currVal as number);
        } else {
          (changed as any)[key] = currVal as any;
        }
      }
    }

    return changed;
  }

  const onSubmit = async (data: CreateOrganizationInput) => {
    const payload = buildChangedPayload(data);
    const result = await onUpdate(org.organisation_id, payload);

    original.current = {
      organisation_name: result.organisation_name ?? data.organisation_name,
      agent_name: result.agent_name ?? data.agent_name ?? "",
      domain: result.domain ?? data.domain ?? [],
      country: result.country ?? data.country,
      sales_team_size: result.sales_team_size ?? data.sales_team_size,
      company_address: result.company_address ?? data.company_address,
      linked_urls: result.linked_urls ?? data.linked_urls,
      website_urls: result.website_urls ?? data.website_urls,
      summary: result.summary ?? data.summary,
      logo_url: result.logo_url ?? data.logo_url,
    };
    reset(original.current);
    return result;
  };

  const formId = `edit-org-form-${org.organisation_id}`;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85dvh] gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="px-6 py-5">
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogDescription>Update the organization details and save changes.</DialogDescription>
        </DialogHeader>
        <Separator />

        <div className="overflow-y-auto px-6 py-5">
          <form id={formId} onSubmit={handleSubmit(onSubmit)}>
            <OrganizationFormFields form={form} countries={countriesData?.countries} />
          </form>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form={formId} disabled={!isValid || isSubmitting}>
            {isSubmitting ? <Spinner data-icon="inline-start" size="sm" /> : null}
            Update Organization
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}