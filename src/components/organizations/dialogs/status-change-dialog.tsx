"use client";

import React, { useState } from "react";
import { AlertTriangle, Ban, CheckCircle2, PauseCircle, PlayCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toaster } from "@/components/ui/toaster";
import type { OrganizationListItem, OrganizationStatus } from "@/modules/organizations/types";
import { useUpdateOrganizationStatus } from "@/modules/organizations/hooks";

type StatusAction = "approve" | "reject" | "suspend" | "reinstate" | "deactivate";

interface ActionConfig {
  targetStatus: OrganizationStatus;
  label: string;
  description: string;
  icon: React.ElementType;
  confirmText: string;
  pastTense: string;
  destructive?: boolean;
}

const ACTION_CONFIG: Record<StatusAction, ActionConfig> = {
  approve: {
    targetStatus: "approved",
    label: "Approve Organization",
    description: "This organization will be activated and users can access it.",
    icon: CheckCircle2,
    confirmText: "Approve",
    pastTense: "approved",
  },
  reject: {
    targetStatus: "rejected",
    label: "Reject Organization",
    description: "This organization will be rejected and cannot be used. This action is final.",
    icon: XCircle,
    confirmText: "Reject",
    pastTense: "rejected",
    destructive: true,
  },
  suspend: {
    targetStatus: "suspended",
    label: "Suspend Organization",
    description: "This organization will be temporarily suspended. Users will lose access until reinstated.",
    icon: PauseCircle,
    confirmText: "Suspend",
    pastTense: "suspended",
  },
  reinstate: {
    targetStatus: "approved",
    label: "Reinstate Organization",
    description: "This organization will be reinstated and users will regain access.",
    icon: PlayCircle,
    confirmText: "Reinstate",
    pastTense: "reinstated",
  },
  deactivate: {
    targetStatus: "deactivated",
    label: "Deactivate Organization",
    description: "This organization will be permanently deactivated. This action cannot be undone.",
    icon: Ban,
    confirmText: "Deactivate",
    pastTense: "deactivated",
    destructive: true,
  },
};

function getValidActions(status: OrganizationStatus): StatusAction[] {
  switch (status) {
    case "pending":
      return ["approve", "reject"];
    case "approved":
      return ["suspend", "deactivate"];
    case "suspended":
      return ["reinstate", "deactivate"];
    case "provisioning":
    case "rejected":
    case "deactivated":
    case "failed":
    default:
      return [];
  }
}

export interface StatusChangeDialogProps {
  org: OrganizationListItem;
  action: StatusAction;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function StatusChangeDialog({ org, action, isOpen, onClose, onSuccess }: Readonly<StatusChangeDialogProps>) {
  const [note, setNote] = useState("");
  const updateStatusMutation = useUpdateOrganizationStatus();
  const config = ACTION_CONFIG[action];
  const Icon = config.icon;

  const closeDialog = () => {
    onClose();
    setNote("");
  };

  const handleConfirm = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: org.organisation_id,
        payload: {
          status: config.targetStatus,
          note: note.trim() || undefined,
        },
      });

      toaster.create({
        title: `Organization ${config.pastTense}`,
        description: `${org.organisation_name} has been ${config.confirmText.toLowerCase()}d successfully.`,
        type: "success",
        duration: 3000,
      });

      closeDialog();
      onSuccess?.();
    } catch (err) {
      toaster.create({
        title: "Action failed",
        description: err instanceof Error ? err.message : "An error occurred",
        type: "error",
        duration: 5000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        <DialogHeader className="px-6 py-5">
          <div className="flex items-start gap-3">
            <div className={config.destructive ? "grid size-10 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive" : "grid size-10 shrink-0 place-items-center rounded-full bg-brand-subtle text-brand-primary"}>
              <Icon />
            </div>
            <div className="min-w-0">
              <DialogTitle>{config.label}</DialogTitle>
              <DialogDescription className="mt-1 truncate">{org.organisation_name}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Separator />

        <div className="flex flex-col gap-4 px-6 py-5">
          {config.destructive ? (
            <Alert variant="destructive">
              <AlertTriangle data-icon="inline-start" />
              <AlertDescription>This action cannot be undone.</AlertDescription>
            </Alert>
          ) : null}

          <p className="text-sm text-fg-secondary">{config.description}</p>

          <label className="flex flex-col gap-2 text-sm font-medium text-fg-secondary">
            Note (optional)
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add a note for the audit trail..."
              rows={3}
            />
            <span className="text-xs font-normal text-fg-muted">This note will be recorded in the organization&apos;s history.</span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog} disabled={updateStatusMutation.isPending}>
            Cancel
          </Button>
          <Button variant={config.destructive ? "destructive" : "default"} onClick={handleConfirm} disabled={updateStatusMutation.isPending}>
            {updateStatusMutation.isPending ? <Spinner data-icon="inline-start" size="sm" /> : null}
            {config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { getValidActions, type StatusAction };