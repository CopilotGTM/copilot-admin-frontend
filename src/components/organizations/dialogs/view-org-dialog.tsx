"use client";

import React from "react";
import { format } from "date-fns";
import { Globe, Image as ImageIcon, Link2 } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
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
import type { OrganizationListItem } from "@/modules/organizations/types";

export interface ViewOrgDialogProps {
  trigger: React.ReactNode;
  org: OrganizationListItem;
}

const statusVariant: Record<OrganizationListItem["status"], BadgeVariant> = {
  pending: "warning",
  approved: "success",
  rejected: "risk",
  suspended: "warning",
  deactivated: "secondary",
  provisioning: "info",
  failed: "risk",
};

function formatDate(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "PPpp");
}

function DetailItem({ label, value, className }: { label: string; value?: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="flex min-h-18 flex-col gap-1 rounded-md border border-border-emphasized bg-surface-secondary px-3 py-2.5 shadow-xs">
        <span className="text-xs font-semibold uppercase text-fg-muted">{label}</span>
        <span className="break-words text-sm font-medium text-fg-primary">{value || "-"}</span>
      </div>
    </div>
  );
}

function BadgeList({ items, variant = "secondary" }: { items?: string[]; variant?: BadgeVariant }) {
  if (!items || items.length === 0) return <span className="text-sm text-fg-secondary">-</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <Badge key={`${item}-${index}`} variant={variant} className="h-auto max-w-full whitespace-normal break-all py-1">
          {item}
        </Badge>
      ))}
    </div>
  );
}

function LinkBadgeList({ items, icon: Icon, variant }: { items?: string[]; icon: React.ElementType; variant: BadgeVariant }) {
  if (!items || items.length === 0) return <span className="text-sm text-fg-secondary">-</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <Badge key={`${item}-${index}`} variant={variant} asChild className="h-auto max-w-full py-1">
          <a href={item} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 items-center gap-1 break-all">
            <Icon data-icon="inline-start" />
            {item}
          </a>
        </Badge>
      ))}
    </div>
  );
}

export default function ViewOrgDialog({ trigger, org }: Readonly<ViewOrgDialogProps>) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85dvh] gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="px-6 py-5">
          <DialogTitle>Organization details</DialogTitle>
          <DialogDescription>View all fields for {org.organisation_name}.</DialogDescription>
        </DialogHeader>
        <Separator />

        <div className="overflow-y-auto px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailItem label="ID" value={org.organisation_id} />
            <DetailItem label="Status" value={<Badge variant={statusVariant[org.status]} className="capitalize">{org.status}</Badge>} />
            <DetailItem label="Organization name" value={org.organisation_name} />
            <DetailItem label="Agent name" value={org.agent_name} />
            <DetailItem label="Country" value={org.country} />
            <DetailItem label="Sales team size" value={org.sales_team_size} />
            <DetailItem label="Active" value={org.is_active ? "Yes" : "No"} />
            <DetailItem label="Company address" value={org.company_address} />

            <DetailItem label="Domains" value={<BadgeList items={org.domain} variant="info" />} className="md:col-span-2" />
            <DetailItem
              label="Linked URLs"
              value={<LinkBadgeList items={org.linked_urls} icon={Link2} variant="primary-subtle" />}
              className="md:col-span-2"
            />
            <DetailItem
              label="Website URLs"
              value={<LinkBadgeList items={org.website_urls} icon={Globe} variant="secondary" />}
              className="md:col-span-2"
            />
            <DetailItem label="Summary" value={<span className="whitespace-pre-wrap">{org.summary || "-"}</span>} className="md:col-span-2" />

            <div className="md:col-span-2">
              <div className="flex flex-col gap-2 rounded-md border border-border-emphasized bg-surface-secondary px-3 py-2.5 shadow-xs">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-fg-muted">
                  <ImageIcon /> Logo
                </span>
                {org.logo_url ? (
                  <div className="w-fit rounded-lg border border-border bg-surface-primary p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Organization logos are arbitrary external admin data. */}
                    <img src={org.logo_url} alt="Organization logo" className="h-auto max-h-28 max-w-52 object-contain" />
                  </div>
                ) : (
                  <span className="text-sm text-fg-secondary">-</span>
                )}
              </div>
            </div>

            <DetailItem label="Created at" value={formatDate(org.created_at)} />
            <DetailItem label="Updated at" value={formatDate(org.updated_at)} />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
