"use client";

import React from "react";
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
import type { AdminUserStatus, SupabaseUserStatus, UserListItem } from "@/modules/users/types";

export interface ViewUserDialogProps {
  trigger: React.ReactNode;
  user: UserListItem;
}

const supabaseStatusVariant: Record<SupabaseUserStatus, BadgeVariant> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  PASSWORD_CHANGE_REQUIRED: "warning",
};

const adminStatusVariant: Record<AdminUserStatus, BadgeVariant> = {
  pending: "warning",
  approved: "success",
  rejected: "risk",
  suspended: "warning",
  deactivated: "secondary",
};

function DetailItem({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border-emphasized bg-surface-secondary px-3 py-2.5 shadow-xs">
      <span className="text-xs font-semibold uppercase text-fg-muted">{label}</span>
      <span className="text-sm font-medium text-fg-primary">{value || "-"}</span>
    </div>
  );
}

export default function ViewUserDialog({ trigger, user }: Readonly<ViewUserDialogProps>) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="px-6 py-5">
          <DialogTitle>User details</DialogTitle>
          <DialogDescription>Review identity, role, and access status for this user.</DialogDescription>
        </DialogHeader>
        <Separator />

        <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
          <DetailItem label="Name" value={`${user.first_name} ${user.last_name}`} />
          <DetailItem label="Email" value={user.email} />
          <DetailItem label="Role" value={user.organisation_role} />
          <DetailItem label="Job title" value={user.job_title} />
          <div className="md:col-span-2">
            <div className="flex flex-col gap-2 rounded-md border border-border-emphasized bg-surface-secondary px-3 py-2.5 shadow-xs">
              <span className="text-xs font-semibold uppercase text-fg-muted">Status</span>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={supabaseStatusVariant[user.status]} className="capitalize">{user.status}</Badge>
                <Badge variant={adminStatusVariant[user.admin_status]} className="capitalize">{user.admin_status}</Badge>
              </div>
            </div>
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
