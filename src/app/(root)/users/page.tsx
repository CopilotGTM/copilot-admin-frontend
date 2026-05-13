"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, MoreVertical, Pencil, Plus, SearchX } from "lucide-react";
import { AdminPageShell, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Column, CustomTable } from "@/components/ui/custom-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import ViewUserDialog from "@/components/organizations/dialogs/view-user-dialog";
import EditUserDialog from "@/components/organizations/dialogs/edit-user-dialog";
import { CreateUserDialog } from "@/modules/users/components/dialogs";
import { listOrganizations } from "@/modules/organizations/api";
import type { OrganizationListItem } from "@/modules/organizations/types";
import { updateUserAdminStatus, updateUserDetails } from "@/modules/users/api";
import { useUserActionHistory, useUsers } from "@/modules/users/hooks";
import type { AdminUserStatus, UpdateUserDetailsRequest, UserEventType, UserListItem } from "@/modules/users/types";
import { toaster } from "@/components/ui/toaster";
import { formatDateShort } from "@/lib/utils/format-date";

const PAGE_SIZE = 20;

type UserRow = UserListItem & { id: string };
type UserStatusAction = "approve" | "reject" | "suspend" | "reinstate" | "deactivate";

const USER_STATUS_ACTION_LABELS: Record<
  UserStatusAction,
  { label: string; nextStatus: AdminUserStatus; variant?: "default" | "destructive" }
> = {
  approve: { label: "Approve", nextStatus: "approved" },
  reject: { label: "Reject", nextStatus: "rejected", variant: "destructive" },
  suspend: { label: "Suspend", nextStatus: "suspended" },
  reinstate: { label: "Reinstate", nextStatus: "approved" },
  deactivate: { label: "Deactivate", nextStatus: "deactivated", variant: "destructive" },
};

const userStatusVariant: Record<AdminUserStatus, BadgeVariant> = {
  pending: "warning",
  approved: "success",
  rejected: "risk",
  suspended: "warning",
  deactivated: "secondary",
};

const accountStatusVariant: Record<string, BadgeVariant> = {
  active: "success",
  inactive: "secondary",
  pending: "warning",
  suspended: "warning",
  deleted: "risk",
};

const historyActionVariant: Partial<Record<UserEventType, BadgeVariant>> = {
  created: "info",
  updated: "secondary",
  status_changed: "primary-subtle",
  role_changed: "primary-subtle",
  deleted: "risk",
  login: "success",
  password_reset: "warning",
  email_verified: "success",
  field_changed: "secondary",
};

function getValidUserActions(adminStatus: AdminUserStatus): UserStatusAction[] {
  switch (adminStatus) {
    case "pending":
      return ["approve", "reject"];
    case "approved":
      return ["suspend", "deactivate"];
    case "suspended":
      return ["reinstate", "deactivate"];
    case "rejected":
    case "deactivated":
      return [];
    default:
      return [];
  }
}

function TableLoadingState() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Skeleton className="h-10 rounded-md" />
      <div className="rounded-lg border border-border bg-surface-primary p-4 shadow-xs">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[2fr_2fr_2fr_1fr_1fr] gap-3">
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

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [organisationFilterId, setOrganisationFilterId] = useState<string | undefined>(undefined);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: orgData, isLoading: isOrgsLoading } = useQuery({
    queryKey: ["organizations", { limit: 100 }],
    queryFn: () => listOrganizations({ limit: 100 }),
  });

  const organisationsWithAll: OrganizationListItem[] = useMemo(() => {
    const items = orgData?.organizations ?? [];
    return [
      {
        organisation_id: "__all__",
        organisation_name: "All organisations",
        schema_name: "",
        created_at: "",
        updated_at: "",
        agent_name: "",
        domain: [],
        is_active: true,
        country: "",
        sales_team_size: 0,
        company_address: "",
        linked_urls: [],
        website_urls: [],
        summary: "",
        logo_url: "",
        status: "approved",
      },
      ...items,
    ];
  }, [orgData?.organizations]);

  const orgNameById = useMemo(() => {
    const map = new Map<string, string>();
    (orgData?.organizations ?? []).forEach((organization) => map.set(organization.organisation_id, organization.organisation_name));
    return map;
  }, [orgData?.organizations]);

  useEffect(() => {
    setCursor(null);
    setCursorHistory([]);
  }, [organisationFilterId]);

  const { data, isLoading, isError, error, refetch, isFetching } = useUsers({
    limit: PAGE_SIZE,
    cursor: cursor ?? undefined,
    organisation_id: organisationFilterId,
  });

  const rows: UserRow[] = useMemo(() => (data?.users ?? []).map((user) => ({ ...user, id: user.user_id })), [data?.users]);

  useEffect(() => {
    if (rows.length === 0) {
      setSelectedUserId(null);
      return;
    }
    if (!selectedUserId || !rows.some((row) => row.user_id === selectedUserId)) {
      setSelectedUserId(rows[0].user_id);
    }
  }, [rows, selectedUserId]);

  const selectedUser = useMemo(() => rows.find((row) => row.user_id === selectedUserId) ?? null, [rows, selectedUserId]);

  const updateUserDetailsMutation = useMutation<void, Error, { user_id: string; payload: UpdateUserDetailsRequest }>({
    mutationFn: async ({ user_id, payload }) => {
      await updateUserDetails(user_id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toaster.create({ title: "User updated", type: "success" });
    },
    onError: (err) => {
      toaster.create({ title: "Failed to update user", description: err.message, type: "error" });
    },
  });

  const updateUserStatusMutation = useMutation<void, Error, { user_id: string; nextStatus: AdminUserStatus; note?: string }>({
    mutationFn: async ({ user_id, nextStatus, note }) => {
      await updateUserAdminStatus(user_id, { admin_status: nextStatus, note });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toaster.create({ title: "User status updated", type: "success" });
    },
    onError: (err) => {
      toaster.create({ title: "Failed to update status", description: err.message, type: "error" });
    },
  });

  const columns: Column<UserRow>[] = [
    {
      header: "Name",
      key: "first_name",
      render: (user) => <span className="font-semibold text-fg-primary">{user.first_name} {user.last_name}</span>,
    },
    { header: "Email", key: "email" },
    {
      header: "Organization",
      key: "organisation_id",
      render: (user) => <span className="text-sm text-fg-secondary">{orgNameById.get(user.organisation_id) ?? user.organisation_id}</span>,
    },
    { header: "Role", key: "organisation_role" },
    {
      header: "Status",
      key: "status",
      render: (user) => (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={accountStatusVariant[String(user.status).toLowerCase()] ?? "secondary"} className="capitalize">{user.status}</Badge>
          <Badge variant={userStatusVariant[user.admin_status]} className="capitalize">{user.admin_status}</Badge>
        </div>
      ),
    },
    {
      header: "Created",
      key: "created_at",
      render: (user) => <span className="text-sm text-fg-secondary">{formatDateShort(user.created_at)}</span>,
    },
    {
      header: "Actions",
      key: "actions" as keyof UserRow,
      render: (user) => {
        const validActions = getValidUserActions(user.admin_status);
        return (
          <div className="flex items-center gap-1">
            <ViewUserDialog
              user={user}
              trigger={
                <Button variant="ghost" size="icon-sm" aria-label="View" title="View" onClick={(event) => event.stopPropagation()}>
                  <Eye />
                </Button>
              }
            />
            <EditUserDialog
              user={user}
              onUpdate={async (user_id, payload) => {
                await updateUserDetailsMutation.mutateAsync({ user_id, payload });
              }}
              trigger={
                <Button variant="ghost" size="icon-sm" aria-label="Edit" title="Edit" onClick={(event) => event.stopPropagation()}>
                  <Pencil />
                </Button>
              }
            />

            {validActions.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="More actions"
                    title="More actions"
                    disabled={updateUserStatusMutation.isPending}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuGroup>
                    {validActions.map((action) => {
                      const config = USER_STATUS_ACTION_LABELS[action];
                      return (
                        <DropdownMenuItem
                          key={action}
                          variant={config.variant}
                          onClick={(event) => {
                            event.stopPropagation();
                            updateUserStatusMutation.mutate({
                              user_id: user.user_id,
                              nextStatus: config.nextStatus,
                              note: `${config.label} by admin`,
                            });
                          }}
                        >
                          {config.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        );
      },
    },
  ];

  const historyOrgId = selectedUser?.organisation_id ?? "";
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
  } = useUserActionHistory({ organisation_id: historyOrgId, limit: 20 });

  return (
    <div className="w-full">
      <PageHeader
        title="Users"
        breadcrumbs={[{ label: "home", href: "/" }, { label: "users" }]}
        backOnSubPathOf="users"
        actions={
          <CreateUserDialog
            trigger={
              <Button>
                <Plus data-icon="inline-start" />
                Add User
              </Button>
            }
          />
        }
      />

      <AdminPageShell>
        {isLoading ? <TableLoadingState /> : null}

        {isError ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="text-lg font-medium text-destructive">{error?.message || "Failed to load users"}</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        ) : null}

        {!isLoading && !isError && rows.length === 0 ? (
          <div className="flex w-full justify-center py-16 text-center">
            <div className="flex w-full max-w-lg flex-col items-center gap-3 rounded-lg border border-border bg-surface-primary p-10 shadow-xs">
              <div className="grid size-16 place-items-center rounded-full bg-brand-subtle text-brand-primary">
                <SearchX />
              </div>
              <p className="text-xl font-semibold text-fg-primary">No users found</p>
              <p className="max-w-md text-sm text-fg-secondary">Create your first user or adjust the organization filter.</p>
            </div>
          </div>
        ) : null}

        {!isLoading && !isError && rows.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-[260px] flex-col gap-1">
                  <label className="text-sm font-medium text-fg-secondary">Filter</label>
                  <Select
                    value={organisationFilterId ?? "__all__"}
                    onValueChange={(value) => setOrganisationFilterId(value === "__all__" ? undefined : value)}
                    disabled={isOrgsLoading}
                  >
                    <SelectTrigger className="w-full md:w-80">
                      <SelectValue placeholder="All organisations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {organisationsWithAll.map((organization) => (
                          <SelectItem key={organization.organisation_id} value={organization.organisation_id}>
                            {organization.organisation_name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-sm text-fg-secondary">Showing {rows.length} user{rows.length !== 1 ? "s" : ""}</p>
              </div>

              <CustomTable
                data={rows}
                columns={columns}
                pageSize={PAGE_SIZE}
                hidePagination
                selectedRowId={selectedUserId ?? undefined}
                onRowClick={(row) => setSelectedUserId(String(row.id))}
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-fg-secondary">Page size {PAGE_SIZE}</p>
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
                  <p className="truncate text-sm text-fg-secondary">
                    {selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : "Select a user"}
                  </p>
                </div>
              </div>
              <Separator />

              <div className="p-4">
                {!selectedUser ? (
                  <p className="text-sm text-fg-secondary">Select a user to view organization history.</p>
                ) : isHistoryLoading ? (
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