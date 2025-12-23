"use client";

import React, { useState } from "react";
import { Box, Flex, Text, HStack, Icon, Button, Image, Stack, Badge, Menu, Portal as ChakraPortal, Skeleton, Separator } from "@chakra-ui/react";
import { PageHeader } from "@/components/layout";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrganization, updateOrganization } from "@/modules/organizations/api";
import type { OrganizationDetail, UpdateOrganizationRequest } from "@/modules/organizations/types";
import { listUsers, createUser, updateUserDetails, updateUserAdminStatus } from "@/modules/users/api";
import type { UserListItem, AdminUserStatus } from "@/modules/users/types";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Pencil, Plus, Eye, MoreVertical, CheckCircle2, XCircle, PauseCircle, PlayCircle, Ban } from "lucide-react";
import { toaster } from "@/components/ui/toaster";

// Status action types and helpers
type UserStatusAction = "approve" | "reject" | "suspend" | "reinstate" | "deactivate";

const USER_STATUS_ACTIONS: Record<UserStatusAction, { label: string; nextStatus: AdminUserStatus; icon: React.ElementType; color: string }> = {
  approve: { label: "Approve", nextStatus: "approved", icon: CheckCircle2, color: "green.600" },
  reject: { label: "Reject", nextStatus: "rejected", icon: XCircle, color: "red.600" },
  suspend: { label: "Suspend", nextStatus: "suspended", icon: PauseCircle, color: "orange.600" },
  reinstate: { label: "Reinstate", nextStatus: "approved", icon: PlayCircle, color: "green.600" },
  deactivate: { label: "Deactivate", nextStatus: "deactivated", icon: Ban, color: "red.600" },
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
import EditOrgDialog from "@/components/organizations/dialogs/edit-org-dialog";
import { CustomTable, type Column } from "@/components/ui/custom-table";
import { format } from "date-fns";
import { formatDateShort } from "@/lib/utils/format-date";
import CreateUserDialog from "@/components/organizations/dialogs/create-user-dialog";
import ViewUserDialog from "@/components/organizations/dialogs/view-user-dialog";
import EditUserDialog from "@/components/organizations/dialogs/edit-user-dialog";
import { useUserActionHistory } from "@/modules/users/hooks";
import type { UserEventType } from "@/modules/users/types";

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

export default function OrganizationDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

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

  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const logoBackground = useColorModeValue("white", "gray.800");

  return (
    <Box w="full">
      <PageHeader
        title={data?.organisation_name || "Organization"}
        breadcrumbs={[{ label: "home", href: "/" }, { label: "organizations", href: "/organizations" }, { label: data?.organisation_name || id }]}
        leading={data?.logo_url ? (
          <Box
            boxSize={10}
            border="1px solid"
            borderColor={cardBorder}
            rounded="md"
            overflow="hidden"
            bg={logoBackground}
          >
            <Image src={data.logo_url} alt="Logo" w="full" h="full" objectFit="contain" />
          </Box>
        ) : undefined}
        actions={data ? (
          <EditOrgDialog
            org={data}
            onUpdate={(id, payload) => updateOrgMutation.mutateAsync({ id, payload })}
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
                <Icon as={Pencil} boxSize={4} mr={2} /> Edit org
              </Button>
            }
          />
        ) : undefined}
      />

      <Flex direction="column" gap={6} px={10} mt={6}>
        {isLoading ? <Text>Loading…</Text> : null}
        {!isLoading && isError ? (
          <Text color="red.500">{error.message || "Failed to load"}</Text>
        ) : null}
        {!isLoading && !isError && data ? (
          <>
            {/* Tabs */}
            <UsersSection organisationId={id} />
          </>
        ) : null}
      </Flex>
    </Box>
  );
}

interface UsersSectionProps {
  readonly organisationId: string;
}

function UsersSection({ organisationId }: UsersSectionProps) {
  const queryClient = useQueryClient();
  
  // Cursor-based pagination
  const PAGE_SIZE = 20;
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["users", { organisationId, limit: PAGE_SIZE, cursor }],
    queryFn: () => listUsers({ organisation_id: organisationId, limit: PAGE_SIZE, cursor: cursor ?? undefined }),
  });

  const rows: (UserListItem & { id: string })[] = (data?.users || []).map((u) => ({ ...u, id: u.user_id }));

  // Auto-select first user when data loads
  React.useEffect(() => {
    if (rows.length > 0 && (!selectedUserId || !rows.some((r) => r.user_id === selectedUserId))) {
      setSelectedUserId(rows[0].user_id);
    }
  }, [rows, selectedUserId]);

  const selectedUser = rows.find((r) => r.user_id === selectedUserId) ?? null;

  // User action history for the organisation
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
  } = useUserActionHistory({
    organisation_id: organisationId,
    limit: 20,
  });

  const columns: Column<UserListItem & { id: string }>[] = [
    { header: "Name", key: "first_name", render: (u) => `${u.first_name} ${u.last_name}` },
    { header: "Email", key: "email" },
    { header: "Role", key: "organisation_role" },
    { header: "Job Title", key: "job_title" },
    {
      header: "App Role",
      key: "user_role",
      render: (u) => (
        <Badge colorPalette={u.user_role === "admin" ? "purple" : "gray"} variant="subtle" textTransform="capitalize">
          {u.user_role}
        </Badge>
      ),
    },
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
    { header: "Created", key: "created_at", render: (u) => format(new Date(u.created_at), "PP") },
    {
      header: "Actions",
      key: "actions" as keyof (UserListItem & { id: string }),
      render: (u) => {
        const validActions = getValidUserActions(u.admin_status);
        return (
          <HStack gap={1}>
            <ViewUserDialog
              user={u}
              trigger={<Button variant="ghost" title="View"><Icon as={Eye} /></Button>}
            />
            <EditUserDialog
              user={u}
              onUpdate={async (user_id, payload) => {
                await updateUserDetails(user_id, payload);
                queryClient.invalidateQueries({ queryKey: ["users"] });
              }}
              trigger={<Button variant="ghost" title="Edit"><Icon as={Pencil} /></Button>}
            />
            {validActions.length > 0 && (
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button variant="ghost" title="Status actions"><Icon as={MoreVertical} /></Button>
                </Menu.Trigger>
                <ChakraPortal>
                  <Menu.Positioner>
                    <Menu.Content minW="180px" rounded="lg" shadow="lg" p={1}>
                      {validActions.map((action) => {
                        const config = USER_STATUS_ACTIONS[action];
                        return (
                          <Menu.Item
                            key={action}
                            value={action}
                            rounded="md"
                            px={3}
                            py={2}
                            onClick={async () => {
                              try {
                                await updateUserAdminStatus(u.user_id, {
                                  admin_status: config.nextStatus,
                                  note: `${config.label} by admin`,
                                });
                                queryClient.invalidateQueries({ queryKey: ["users"] });
                                toaster.create({ title: `User ${config.label.toLowerCase()}d`, type: "success" });
                              } catch (err) {
                                toaster.create({
                                  title: "Failed to update status",
                                  description: err instanceof Error ? err.message : "Unknown error",
                                  type: "error",
                                });
                              }
                            }}
                          >
                            <HStack gap={2}>
                              <Icon as={config.icon} boxSize={4} color={config.color} />
                              <Text fontSize="sm">{config.label}</Text>
                            </HStack>
                          </Menu.Item>
                        );
                      })}
                    </Menu.Content>
                  </Menu.Positioner>
                </ChakraPortal>
              </Menu.Root>
            )}
          </HStack>
        );
      },
    },
  ];

  return (
    <Stack gap={4}>
      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="semibold">Users</Text>
        <CreateUserDialog
          organisationId={organisationId}
          onCreate={async (values) => {
            await createUser(values);
            queryClient.invalidateQueries({ queryKey: ["users"] });
          }}
          trigger={
            <Button bg="purple.600" color="white" borderRadius="6px" _hover={{ bg: "purple.500" }}>
              <Icon as={Plus} boxSize={4} mr={2} /> Add user
            </Button>
          }
        />
      </HStack>
      {isLoading ? <Text>Loading users…</Text> : null}
      {!isLoading && isError ? (
        <Text color="red.500">{error?.message || "Failed to load users"}</Text>
      ) : null}
      {!isLoading && !isError ? (
        <Stack
          gap={6}
          direction={{ base: "column", lg: "row" }}
          align={{ base: "stretch", lg: "flex-start" }}
        >
          {/* Left: table */}
          <Stack flex="1" minW={0} gap={4}>
            <CustomTable
              data={rows}
              columns={columns}
              pageSize={PAGE_SIZE}
              hidePagination
              selectedRowId={selectedUserId ?? undefined}
              onRowClick={(row) => setSelectedUserId(String(row.id))}
            />
            
            <HStack justify="space-between" w="full">
              <Text fontSize="sm" color="gray.500">
                Showing {rows.length} user{rows.length !== 1 ? "s" : ""}
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

          {/* Right: history panel */}
          <Box
            w={{ base: "full", lg: "320px" }}
            bg="white"
            _dark={{ bg: "gray.900", borderColor: "gray.700" }}
            borderWidth="1px"
            borderColor="gray.200"
            rounded="lg"
            overflow="hidden"
            position={{ base: "static", lg: "sticky" }}
            top={{ base: "auto", lg: 4 }}
          >
            <Box p={4}>
              <Stack gap={1}>
                <Text fontSize="md" fontWeight="semibold">
                  User History
                </Text>
                <Text fontSize="sm" color="gray.500" lineClamp={1}>
                  {selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : "Select a user"}
                </Text>
              </Stack>
            </Box>
            <Separator />

            <Box p={4}>
              {isHistoryLoading ? (
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
                <Text fontSize="sm" color="gray.500">
                  No history available.
                </Text>
              ) : (
                <Stack
                  gap={2}
                  maxH={{ base: "auto", lg: "400px" }}
                  overflowY={{ base: "visible", lg: "auto" }}
                  pe={{ base: 0, lg: 1 }}
                >
                  {historyData.history.map((h) => (
                    <Box
                      key={h.id}
                      borderWidth="1px"
                      borderColor="gray.200"
                      _dark={{ borderColor: "gray.700" }}
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
                        <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                          {formatDateShort(h.created_at)}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" mt={2} color={h.note ? "inherit" : "gray.500"}>
                        {h.note || "—"}
                      </Text>
                      {h.actor_admin_name ? (
                        <Text fontSize="xs" color="gray.500" mt={1}>
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
      ) : null}
    </Stack>
  );
}

// Legacy square tab button removed; using Chakra Tabs instead
