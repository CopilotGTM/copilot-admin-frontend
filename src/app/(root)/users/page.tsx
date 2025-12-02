"use client";

import React, { useMemo } from "react";
import { Box, Flex, Text, Button, Stack, Icon, Skeleton, HStack, Badge, IconButton } from "@chakra-ui/react";
import { PageHeader } from "@/components/layout";
import { Column, CustomTable } from "@/components/ui/custom-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listUsers, updateUserAdminStatus } from "@/modules/users/api";
import type { UserListItem, UpdateUserAdminStatusRequest } from "@/modules/users/types";
import { CreateUserDialog } from "@/modules/users/components/dialogs";
import { Plus, SearchX, Eye, Check, Ban } from "lucide-react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { toaster } from "@/components/ui/toaster";

type UserRow = UserListItem & { id: string };

const statusColor: Record<string, string> = {
  ACTIVE: "green",
  INACTIVE: "gray",
  PASSWORD_CHANGE_REQUIRED: "yellow",
};

const adminStatusColor: Record<string, string> = {
  approved: "green",
  pending: "yellow",
  rejected: "red",
  suspended: "orange",
  deactivated: "gray",
};

export default function UsersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["users", { limit: 50 }],
    queryFn: () => listUsers({ limit: 50 }),
  });

  const updateStatusMutation = useMutation<unknown, Error, { id: string; payload: UpdateUserAdminStatusRequest }>({
    mutationFn: ({ id, payload }) => updateUserAdminStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toaster.create({ title: "User status updated", duration: 2000 });
    },
    onError: (err) => {
      toaster.create({
        title: "Update failed",
        description: err.message,
        type: "error",
        duration: 2500,
      });
    },
  });

  const rows: UserRow[] = useMemo(
    () => (data?.users || []).map((u) => ({ ...u, id: u.user_id })),
    [data],
  );

  const columns: Column<UserRow>[] = [
    {
      header: "Name",
      key: "first_name",
      render: (u) => (
        <Text fontWeight="medium">
          {u.first_name} {u.last_name}
        </Text>
      ),
    },
    { header: "Email", key: "email" },
    { header: "Org Role", key: "organisation_role" },
    {
      header: "Status",
      key: "status",
      render: (u) => (
        <Badge colorPalette={statusColor[u.status] || "gray"} variant="subtle" rounded="md">
          {u.status}
        </Badge>
      ),
    },
    {
      header: "Admin Status",
      key: "admin_status",
      render: (u) => (
        <Badge colorPalette={adminStatusColor[u.admin_status] || "gray"} variant="subtle" rounded="md">
          {u.admin_status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      key: "user_id",
      render: (u) => (
        <HStack gap={1}>
          {u.admin_status === "pending" && (
            <>
              <IconButton
                aria-label="Approve"
                title="Approve"
                colorPalette="green"
                size="sm"
                onClick={() => updateStatusMutation.mutate({ id: u.user_id, payload: { admin_status: "approved" } })}
              >
                <Check />
              </IconButton>
              <IconButton
                aria-label="Reject"
                title="Reject"
                colorPalette="red"
                size="sm"
                onClick={() => updateStatusMutation.mutate({ id: u.user_id, payload: { admin_status: "rejected" } })}
              >
                <Ban />
              </IconButton>
            </>
          )}
          <IconButton aria-label="View" title="View" size="sm" variant="ghost">
            <Eye />
          </IconButton>
        </HStack>
      ),
    },
  ];

  const cardBg = useColorModeValue("white", "gray.900");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const iconBg = useColorModeValue("purple.50", "purple.900");
  const iconColor = useColorModeValue("purple.600", "purple.300");

  return (
    <Box w="full">
      <PageHeader
        title="Users"
        breadcrumbs={[
          { label: "home", href: "/" },
          { label: "users" },
        ]}
        backOnSubPathOf="users"
        actions={
          <CreateUserDialog
            trigger={
              <Button
                bg="purple.600"
                borderRadius="6px"
                fontSize="sm"
                fontWeight="semibold"
                color="white"
                _hover={{ bg: "purple.500" }}
                padding={2}
              >
                <Plus /> Add New User
              </Button>
            }
          />
        }
      />

      <Flex h="full" w="full" justifyContent="center" paddingX={10} mt={6}>
        {isLoading ? (
          <Stack w="full" maxW="6xl" mt={6} gap={4}>
            <Skeleton height="40px" rounded="md" />
            <Box borderWidth="1px" borderColor={cardBorder} rounded="lg" p={4}>
              <Stack gap={3}>
                {["a", "b", "c", "d", "e", "f"].map((key) => (
                  <HStack key={key} gap={3}>
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
        ) : null}
        {!isLoading && isError ? (
          <Stack align="center" justify="center" py={16} gap={4} textAlign="center">
            <Text fontSize="lg" color="red.500">
              {error?.message || "Failed to load users"}
            </Text>
            <Button onClick={() => refetch()}>Retry</Button>
          </Stack>
        ) : null}
        {!isLoading && !isError && rows.length === 0 ? (
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
                <Text fontSize="xl" fontWeight="semibold">No users found</Text>
                <Text fontSize="sm" color="gray.500" maxW="md">
                  Get started by creating your first user.
                </Text>
                <CreateUserDialog
                  trigger={
                    <Button
                      mt={2}
                      bg="purple.600"
                      borderRadius="6px"
                      fontSize="sm"
                      fontWeight="semibold"
                      color="white"
                      _hover={{ bg: "purple.500" }}
                      padding={2}
                    >
                      <Plus /> Create a new user
                    </Button>
                  }
                />
              </Stack>
            </Box>
          </Stack>
        ) : (
          <CustomTable data={rows} columns={columns} pageSize={10} />
        )}
      </Flex>
    </Box>
  );
}
