"use client";

import React, { useMemo, useState } from "react";
import { Box, Flex, Text, Button, Stack, Icon, Skeleton, HStack, Badge, IconButton, Menu, Portal } from "@chakra-ui/react";
import PageHeader from "../../../components/page-header";
import { Column, CustomTable } from "../../../components/ui/custom-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listOrganizations, OrganizationListItem, createOrganization, updateOrganization, deleteOrganization, updateOrganizationStatus, type CreateOrganizationRequest, type OrganizationSummary, type UpdateOrganizationRequest, type OrganizationDetail } from "../../../lib/organizations";
import { CreateOrgDialog } from "../../../components/organizations/dialogs/create-org-dialog";
import { Plus, SearchX, Eye, Pencil, Trash2, MoreVertical } from "lucide-react";
import { useColorModeValue } from "../../../components/ui/color-mode";

import { Dialog } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import ViewOrgDialog from "../../../components/organizations/dialogs/view-org-dialog";
import EditOrgDialog from "../../../components/organizations/dialogs/edit-org-dialog";
import { toaster } from "../../../components/ui/toaster";
import AlertDialog from "../../../components/ui/alert-dialog";

type OrgRow = OrganizationListItem & { id: string };

const statusColor: Record<OrgRow["status"], string> = {
  pending: "yellow",
  approved: "green",
  rejected: "red",
  suspended: "orange",
  deactivated: "gray",
};

const OrganizationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["organizations", { limit: 50 }],
    queryFn: () => listOrganizations({ limit: 50 }),
  });

  const createOrgMutation = useMutation<OrganizationSummary, Error, CreateOrganizationRequest>({
    mutationFn: (payload) => createOrganization(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const updateOrgMutation = useMutation<OrganizationDetail, Error, { id: string; payload: UpdateOrganizationRequest }>({
    mutationFn: ({ id, payload }) => updateOrganization(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const deleteOrgMutation = useMutation<{ organisation_id: string; organisation_name: string; schema_name: string | null }, Error, string>({
    mutationFn: (id: string) => deleteOrganization(id),
    onSuccess: () => {
      toaster.create({ title: "Organization deleted", duration: 2000 });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } ; message?: string };
      toaster.create({
        title: "Delete failed",
        description: e?.response?.data?.message || e?.message || "Cannot delete organization",
        type: "error",
        duration: 2500,
      });
    },
  });

  const rows: OrgRow[] = useMemo(
    () => ((data?.organizations || []) as OrganizationListItem[]).map((o) => ({ ...o, id: o.organisation_id })),
    [data],
  );

  const [viewOrg, setViewOrg] = useState<OrgRow | null>(null);
  // const [deleteOrg, setDeleteOrg] = useState<OrgRow | null>(null);

  const columns: Column<OrgRow>[] = [
    {
      header: "Organization",
      key: "organisation_name",
      render: (o) => (
        <Button variant="plain" onClick={() => router.push(`/organizations/${o.organisation_id}`)}>
          {o.organisation_name}
        </Button>
      ),
    },
    { header: "Country", key: "country" },
    { header: "Team Size", key: "sales_team_size", isNumeric: true },
    {
      header: "Status",
      key: "status",
      render: (o) => (
        <Badge colorPalette={statusColor[o.status]} variant="subtle" rounded="md">
          {o.status}
        </Badge>
      ),
    },
    { header: "Created", key: "created_at" },
    {
      header: "Actions",
      key: "actions" as keyof OrgRow,
      render: (o) => (
        <HStack gap={1}>
          <ViewOrgDialog
            org={o}
            trigger={
              <IconButton aria-label="View" title="View">
                <Eye />
              </IconButton>
            }
          />
          <EditOrgDialog
            org={o}
            onUpdate={(id, payload) => updateOrgMutation.mutateAsync({ id, payload })}
            trigger={
              <IconButton aria-label="Edit" title="Edit">
                <Pencil />
              </IconButton>
            }
          />
          <AlertDialog
            trigger={
              <IconButton aria-label="Delete" title="Delete">
                <Trash2 />
              </IconButton>
            }
            title="Are you sure?"
            description={
              <Text>
                This action cannot be undone. This will permanently delete <b>{o.organisation_name}</b> and remove its data from our systems.
              </Text>
            }
            confirmLabel="Delete"
            confirmColorPalette="red"
            onConfirm={async () => {
              await deleteOrgMutation.mutateAsync(o.organisation_id);
            }}
          />

          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton aria-label="More actions">
                <MoreVertical />
              </IconButton>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content p={2} w="56" rounded="md">
                  {o.status === "pending" ? (
                    <Menu.Item value="approve" onClick={() => updateOrganizationStatus(o.organisation_id, { status: "approved", note: "Approved by admin" }).then(() => queryClient.invalidateQueries({ queryKey: ["organizations"] }))}>
                      Approve Organization
                    </Menu.Item>
                  ) : (
                    <Menu.Item value="disable" onClick={() => {/* TODO: disable org */}}>
                      Disable Organization
                    </Menu.Item>
                  )}
                  <Menu.Separator />
                  <Menu.Item value="more" onClick={() => {/* TODO: more options */}}>
                    More options
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </HStack>
      ),
    },
  ];

  const cardBg = useColorModeValue("white", "gray.900");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const muted = useColorModeValue("gray.600", "gray.400");
  const iconBg = useColorModeValue("purple.50", "purple.900");
  const iconColor = useColorModeValue("purple.600", "purple.300");

  return (
    <Box w="full">
      <PageHeader
        title="Organizations"
        breadcrumbs={[
          { label: "home", href: "/" },
          { label: "organizations" },
        ]}
        backOnSubPathOf="organizations"
        actions={
          <CreateOrgDialog
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
                <Plus /> Add New Org
              </Button>
            }
            onCreate={(payload) => createOrgMutation.mutateAsync(payload)}
          />
        }
      />

      <Flex h="full" w={"full"} justifyContent={"center"} paddingX={10} mt={6}>
        {isLoading ? (
          <Stack w="full" maxW="6xl" mt={6} gap={4}>
            <Skeleton height="40px" rounded="md" />
            <Box borderWidth="1px" borderColor={cardBorder} rounded="lg" p={4}>
              <Stack gap={3}>
                {[...Array(6)].map((_, i) => (
                  <HStack key={i} gap={3}>
                    <Skeleton height="24px" flex={2} rounded="md" />
                    <Skeleton height="24px" flex={1} rounded="md" />
                    <Skeleton height="24px" flex={1} rounded="md" />
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
              {(error as Error)?.message || "Failed to load organizations"}
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
                <Text fontSize="xl" fontWeight="semibold">No organizations found</Text>
                <Text fontSize="sm" color={muted} maxW="md">
                  Get started by creating your first organization. You can add details like website links and logo.
                </Text>
                <CreateOrgDialog
                  trigger={
                    <Button
                      mt={2}
                      bg={"purple.600"}
                      borderRadius={"6px"}
                      fontSize={"sm"}
                      fontWeight={"semibold"}
                      color={"white"}
                      _hover={{ bg: "purple.500" }}
                      padding={2}
                    >
                      <Plus /> Create a new organization
                    </Button>
                  }
                  onCreate={(payload) => createOrgMutation.mutateAsync(payload)}
                />
              </Stack>
            </Box>
          </Stack>
        ) : (
          <CustomTable data={rows} columns={columns} pageSize={10} />
        )}
      </Flex>

      {/* View Details Dialog */}
      <Dialog.Root open={!!viewOrg} onOpenChange={() => setViewOrg(null)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content p={6} rounded="lg">
              <Dialog.Header>
                <Dialog.Title>Organization details</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {viewOrg && (
                  <Stack gap={2}>
                    <Text><b>Name:</b> {viewOrg.organisation_name}</Text>
                    <Text><b>Status:</b> {viewOrg.status}</Text>
                    <Text><b>Country:</b> {viewOrg.country}</Text>
                    <Text><b>Team size:</b> {viewOrg.sales_team_size}</Text>
                    <Text><b>Created:</b> {viewOrg.created_at}</Text>
                  </Stack>
                )}
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <Button>Close</Button>
                </Dialog.CloseTrigger>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Delete Confirmation handled via reusable AlertDialog per-row */}
    </Box>
  );
};

export default OrganizationsPage;
