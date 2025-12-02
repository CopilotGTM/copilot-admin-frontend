"use client";

import React from "react";
import { Box, Flex, Text, HStack, Icon, Button, Image, Stack, Badge, Tabs, Menu, Portal as ChakraPortal } from "@chakra-ui/react";
import { PageHeader } from "@/components/layout";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrganization, updateOrganization } from "@/modules/organizations/api";
import type { OrganizationDetail, UpdateOrganizationRequest } from "@/modules/organizations/types";
import { listUsers, createUser, updateUserDetails, updateUserAdminStatus } from "@/modules/users/api";
import type { UserListItem } from "@/modules/users/types";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Users, Pencil, Plus, History, Settings, CreditCard, Plug, Shield, Eye, Trash2 as TrashIcon, MoreVertical } from "lucide-react";
import EditOrgDialog from "@/components/organizations/dialogs/edit-org-dialog";
import { CustomTable, type Column } from "@/components/ui/custom-table";
import { format } from "date-fns";
import CreateUserDialog from "@/components/organizations/dialogs/create-user-dialog";
import ViewUserDialog from "@/components/organizations/dialogs/view-user-dialog";
import EditUserDialog from "@/components/organizations/dialogs/edit-user-dialog";
import AlertDialog from "@/components/ui/alert-dialog";

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
            <Tabs.Root variant="enclosed" defaultValue={"users"}>
              <Tabs.List overflowX="auto" whiteSpace="nowrap" gap={2}>
                <Tabs.Trigger value="users" px={4} py={2} minW="fit-content">
                  <HStack gap={2}>
                    <Box w="24px" h="24px" rounded="md" borderWidth="1px" display="inline-flex" alignItems="center" justifyContent="center" flexShrink={0} lineHeight={0}>
                      <Icon as={Users} boxSize="14px" />
                    </Box>
                    <Text>Users</Text>
                  </HStack>
                </Tabs.Trigger>
                <Tabs.Trigger value="history" px={4} py={2} minW="fit-content">
                  <HStack gap={2}>
                    <Box w="24px" h="24px" rounded="md" borderWidth="1px" display="inline-flex" alignItems="center" justifyContent="center" flexShrink={0} lineHeight={0}>
                      <Icon as={History} boxSize="14px" />
                    </Box>
                    <Text>History</Text>
                  </HStack>
                </Tabs.Trigger>
                <Tabs.Trigger value="settings" px={4} py={2} minW="fit-content">
                  <HStack gap={2}>
                    <Box w="24px" h="24px" rounded="md" borderWidth="1px" display="inline-flex" alignItems="center" justifyContent="center" flexShrink={0} lineHeight={0}>
                      <Icon as={Settings} boxSize="14px" />
                    </Box>
                    <Text>Settings</Text>
                  </HStack>
                </Tabs.Trigger>
                <Tabs.Trigger value="billing" px={4} py={2} minW="fit-content">
                  <HStack gap={2}>
                    <Box w="24px" h="24px" rounded="md" borderWidth="1px" display="inline-flex" alignItems="center" justifyContent="center" flexShrink={0} lineHeight={0}>
                      <Icon as={CreditCard} boxSize="14px" />
                    </Box>
                    <Text>Billing</Text>
                  </HStack>
                </Tabs.Trigger>
                <Tabs.Trigger value="integrations" px={4} py={2} minW="fit-content">
                  <HStack gap={2}>
                    <Box w="24px" h="24px" rounded="md" borderWidth="1px" display="inline-flex" alignItems="center" justifyContent="center" flexShrink={0} lineHeight={0}>
                      <Icon as={Plug} boxSize="14px" />
                    </Box>
                    <Text>Integrations</Text>
                  </HStack>
                </Tabs.Trigger>
                <Tabs.Trigger value="security" px={4} py={2} minW="fit-content">
                  <HStack gap={2}>
                    <Box w="24px" h="24px" rounded="md" borderWidth="1px" display="inline-flex" alignItems="center" justifyContent="center" flexShrink={0} lineHeight={0}>
                      <Icon as={Shield} boxSize="14px" />
                    </Box>
                    <Text>Security</Text>
                  </HStack>
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="users">
                <Box mt={4}>
                  <UsersSection organisationId={id} />
                </Box>
              </Tabs.Content>
              <Tabs.Content value="history">
                <Box mt={4}>
                  <Text color="gray.500">History coming soon…</Text>
                </Box>
              </Tabs.Content>
              <Tabs.Content value="settings">
                <Box mt={4}>
                  <Text color="gray.500">Settings coming soon…</Text>
                </Box>
              </Tabs.Content>
              <Tabs.Content value="billing">
                <Box mt={4}>
                  <Text color="gray.500">Billing coming soon…</Text>
                </Box>
              </Tabs.Content>
              <Tabs.Content value="integrations">
                <Box mt={4}>
                  <Text color="gray.500">Integrations coming soon…</Text>
                </Box>
              </Tabs.Content>
              <Tabs.Content value="security">
                <Box mt={4}>
                  <Text color="gray.500">Security coming soon…</Text>
                </Box>
              </Tabs.Content>
            </Tabs.Root>
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
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", { organisationId, limit: 50 }],
    queryFn: () => listUsers({ organisation_id: organisationId, limit: 50 }),
  });

  const rows: (UserListItem & { id: string })[] = (data?.users || []).map((u) => ({ ...u, id: u.user_id }));

  const columns: Column<UserListItem & { id: string }>[] = [
    { header: "Name", key: "first_name", render: (u) => `${u.first_name} ${u.last_name}` },
    { header: "Email", key: "email" },
    { header: "Role", key: "organisation_role" },
    { header: "Job Title", key: "job_title" },
    { header: "Status", key: "admin_status", render: (u) => <Badge variant="subtle">{u.admin_status}</Badge> },
    { header: "Created", key: "created_at", render: (u) => format(new Date(u.created_at), "PP") },
    {
      header: "Actions",
      key: "actions" as keyof (UserListItem & { id: string }),
      render: (u) => (
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
          <AlertDialog
            trigger={<Button variant="ghost" title="Delete"><Icon as={TrashIcon} /></Button>}
            title="Delete user"
            description={`This will permanently delete ${u.first_name} ${u.last_name}.`}
            confirmLabel="Delete"
            confirmColorPalette="red"
            onConfirm={async () => {
              // If there is a delete user endpoint later, call it; for now, mark as rejected
              await updateUserAdminStatus(u.user_id, { admin_status: "rejected", note: "Deleted by admin" });
              queryClient.invalidateQueries({ queryKey: ["users"] });
            }}
          />
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button variant="ghost" title="More"><Icon as={MoreVertical} /></Button>
            </Menu.Trigger>
            <ChakraPortal>
              <Menu.Positioner>
                <Menu.Content p={2} w="56" rounded="md">
                  <Menu.Item value="approve" onClick={async () => {
                    await updateUserAdminStatus(u.user_id, { admin_status: "approved", note: "Approved by admin" });
                    queryClient.invalidateQueries({ queryKey: ["users"] });
                  }}>Approve user</Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </ChakraPortal>
          </Menu.Root>
        </HStack>
      ),
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
        <CustomTable data={rows} columns={columns} pageSize={10} />
      ) : null}
    </Stack>
  );
}

// Legacy square tab button removed; using Chakra Tabs instead
