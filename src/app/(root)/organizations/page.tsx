"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Ban,
  CheckCircle2,
  Eye,
  MoreVertical,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  SearchX,
  XCircle,
} from "lucide-react";
import { AdminPageShell, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Column, CustomTable } from "@/components/ui/custom-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import { CreateOrgDialog } from "@/components/organizations/dialogs/create-org-dialog";
import EditOrgDialog from "@/components/organizations/dialogs/edit-org-dialog";
import { StatusChangeDialog, getValidActions, type StatusAction } from "@/components/organizations/dialogs/status-change-dialog";
import ViewOrgDialog from "@/components/organizations/dialogs/view-org-dialog";
import useAuthStore from "@/modules/auth/store/auth.store";
import {
  listOrganizations,
  streamJobStatus,
  updateOrganization,
  type JobStreamController,
} from "@/modules/organizations/api";
import { useOrganisationHistory } from "@/modules/organizations/hooks";
import type {
  JobStatusEvent,
  OrganizationDetail,
  OrganizationListItem,
  UpdateOrganizationRequest,
} from "@/modules/organizations/types";
import { formatDateShort } from "@/lib/utils/format-date";

const PAGE_SIZE = 20;

type OrgRow = OrganizationListItem & { id: string };

const ACTION_LABELS: Record<StatusAction, { icon: React.ElementType; label: string; variant?: "default" | "destructive" }> = {
  approve: { icon: CheckCircle2, label: "Approve" },
  reject: { icon: XCircle, label: "Reject", variant: "destructive" },
  suspend: { icon: PauseCircle, label: "Suspend" },
  reinstate: { icon: PlayCircle, label: "Reinstate" },
  deactivate: { icon: Ban, label: "Deactivate", variant: "destructive" },
};

const statusVariant: Record<OrgRow["status"], BadgeVariant> = {
  pending: "warning",
  approved: "success",
  rejected: "risk",
  suspended: "warning",
  deactivated: "secondary",
  provisioning: "info",
  failed: "risk",
};

const historyActionVariant: Partial<Record<string, BadgeVariant>> = {
  created: "info",
  approved: "success",
  rejected: "risk",
  suspended: "warning",
  reinstated: "success",
  status_changed: "primary-subtle",
  field_changed: "secondary",
  user_added: "info",
  user_removed: "warning",
  role_changed: "primary-subtle",
  note_added: "secondary",
  system_migration: "info",
  deleted: "risk",
};

function ActionsCell({
  org,
  onUpdate,
  onStatusChange,
}: {
  org: OrgRow;
  onUpdate: (id: string, payload: UpdateOrganizationRequest) => Promise<OrganizationDetail>;
  onStatusChange: () => void;
}) {
  const router = useRouter();
  const [selectedAction, setSelectedAction] = useState<StatusAction | null>(null);
  const validActions = getValidActions(org.status);

  return (
    <>
      <div className="flex items-center gap-1">
        <ViewOrgDialog
          org={org}
          trigger={
            <Button variant="ghost" size="icon-sm" aria-label="View" title="View" onClick={(event) => event.stopPropagation()}>
              <Eye />
            </Button>
          }
        />
        <EditOrgDialog
          org={org}
          onUpdate={onUpdate}
          trigger={
            <Button variant="ghost" size="icon-sm" aria-label="Edit" title="Edit" onClick={(event) => event.stopPropagation()}>
              <Pencil />
            </Button>
          }
        />

        {validActions.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="More actions" title="More actions" onClick={(event) => event.stopPropagation()}>
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                {validActions.map((action) => {
                  const config = ACTION_LABELS[action];
                  const Icon = config.icon;
                  return (
                    <DropdownMenuItem
                      key={action}
                      variant={config.variant}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedAction(action);
                      }}
                    >
                      <Icon />
                      {config.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  router.push(`/organizations/${org.organisation_id}`);
                }}
              >
                View details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      {selectedAction ? (
        <StatusChangeDialog
          org={org}
          action={selectedAction}
          isOpen={!!selectedAction}
          onClose={() => setSelectedAction(null)}
          onSuccess={() => {
            setSelectedAction(null);
            onStatusChange();
          }}
        />
      ) : null}
    </>
  );
}

function TableLoadingState() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Skeleton className="h-10 rounded-md" />
      <div className="rounded-lg border border-border bg-surface-primary p-4 shadow-xs">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3">
              <Skeleton className="h-6 rounded-md" />
              <Skeleton className="h-6 rounded-md" />
              <Skeleton className="h-6 rounded-md" />
              <Skeleton className="h-6 rounded-md" />
              <Skeleton className="h-6 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OrganizationsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [liveJobProgress, setLiveJobProgress] = useState<Map<string, JobStatusEvent>>(new Map());
  const jobStreamsRef = useRef<Map<string, JobStreamController>>(new Map());

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["organizations", { limit: PAGE_SIZE, cursor }],
    queryFn: () => listOrganizations({ limit: PAGE_SIZE, cursor: cursor ?? undefined }),
  });

  const updateOrgMutation = useMutation<OrganizationDetail, Error, { id: string; payload: UpdateOrganizationRequest }>({
    mutationFn: ({ id, payload }) => updateOrganization(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const rows: OrgRow[] = useMemo(
    () => (data?.organizations || []).map((organization) => ({ ...organization, id: organization.organisation_id })),
    [data],
  );

  useEffect(() => {
    if (rows.length === 0) {
      setSelectedOrgId(null);
      return;
    }
    if (!selectedOrgId || !rows.some((row) => row.organisation_id === selectedOrgId)) {
      setSelectedOrgId(rows[0].organisation_id);
    }
  }, [rows, selectedOrgId]);

  const selectedOrg = useMemo(
    () => rows.find((row) => row.organisation_id === selectedOrgId) ?? null,
    [rows, selectedOrgId],
  );

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
  } = useOrganisationHistory(selectedOrgId ?? "", { limit: 20 });

  const activeJobIds = useMemo(
    () =>
      rows
        .filter((row) => row.active_job && (row.active_job.status === "pending" || row.active_job.status === "in_progress"))
        .map((row) => row.active_job!.job_id),
    [rows],
  );

  useEffect(() => {
    const currentStreams = jobStreamsRef.current;
    const newJobIds = new Set(activeJobIds);

    for (const [jobId, controller] of currentStreams.entries()) {
      if (!newJobIds.has(jobId)) {
        controller.abort();
        currentStreams.delete(jobId);
      }
    }

    for (const jobId of activeJobIds) {
      if (currentStreams.has(jobId)) continue;

      const controller = streamJobStatus(
        `/organisations/jobs/${jobId}/stream`,
        () => useAuthStore.getState().access_token,
        {
          onStatus: (event: JobStatusEvent) => {
            setLiveJobProgress((prev) => {
              const next = new Map(prev);
              next.set(jobId, event);
              return next;
            });
          },
          onComplete: () => {
            currentStreams.delete(jobId);
            setLiveJobProgress((prev) => {
              const next = new Map(prev);
              next.delete(jobId);
              return next;
            });
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
          },
          onError: (err) => {
            console.error(`[OrgList] Job stream error for ${jobId}:`, err.message);
            currentStreams.delete(jobId);
          },
        },
        { maxReconnects: 2, reconnectDelay: 2000 },
      );

      currentStreams.set(jobId, controller);
    }

    return () => {
      for (const controller of currentStreams.values()) {
        controller.abort();
      }
      currentStreams.clear();
    };
  }, [activeJobIds, queryClient]);

  const rowsWithLiveProgress: OrgRow[] = useMemo(
    () =>
      rows.map((row) => {
        if (!row.active_job) return row;
        const liveEvent = liveJobProgress.get(row.active_job.job_id);
        if (!liveEvent) return row;
        return {
          ...row,
          active_job: {
            ...row.active_job,
            status: liveEvent.status,
            progress: liveEvent.progress,
            status_message: liveEvent.status_message,
          },
        };
      }),
    [rows, liveJobProgress],
  );

  const columns: Column<OrgRow>[] = [
    {
      header: "Organization",
      key: "organisation_name",
      render: (organization) => (
        <button
          type="button"
          className="font-semibold text-brand-primary hover:text-brand-hover"
          onClick={(event) => {
            event.stopPropagation();
            router.push(`/organizations/${organization.organisation_id}`);
          }}
        >
          {organization.organisation_name}
        </button>
      ),
    },
    { header: "Country", key: "country" },
    { header: "Team Size", key: "sales_team_size", isNumeric: true },
    {
      header: "Status",
      key: "status",
      render: (organization) => {
        const hasActiveJob =
          organization.active_job &&
          (organization.active_job.status === "in_progress" || organization.active_job.status === "pending");
        const progress = organization.active_job?.progress ?? 0;
        const statusMessage = organization.active_job?.status_message ?? "Provisioning...";

        if (!hasActiveJob) {
          return <Badge variant={statusVariant[organization.status]} className="capitalize">{organization.status}</Badge>;
        }

        return (
          <Tooltip content={`${statusMessage} (${progress}%)`} positioning={{ placement: "top" }}>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant[organization.status]} className="capitalize">{organization.status}</Badge>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-signal-info/20 bg-signal-info/10 px-2 py-0.5 text-xs font-semibold text-signal-info">
                <span className="size-1.5 animate-pulse rounded-full bg-signal-info" />
                {progress}%
              </span>
            </div>
          </Tooltip>
        );
      },
    },
    {
      header: "Created",
      key: "created_at",
      render: (organization) => <span className="text-sm text-fg-secondary">{formatDateShort(organization.created_at)}</span>,
    },
    {
      header: "Actions",
      key: "actions" as keyof OrgRow,
      render: (organization) => (
        <ActionsCell
          org={organization}
          onUpdate={(id, payload) => updateOrgMutation.mutateAsync({ id, payload })}
          onStatusChange={() => queryClient.invalidateQueries({ queryKey: ["organizations"] })}
        />
      ),
    },
  ];

  return (
    <div className="w-full">
      <PageHeader
        title="Organizations"
        breadcrumbs={[{ label: "home", href: "/" }, { label: "organizations" }]}
        backOnSubPathOf="organizations"
        actions={
          <CreateOrgDialog
            trigger={
              <Button>
                <Plus data-icon="inline-start" />
                Add New Org
              </Button>
            }
          />
        }
      />

      <AdminPageShell>
        {isLoading ? <TableLoadingState /> : null}

        {isError ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="text-lg font-medium text-destructive">{error?.message || "Failed to load organizations"}</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        ) : null}

        {!isLoading && !isError && rows.length === 0 ? (
          <div className="flex w-full justify-center py-16 text-center">
            <div className="flex w-full max-w-lg flex-col items-center gap-3 rounded-lg border border-border bg-surface-primary p-10 shadow-xs">
              <div className="grid size-16 place-items-center rounded-full bg-brand-subtle text-brand-primary">
                <SearchX />
              </div>
              <p className="text-xl font-semibold text-fg-primary">No organizations found</p>
              <p className="max-w-md text-sm text-fg-secondary">
                Get started by creating your first organization. You can add details like website links and logo.
              </p>
              <CreateOrgDialog
                trigger={
                  <Button className="mt-2">
                    <Plus data-icon="inline-start" />
                    Create a new organization
                  </Button>
                }
              />
            </div>
          </div>
        ) : null}

        {!isLoading && !isError && rows.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div className="flex min-w-0 flex-col gap-6">
              <CustomTable
                data={rowsWithLiveProgress}
                columns={columns}
                pageSize={PAGE_SIZE}
                hidePagination
                selectedRowId={selectedOrgId ?? undefined}
                onRowClick={(row) => setSelectedOrgId(String(row.id))}
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-fg-secondary">
                  Showing {rowsWithLiveProgress.length} organization{rowsWithLiveProgress.length !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const prev = cursorHistory[cursorHistory.length - 1] ?? null;
                      setCursorHistory((history) => history.slice(0, -1));
                      setCursor(prev === "__first__" ? null : prev);
                    }}
                    disabled={cursorHistory.length === 0 || isFetching}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (data?.cursor) {
                        setCursorHistory((history) => [...history, cursor ?? "__first__"]);
                        setCursor(data.cursor);
                      }
                    }}
                    disabled={!data?.cursor || isFetching}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>

            <aside className="overflow-hidden rounded-lg border border-border bg-surface-primary shadow-xs lg:sticky lg:top-4">
              <div className="p-4">
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold text-fg-primary">History</p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm text-fg-secondary">
                      {selectedOrg ? selectedOrg.organisation_name : "Select an organization"}
                    </p>
                    {selectedOrg ? <Badge variant={statusVariant[selectedOrg.status]} className="capitalize">{selectedOrg.status}</Badge> : null}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="p-4">
                {isHistoryLoading ? (
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-16 rounded-md" />)}
                  </div>
                ) : isHistoryError ? (
                  <p className="text-sm text-destructive">{historyError?.message || "Failed to load history"}</p>
                ) : !historyData || historyData.history.length === 0 ? (
                  <p className="text-sm text-fg-secondary">No history available.</p>
                ) : (
                  <div className="flex max-h-[560px] flex-col gap-2 overflow-y-auto pr-1">
                    {historyData.history.map((history) => (
                      <div key={history.id} className="rounded-md border border-border bg-surface-primary p-3">
                        <div className="flex items-center justify-between gap-3">
                          <Badge variant={historyActionVariant[history.action] ?? "secondary"} className="capitalize">
                            {history.action.replaceAll("_", " ")}
                          </Badge>
                          <span className="whitespace-nowrap text-xs text-fg-secondary">{formatDateShort(history.created_at)}</span>
                        </div>
                        <p className="mt-2 text-sm text-fg-primary">{history.note || "-"}</p>
                        {history.actor_admin_name ? <p className="mt-1 text-xs text-fg-secondary">by {history.actor_admin_name}</p> : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        ) : null}
      </AdminPageShell>
    </div>
  );
}