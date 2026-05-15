"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import {
  Ban,
  CheckCircle2,
  Eye,
  MoreVertical,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  Settings,
  Users,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import { AdminPageShell } from "@/components/layout/page-shell";
import CreateUserDialog from "@/components/organizations/dialogs/create-user-dialog";
import EditOrgDialog from "@/components/organizations/dialogs/edit-org-dialog";
import EditUserDialog from "@/components/organizations/dialogs/edit-user-dialog";
import ViewUserDialog from "@/components/organizations/dialogs/view-user-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomTable, type Column } from "@/components/ui/custom-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toaster } from "@/components/ui/toaster";
import { getOrganization, updateOrganisationAppSettings, updateOrganization } from "@/modules/organizations/api";
import { OrganizationAppSettings } from "@/modules/organizations/components/organization-app-settings";
import type {
  OrganisationAppSettings,
  OrganizationDetail,
  UpdateOrganizationRequest,
} from "@/modules/organizations/types";
import { createUser, listUsers, updateUserAdminStatus, updateUserDetails } from "@/modules/users/api";
import { useUserActionHistory } from "@/modules/users/hooks";
import type { AdminUserStatus, SupabaseUserStatus, UserEventType, UserListItem } from "@/modules/users/types";
import { formatDateShort } from "@/lib/utils/format-date";

// Status action types and helpers
type UserStatusAction = "approve" | "reject" | "suspend" | "reinstate" | "deactivate";

const USER_STATUS_ACTIONS: Record<
  UserStatusAction,
  {
    label: string;
    pastTense: string;
    nextStatus: AdminUserStatus;
    icon: React.ElementType;
    destructive?: boolean;
  }
> = {
  approve: { label: "Approve", pastTense: "approved", nextStatus: "approved", icon: CheckCircle2 },
  reject: { label: "Reject", pastTense: "rejected", nextStatus: "rejected", icon: XCircle, destructive: true },
  suspend: { label: "Suspend", pastTense: "suspended", nextStatus: "suspended", icon: PauseCircle },
  reinstate: { label: "Reinstate", pastTense: "reinstated", nextStatus: "approved", icon: PlayCircle },
  deactivate: { label: "Deactivate", pastTense: "deactivated", nextStatus: "deactivated", icon: Ban, destructive: true },
};

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

const userRoleVariant: Record<UserListItem["user_role"], BadgeVariant> = {
  admin: "primary-subtle",
  member: "secondary",
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

function OrganizationLogo({ src, name }: { src: string; name: string }) {
  return (
    <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-surface-primary">
      {/* eslint-disable-next-line @next/next/no-img-element -- Organization logos are arbitrary external admin data. */}
      <img src={src} alt={`${name} logo`} className="size-full object-contain" />
    </div>
  );
}

function LoadingState() {
  return (
    <AdminPageShell className="flex flex-col gap-6">
      <Skeleton className="h-8 w-52" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </AdminPageShell>
  );
}

export default function OrganizationDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [activeTab, setActiveTab] = useState<"users" | "settings">("users");

  const { data, isLoading, isError, error } = useQuery<OrganizationDetail, Error>({
    queryKey: ["organization", id],
    queryFn: () => getOrganization(id),
    enabled: !!id,
  });

  const queryClient = useQueryClient();
  const updateOrgMutation = useMutation<OrganizationDetail, Error, { id: string; payload: UpdateOrganizationRequest }>({
    mutationFn: ({ id, payload }) => updateOrganization(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", id] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const updateAppSettingsMutation = useMutation<
    OrganizationDetail,
    Error,
    { id: string; settings: OrganisationAppSettings }
  >({
    mutationFn: ({ id, settings }) =>
      updateOrganisationAppSettings(id, {
        crm: { provider: settings.crm.provider },
        channels: settings.channels,
      }),
    onSuccess: (updatedOrg) => {
      queryClient.setQueryData(["organization", id], updatedOrg);
      queryClient.invalidateQueries({ queryKey: ["organization", id] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toaster.create({ title: "Organization settings saved", type: "success" });
    },
    onError: (err) => {
      toaster.create({
        title: "Failed to save settings",
        description: err.message,
        type: "error",
      });
    },
  });

  return (
    <div className="w-full">
      <PageHeader
        title={data?.organisation_name || "Organization"}
        breadcrumbs={[
          { label: "home", href: "/" },
          { label: "organizations", href: "/organizations" },
          { label: data?.organisation_name || id },
        ]}
        leading={data?.logo_url ? <OrganizationLogo src={data.logo_url} name={data.organisation_name} /> : undefined}
        actions={
          data ? (
            <EditOrgDialog
              org={data}
              onUpdate={(orgId, payload) => updateOrgMutation.mutateAsync({ id: orgId, payload })}
              trigger={
                <Button>
                  <Pencil data-icon="inline-start" />
                  Edit org
                </Button>
              }
            />
          ) : undefined
        }
      />

      {isLoading ? <LoadingState /> : null}
      {!isLoading && isError ? (
        <AdminPageShell>
          <Alert variant="destructive">
            <XCircle data-icon="inline-start" />
            <AlertDescription>{error.message || "Failed to load organization."}</AlertDescription>
          </Alert>
        </AdminPageShell>
      ) : null}
      {!isLoading && !isError && data ? (
        <AdminPageShell className="flex flex-col gap-5">
          <div className="flex w-fit rounded-lg border border-border bg-surface-secondary p-1">
            <Button
              type="button"
              variant={activeTab === "users" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("users")}
            >
              <Users data-icon="inline-start" />
              Users
            </Button>
            <Button
              type="button"
              variant={activeTab === "settings" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("settings")}
            >
              <Settings data-icon="inline-start" />
              Settings
            </Button>
          </div>

          {activeTab === "users" ? <UsersSection organisationId={id} /> : null}
          {activeTab === "settings" ? (
            <OrganizationAppSettings
              org={data}
              isSaving={updateAppSettingsMutation.isPending}
              onSave={(settings) => updateAppSettingsMutation.mutateAsync({ id, settings })}
            />
          ) : null}
        </AdminPageShell>
      ) : null}
    </div>
  );
}

interface UsersSectionProps {
  readonly organisationId: string;
}

function UsersSection({ organisationId }: UsersSectionProps) {
  const queryClient = useQueryClient();
  const pageSize = 20;
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["users", { organisationId, limit: pageSize, cursor }],
    queryFn: () => listUsers({ organisation_id: organisationId, limit: pageSize, cursor: cursor ?? undefined }),
  });

  const rows: (UserListItem & { id: string })[] = (data?.users || []).map((user) => ({ ...user, id: user.user_id }));

  React.useEffect(() => {
    if (rows.length > 0 && (!selectedUserId || !rows.some((row) => row.user_id === selectedUserId))) {
      setSelectedUserId(rows[0].user_id);
    }
  }, [rows, selectedUserId]);

  const selectedUser = rows.find((row) => row.user_id === selectedUserId) ?? null;

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
  } = useUserActionHistory({
    organisation_id: organisationId,
    limit: 20,
  });

  const updateStatus = async (user: UserListItem, action: UserStatusAction) => {
    const config = USER_STATUS_ACTIONS[action];

    try {
      await updateUserAdminStatus(user.user_id, {
        admin_status: config.nextStatus,
        note: `${config.label} by admin`,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toaster.create({ title: `User ${config.pastTense}`, type: "success" });
    } catch (err) {
      toaster.create({
        title: "Failed to update status",
        description: err instanceof Error ? err.message : "Unknown error",
        type: "error",
      });
    }
  };

  const columns: Column<UserListItem & { id: string }>[] = [
    { header: "Name", key: "first_name", render: (user) => `${user.first_name} ${user.last_name}` },
    { header: "Email", key: "email" },
    { header: "Role", key: "organisation_role" },
    { header: "Job Title", key: "job_title" },
    {
      header: "App Role",
      key: "user_role",
      render: (user) => (
        <Badge variant={userRoleVariant[user.user_role]} className="capitalize">
          {user.user_role}
        </Badge>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (user) => (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={supabaseStatusVariant[user.status]}>{user.status}</Badge>
          <Badge variant={adminStatusVariant[user.admin_status]} className="capitalize">
            {user.admin_status}
          </Badge>
        </div>
      ),
    },
    { header: "Created", key: "created_at", render: (user) => format(new Date(user.created_at), "PP") },
    {
      header: "Actions",
      key: "actions" as keyof (UserListItem & { id: string }),
      render: (user) => {
        const validActions = getValidUserActions(user.admin_status);
        return (
          <div className="flex items-center gap-1">
            <ViewUserDialog
              user={user}
              trigger={
                <Button variant="ghost" size="icon-sm" title="View">
                  <Eye />
                </Button>
              }
            />
            <EditUserDialog
              user={user}
              onUpdate={async (userId, payload) => {
                await updateUserDetails(userId, payload);
                queryClient.invalidateQueries({ queryKey: ["users"] });
              }}
              trigger={
                <Button variant="ghost" size="icon-sm" title="Edit">
                  <Pencil />
                </Button>
              }
            />
            {validActions.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" title="Status actions">
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuGroup>
                    {validActions.map((action) => {
                      const config = USER_STATUS_ACTIONS[action];
                      const Icon = config.icon;
                      return (
                        <DropdownMenuItem
                          key={action}
                          variant={config.destructive ? "destructive" : "default"}
                          className="py-2"
                          onSelect={() => {
                            void updateStatus(user, action);
                          }}
                        >
                          <Icon />
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-fg-primary">Users</h2>
          <p className="mt-1 text-sm text-fg-muted">Manage users and review recent access history for this organization.</p>
        </div>
        <CreateUserDialog
          organisationId={organisationId}
          onCreate={async (values) => {
            await createUser(values);
            queryClient.invalidateQueries({ queryKey: ["users"] });
          }}
          trigger={
            <Button>
              <Plus data-icon="inline-start" />
              Add user
            </Button>
          }
        />
      </div>

      {isLoading ? <UsersLoadingState /> : null}
      {!isLoading && isError ? (
        <Alert variant="destructive">
          <XCircle data-icon="inline-start" />
          <AlertDescription>{error?.message || "Failed to load users."}</AlertDescription>
        </Alert>
      ) : null}
      {!isLoading && !isError ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="min-w-0">
            <CustomTable
              data={rows}
              columns={columns}
              pageSize={pageSize}
              hidePagination
              selectedRowId={selectedUserId ?? undefined}
              onRowClick={(row) => setSelectedUserId(String(row.id))}
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-fg-secondary">
                Showing {rows.length} user{rows.length !== 1 ? "s" : ""}
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

          <UserHistoryPanel
            selectedUser={selectedUser}
            historyData={historyData}
            isHistoryLoading={isHistoryLoading}
            isHistoryError={isHistoryError}
            historyError={historyError}
          />
        </div>
      ) : null}
    </div>
  );
}

function UsersLoadingState() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

interface UserHistoryPanelProps {
  selectedUser: UserListItem | null;
  historyData: ReturnType<typeof useUserActionHistory>["data"];
  isHistoryLoading: boolean;
  isHistoryError: boolean;
  historyError: Error | null;
}

function UserHistoryPanel({
  selectedUser,
  historyData,
  isHistoryLoading,
  isHistoryError,
  historyError,
}: Readonly<UserHistoryPanelProps>) {
  return (
    <aside className="overflow-hidden rounded-lg border border-border bg-surface-primary shadow-xs lg:sticky lg:top-4">
      <div className="px-4 py-4">
        <h3 className="text-base font-semibold text-fg-primary">User History</h3>
        <p className="mt-1 truncate text-sm text-fg-muted">
          {selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : "Select a user"}
        </p>
      </div>
      <div className="border-t border-border px-4 py-4">
        {isHistoryLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : isHistoryError ? (
          <p className="text-sm text-signal-risk">{historyError?.message || "Failed to load history."}</p>
        ) : !historyData || historyData.history.length === 0 ? (
          <p className="text-sm text-fg-muted">No history available.</p>
        ) : (
          <div className="flex max-h-[400px] flex-col gap-2 overflow-y-auto pr-1">
            {historyData.history.map((item) => (
              <div key={item.id} className="rounded-md border border-border bg-surface-secondary/40 p-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant={historyActionVariant[item.action] ?? "secondary"} className="h-auto whitespace-normal capitalize">
                    {item.action.replaceAll("_", " ")}
                  </Badge>
                  <span className="shrink-0 text-xs text-fg-muted">{formatDateShort(item.created_at)}</span>
                </div>
                <p className={item.note ? "mt-2 text-sm text-fg-primary" : "mt-2 text-sm text-fg-muted"}>{item.note || "-"}</p>
                {item.actor_admin_name ? <p className="mt-1 text-xs text-fg-muted">by {item.actor_admin_name}</p> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
