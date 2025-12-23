"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Menu,
  Portal,
  Separator,
  Skeleton,
  Stack,
  Text,
  createListCollection,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@chakra-ui/react";
import { PageHeader } from "@/components/layout";
import { Column, CustomTable } from "@/components/ui/custom-table";
import { useColorModeValue } from "@/components/ui/color-mode";
import { toaster } from "@/components/ui/toaster";
import ViewUserDialog from "@/components/organizations/dialogs/view-user-dialog";
import EditUserDialog from "@/components/organizations/dialogs/edit-user-dialog";
import { CreateUserDialog } from "@/modules/users/components/dialogs";
import { listOrganizations } from "@/modules/organizations/api";
import type { OrganizationListItem } from "@/modules/organizations/types";
import {
  updateUserAdminStatus,
  updateUserDetails,
} from "@/modules/users/api";
import { useUserActionHistory, useUsers } from "@/modules/users/hooks";
import type { AdminUserStatus, UserEventType, UserListItem, UpdateUserDetailsRequest } from "@/modules/users/types";
import { formatDateShort } from "@/lib/utils/format-date";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, MoreVertical, Pencil, Plus, SearchX } from "lucide-react";

type UserRow = UserListItem & { id: string };

type UserStatusAction = "approve" | "reject" | "suspend" | "reinstate" | "deactivate";

const USER_STATUS_ACTION_LABELS: Record<
  UserStatusAction,
  { label: string; nextStatus: AdminUserStatus; color: string }
> = {
  approve: { label: "Approve", nextStatus: "approved", color: "green.600" },
  reject: { label: "Reject", nextStatus: "rejected", color: "red.600" },
  suspend: { label: "Suspend", nextStatus: "suspended", color: "orange.600" },
  reinstate: { label: "Reinstate", nextStatus: "approved", color: "green.600" },
  deactivate: { label: "Deactivate", nextStatus: "deactivated", color: "red.600" },
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

const historyActionPalette: Partial<Record<UserEventType, string>> = {
  created: "blue",
  updated: "gray",
  status_changed: "purple",
  role_changed: "purple",
  deleted: "red",
  login: "green",
  password_reset: "orange",
  email_verified: "green",
  field_changed: "gray",
};

export default function UsersPage() {
  const queryClient = useQueryClient();

  const PAGE_SIZE = 20;
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  const [organisationFilterId, setOrganisationFilterId] = useState<string | undefined>(undefined);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const muted = useColorModeValue("gray.600", "gray.400");
  const cardBg = useColorModeValue("white", "gray.900");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const panelBg = useColorModeValue("white", "gray.900");
  const panelBorder = useColorModeValue("gray.200", "gray.700");
  const iconBg = useColorModeValue("purple.50", "purple.900");
  const iconColor = useColorModeValue("purple.600", "purple.300");

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

  const orgCollection = useMemo(
    () =>
      createListCollection({
        items: organisationsWithAll,
        itemToString: (item) => item.organisation_name,
        itemToValue: (item) => item.organisation_id,
      }),
    [organisationsWithAll],
  );

  const orgNameById = useMemo(() => {
    const map = new Map<string, string>();
    (orgData?.organizations ?? []).forEach((o) => map.set(o.organisation_id, o.organisation_name));
    return map;
  }, [orgData?.organizations]);

  useEffect(() => {
    setCursor(null);
    setCursorHistory([]);
  }, [organisationFilterId]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useUsers({
    limit: PAGE_SIZE,
    cursor: cursor ?? undefined,
    organisation_id: organisationFilterId,
  });

  const rows: UserRow[] = useMemo(
    () => (data?.users ?? []).map((u) => ({ ...u, id: u.user_id })),
    [data?.users],
  );

  useEffect(() => {
    if (rows.length === 0) {
      setSelectedUserId(null);
      return;
    }
    if (!selectedUserId || !rows.some((r) => r.user_id === selectedUserId)) {
      setSelectedUserId(rows[0].user_id);
    }
  }, [rows, selectedUserId]);

  const selectedUser = useMemo(
    () => rows.find((r) => r.user_id === selectedUserId) ?? null,
    [rows, selectedUserId],
  );

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

  const updateUserStatusMutation = useMutation<
    void,
    Error,
    { user_id: string; nextStatus: AdminUserStatus; note?: string }
  >({
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
      render: (u) => (
        <Text fontWeight="semibold">
          {u.first_name} {u.last_name}
        </Text>
      ),
    },
    { header: "Email", key: "email" },
    {
      header: "Organization",
      key: "organisation_id",
      render: (u) => (
        <Text fontSize="sm" color={muted}>
          {orgNameById.get(u.organisation_id) ?? u.organisation_id}
        </Text>
      ),
    },
    { header: "Role", key: "organisation_role" },
    {
      header: "Status",
      key: "status",
      render: (u) => (
        <HStack gap={2}>
          <Badge variant="subtle">{u.status}</Badge>
          <Badge variant="subtle" textTransform="capitalize">{u.admin_status}</Badge>
        </HStack>
      ),
    },
    {
      header: "Created",
      key: "created_at",
      render: (u) => <Text fontSize="sm">{formatDateShort(u.created_at)}</Text>,
    },
    {
      header: "Actions",
      key: "actions" as keyof UserRow,
      render: (u) => {
        const validActions = getValidUserActions(u.admin_status);

        return (
          <HStack gap={0}>
            <ViewUserDialog
              user={u}
              trigger={
                <IconButton
                  aria-label="View"
                  title="View"
                  variant="ghost"
                  size="sm"
                  rounded="md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Eye size={16} />
                </IconButton>
              }
            />
            <EditUserDialog
              user={u}
              onUpdate={async (user_id, payload) => {
                await updateUserDetailsMutation.mutateAsync({ user_id, payload });
              }}
              trigger={
                <IconButton
                  aria-label="Edit"
                  title="Edit"
                  variant="ghost"
                  size="sm"
                  rounded="md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Pencil size={16} />
                </IconButton>
              }
            />

            {validActions.length > 0 ? (
              <Menu.Root>
                <Menu.Trigger asChild>
                  <IconButton
                    aria-label="More actions"
                    title="More actions"
                    variant="ghost"
                    size="sm"
                    rounded="md"
                    onClick={(e) => e.stopPropagation()}
                    loading={updateUserStatusMutation.isPending}
                  >
                    <MoreVertical size={16} />
                  </IconButton>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content minW="180px" rounded="lg" shadow="lg" p={1}>
                      {validActions.map((action) => {
                        const config = USER_STATUS_ACTION_LABELS[action];
                        return (
                          <Menu.Item
                            key={action}
                            value={action}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateUserStatusMutation.mutate({
                                user_id: u.user_id,
                                nextStatus: config.nextStatus,
                                note: `${config.label} by admin`,
                              });
                            }}
                            rounded="md"
                            px={3}
                            py={2}
                          >
                            <Text fontSize="sm" color={config.color}>
                              {config.label}
                            </Text>
                          </Menu.Item>
                        );
                      })}
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            ) : null}
          </HStack>
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
  } = useUserActionHistory({
    organisation_id: historyOrgId,
    limit: 20,
  });

  return (
    <Box w="full">
      <PageHeader
        title="Users"
        breadcrumbs={[{ label: "home", href: "/" }, { label: "users" }]}
        backOnSubPathOf="users"
        actions={
          <CreateUserDialog
            trigger={
              <Button
                bg={"purple.600"}
                borderRadius={"6px"}
                fontSize={"sm"}
                fontWeight={"semibold"}
                color={"white"}
                _hover={{ bg: "purple.500" }}
                padding={2}
              >
                <Plus /> Add User
              </Button>
            }
          />
        }
      />

      <Box w="full" maxW="7xl" mx="auto" px={{ base: 4, md: 10 }} mt={6}>
        {isLoading ? (
          <Stack w="full" maxW="6xl" mt={6} gap={4}>
            <Skeleton height="40px" rounded="md" />
            <Box borderWidth="1px" borderColor={cardBorder} rounded="lg" p={4} bg={cardBg}>
              <Stack gap={3}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <HStack key={i} gap={3}>
                    <Skeleton height="24px" flex={2} rounded="md" />
                    <Skeleton height="24px" flex={2} rounded="md" />
                    <Skeleton height="24px" flex={2} rounded="md" />
                    <Skeleton height="24px" flex={1} rounded="md" />
                    <Skeleton height="24px" flex={1} rounded="md" />
                  </HStack>
                ))}
              </Stack>
            </Box>
          </Stack>
        ) : isError ? (
          <Stack align="center" justify="center" py={16} gap={4} textAlign="center">
            <Text fontSize="lg" color="red.500">
              {error?.message || "Failed to load users"}
            </Text>
            <Button onClick={() => refetch()}>Retry</Button>
          </Stack>
        ) : rows.length === 0 ? (
          <Stack align="center" justify="center" py={16} gap={5} textAlign="center" w="full">
            <Box
              bg={cardBg}
              borderWidth="1px"
              borderColor={cardBorder}
              rounded="lg"
              p={10}
              maxW="lg"
              w="full"
              boxShadow="sm"
            >
              <Stack align="center" gap={3}>
                <Box
                  bg={iconBg}
                  color={iconColor}
                  rounded="full"
                  boxSize={16}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={SearchX} boxSize={8} />
                </Box>
                <Text fontSize="xl" fontWeight="semibold">
                  No users found
                </Text>
                <Text fontSize="sm" color={muted} maxW="md">
                  Create your first user or adjust the organization filter.
                </Text>
              </Stack>
            </Box>
          </Stack>
        ) : (
          <Stack
            w="full"
            gap={6}
            direction={{ base: "column", lg: "row" }}
            align={{ base: "stretch", lg: "flex-start" }}
          >
            {/* Left: table */}
            <Stack flex="1" minW={0} gap={4}>
              <HStack justify="space-between" align="center" gap={4} flexWrap="wrap">
                <Stack gap={1}>
                  <Text fontSize="sm" color={muted}>
                    Filter
                  </Text>
                  <SelectRoot
                    collection={orgCollection}
                    value={[organisationFilterId ?? "__all__"]}
                    onValueChange={(details: { value: string[] }) => {
                      const v = details.value[0];
                      setOrganisationFilterId(v === "__all__" ? undefined : v);
                    }}
                    disabled={isOrgsLoading}
                  >
                    <SelectTrigger minW={{ base: "260px", md: "320px" }}>
                      <SelectValueText placeholder="All organisations" />
                    </SelectTrigger>
                    <SelectContent>
                      {orgCollection.items.map((org) => (
                        <SelectItem item={org} key={org.organisation_id}>
                          {org.organisation_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </Stack>

                <Text fontSize="sm" color={muted}>
                  Showing {rows.length} user{rows.length !== 1 ? "s" : ""}
                </Text>
              </HStack>

              <CustomTable
                data={rows}
                columns={columns}
                pageSize={PAGE_SIZE}
                hidePagination
                selectedRowId={selectedUserId ?? undefined}
                onRowClick={(row) => setSelectedUserId(String(row.id))}
              />

              <HStack justify="space-between" w="full">
                <Text fontSize="sm" color={muted}>
                  Page size {PAGE_SIZE}
                </Text>
                <HStack gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const prev = cursorHistory[cursorHistory.length - 1] ?? null;
                      setCursorHistory((h) => h.slice(0, -1));
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
                        setCursorHistory((h) => [...h, cursor ?? "__first__"]);
                        setCursor(data.cursor);
                      }
                    }}
                    disabled={!data?.cursor || isFetching}
                  >
                    Next
                  </Button>
                </HStack>
              </HStack>
            </Stack>

            {/* Right: history */}
            <Box
              w={{ base: "full", lg: "360px" }}
              bg={panelBg}
              borderWidth="1px"
              borderColor={panelBorder}
              rounded="lg"
              overflow="hidden"
              position={{ base: "static", lg: "sticky" }}
              top={{ base: "auto", lg: 4 }}
            >
              <Box p={4}>
                <Stack gap={1}>
                  <Text fontSize="md" fontWeight="semibold">
                    History
                  </Text>
                  <Text fontSize="sm" color={muted} lineClamp={1}>
                    {selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : "Select a user"}
                  </Text>
                </Stack>
              </Box>
              <Separator />

              <Box p={4}>
                {!selectedUser ? (
                  <Text fontSize="sm" color={muted}>
                    Select a user to view organization history.
                  </Text>
                ) : isHistoryLoading ? (
                  <Stack gap={3}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} height="64px" rounded="md" />
                    ))}
                  </Stack>
                ) : isHistoryError ? (
                  <Text fontSize="sm" color="red.500">
                    {historyError?.message || "Failed to load history"}
                  </Text>
                ) : !historyData || historyData.history.length === 0 ? (
                  <Text fontSize="sm" color={muted}>
                    No history available.
                  </Text>
                ) : (
                  <Stack
                    gap={2}
                    maxH={{ base: "auto", lg: "560px" }}
                    overflowY={{ base: "visible", lg: "auto" }}
                    pe={{ base: 0, lg: 1 }}
                  >
                    {historyData.history.map((h) => (
                      <Box
                        key={h.id}
                        borderWidth="1px"
                        borderColor={panelBorder}
                        rounded="md"
                        p={3}
                      >
                        <HStack justify="space-between" align="center" gap={3}>
                          <Badge
                            colorPalette={historyActionPalette[h.action] ?? "gray"}
                            variant="subtle"
                            rounded="full"
                            px={2}
                            py={0.5}
                            textTransform="capitalize"
                          >
                            {h.action.replaceAll("_", " ")}
                          </Badge>
                          <Text fontSize="xs" color={muted} whiteSpace="nowrap">
                            {formatDateShort(h.created_at)}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" mt={2} color={h.note ? "inherit" : muted}>
                          {h.note || "—"}
                        </Text>
                        {h.actor_admin_name ? (
                          <Text fontSize="xs" color={muted} mt={1}>
                            by {h.actor_admin_name}
                          </Text>
                        ) : null}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Box>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
