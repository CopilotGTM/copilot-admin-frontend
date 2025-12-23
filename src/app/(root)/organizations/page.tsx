"use client";

import React, { useMemo, useEffect, useRef, useState } from "react";
import { Box, Text, Button, Stack, Icon, Skeleton, HStack, Badge, IconButton, Menu, Portal, Separator } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { PageHeader } from "@/components/layout";
import { Column, CustomTable } from "@/components/ui/custom-table";
import { useOrganisationHistory } from "@/modules/organizations/hooks";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  listOrganizations, 
  updateOrganization, 
  streamJobStatus,
  type JobStreamController,
} from "@/modules/organizations/api";
import type { 
  OrganizationListItem, 
  UpdateOrganizationRequest, 
  OrganizationDetail,
  JobStatusEvent,
} from "@/modules/organizations/types";
import useAuthStore from "@/modules/auth/store/auth.store";
import { CreateOrgDialog } from "@/components/organizations/dialogs/create-org-dialog";
import { Plus, SearchX, Eye, Pencil, MoreVertical, CheckCircle2, XCircle, PauseCircle, PlayCircle, Ban } from "lucide-react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { formatDateShort } from "@/lib/utils/format-date";
import { useRouter } from "next/navigation";
import ViewOrgDialog from "@/components/organizations/dialogs/view-org-dialog";
import EditOrgDialog from "@/components/organizations/dialogs/edit-org-dialog";
import { StatusChangeDialog, getValidActions, type StatusAction } from "@/components/organizations/dialogs/status-change-dialog";

// ─────────────────────────────────────────────────────────────────────────────
// Actions Cell Component (handles dialog state outside menu)
// ─────────────────────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<StatusAction, { icon: React.ElementType; label: string; color: string }> = {
  approve: { icon: CheckCircle2, label: "Approve", color: "green.600" },
  reject: { icon: XCircle, label: "Reject", color: "red.600" },
  suspend: { icon: PauseCircle, label: "Suspend", color: "orange.600" },
  reinstate: { icon: PlayCircle, label: "Reinstate", color: "green.600" },
  deactivate: { icon: Ban, label: "Deactivate", color: "red.600" },
};

function ActionsCell({ org, onUpdate, onStatusChange }: { 
  org: OrgRow; 
  onUpdate: (id: string, payload: UpdateOrganizationRequest) => Promise<OrganizationDetail>;
  onStatusChange: () => void;
}) {
  const router = useRouter();
  const [selectedAction, setSelectedAction] = useState<StatusAction | null>(null);
  const validActions = getValidActions(org.status);

  return (
    <>
      <HStack gap={0}>
        <ViewOrgDialog
          org={org}
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
        <EditOrgDialog
          org={org}
          onUpdate={onUpdate}
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

        {validActions.length > 0 && (
          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton
                aria-label="More actions"
                variant="ghost"
                size="sm"
                rounded="md"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={16} />
              </IconButton>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content minW="180px" rounded="lg" shadow="lg" p={1}>
                  {validActions.map((action) => {
                    const config = ACTION_LABELS[action];
                    return (
                      <Menu.Item 
                        key={action} 
                        value={action}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAction(action);
                        }}
                        rounded="md"
                        px={3}
                        py={2}
                      >
                        <HStack gap={2}>
                          <Icon as={config.icon} boxSize={4} color={config.color} />
                          <Text fontSize="sm">{config.label}</Text>
                        </HStack>
                      </Menu.Item>
                    );
                  })}
                  
                  <Menu.Separator my={1} />
                  
                  <Menu.Item 
                    value="view-details" 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/organizations/${org.organisation_id}`);
                    }}
                    rounded="md"
                    px={3}
                    py={2}
                  >
                    <Text fontSize="sm">View Details</Text>
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        )}
      </HStack>

      {/* Dialog rendered outside the menu */}
      {selectedAction && (
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
      )}
    </>
  );
}

type OrgRow = OrganizationListItem & { id: string };

// Refined status color palette
const statusConfig: Record<OrgRow["status"], { color: string; bg: string; darkBg: string }> = {
  pending: { color: "orange", bg: "orange.50", darkBg: "orange.900" },
  approved: { color: "green", bg: "green.50", darkBg: "green.900" },
  rejected: { color: "red", bg: "red.50", darkBg: "red.900" },
  suspended: { color: "orange", bg: "orange.50", darkBg: "orange.900" },
  deactivated: { color: "gray", bg: "gray.100", darkBg: "gray.800" },
  provisioning: { color: "blue", bg: "blue.50", darkBg: "blue.900" },
  failed: { color: "red", bg: "red.50", darkBg: "red.900" },
};

const historyActionPalette: Partial<Record<string, string>> = {
  created: "blue",
  approved: "green",
  rejected: "red",
  suspended: "orange",
  reinstated: "green",
  status_changed: "purple",
  field_changed: "gray",
  user_added: "blue",
  user_removed: "orange",
  role_changed: "purple",
  note_added: "gray",
  system_migration: "blue",
  deleted: "red",
};

export default function OrganizationsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Cursor-based pagination state
  const PAGE_SIZE = 20;
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]); // stack of previous cursors

  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

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
    () => (data?.organizations || []).map((o) => ({ ...o, id: o.organisation_id })),
    [data],
  );

  // Default selection: pick the first org on the current page.
  useEffect(() => {
    if (rows.length === 0) {
      setSelectedOrgId(null);
      return;
    }
    if (!selectedOrgId || !rows.some((r) => r.organisation_id === selectedOrgId)) {
      setSelectedOrgId(rows[0].organisation_id);
    }
  }, [rows, selectedOrgId]);

  const selectedOrg = useMemo(
    () => rows.find((r) => r.organisation_id === selectedOrgId) ?? null,
    [rows, selectedOrgId],
  );

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
  } = useOrganisationHistory(selectedOrgId ?? "", { limit: 20 });

  // ─────────────────────────────────────────────────────────────────────────────
  // Live job progress via SSE
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Track live job updates (jobId -> latest status event)
  const [liveJobProgress, setLiveJobProgress] = useState<Map<string, JobStatusEvent>>(new Map());
  const jobStreamsRef = useRef<Map<string, JobStreamController>>(new Map());

  // Find rows with active jobs that need streaming
  const activeJobIds = useMemo(() => {
    return rows
      .filter((r) => r.active_job && (r.active_job.status === "pending" || r.active_job.status === "in_progress"))
      .map((r) => r.active_job!.job_id);
  }, [rows]);

  useEffect(() => {
    const currentStreams = jobStreamsRef.current;
    const newJobIds = new Set(activeJobIds);

    // Stop streams for jobs no longer in the list
    for (const [jobId, controller] of currentStreams.entries()) {
      if (!newJobIds.has(jobId)) {
        controller.abort();
        currentStreams.delete(jobId);
      }
    }

    // Start streams for new active jobs
    for (const jobId of activeJobIds) {
      if (currentStreams.has(jobId)) continue;

      const streamUrl = `/organisations/jobs/${jobId}/stream`;
      const controller = streamJobStatus(
        streamUrl,
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
            // Job finished - invalidate list to get updated org status
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

    // Cleanup on unmount
    return () => {
      for (const controller of currentStreams.values()) {
        controller.abort();
      }
      currentStreams.clear();
    };
  }, [activeJobIds, queryClient]);

  // Merge live progress into rows for display
  const rowsWithLiveProgress: OrgRow[] = useMemo(() => {
    return rows.map((row) => {
      if (!row.active_job) return row;
      const liveEvent = liveJobProgress.get(row.active_job.job_id);
      if (!liveEvent) return row;
      // Merge live data into active_job
      return {
        ...row,
        active_job: {
          ...row.active_job,
          status: liveEvent.status,
          progress: liveEvent.progress,
          status_message: liveEvent.status_message,
        },
      };
    });
  }, [rows, liveJobProgress]);

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
      render: (o) => {
        const hasActiveJob = o.active_job && (o.active_job.status === "in_progress" || o.active_job.status === "pending");
        const progress = o.active_job?.progress ?? 0;
        const statusMessage = o.active_job?.status_message ?? "Provisioning...";
        const config = statusConfig[o.status];
        
        // For orgs without active jobs - just show status badge
        if (!hasActiveJob) {
          return (
            <Badge 
              colorPalette={config.color} 
              variant="subtle" 
              rounded="full" 
              px={3} 
              py={1}
              fontSize="xs"
              fontWeight="semibold"
              textTransform="capitalize"
            >
              {o.status}
            </Badge>
          );
        }
        
        // For orgs with active jobs - show status + animated progress indicator
        return (
          <Tooltip content={`${statusMessage} (${progress}%)`} positioning={{ placement: "top" }}>
            <HStack gap={2}>
              <Badge 
                colorPalette={config.color} 
                variant="subtle" 
                rounded="full" 
                px={3} 
                py={1}
                fontSize="xs"
                fontWeight="semibold"
                textTransform="capitalize"
              >
                {o.status}
              </Badge>
              <HStack 
                gap={1.5} 
                bg="blue.50" 
                _dark={{ bg: "blue.900", borderColor: "blue.700" }} 
                px={2.5} 
                py={1} 
                rounded="full"
                borderWidth="1px"
                borderColor="blue.200"
              >
                <Box 
                  w="6px" 
                  h="6px" 
                  rounded="full" 
                  bg="blue.500"
                  css={{
                    animation: "pulse 1.5s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%, 100%": { opacity: 1, transform: "scale(1)" },
                      "50%": { opacity: 0.5, transform: "scale(0.8)" },
                    },
                  }}
                />
                <Text fontSize="xs" fontWeight="semibold" color="blue.600" _dark={{ color: "blue.300" }}>
                  {progress}%
                </Text>
              </HStack>
            </HStack>
          </Tooltip>
        );
      },
    },
    {
      header: "Created",
      key: "created_at",
      render: (o) => (
        <Text fontSize="sm" color={muted}>
          {formatDateShort(o.created_at)}
        </Text>
      ),
    },
    {
      header: "Actions",
      key: "actions" as keyof OrgRow,
      render: (o) => (
        <ActionsCell 
          org={o} 
          onUpdate={(id, payload) => updateOrgMutation.mutateAsync({ id, payload })}
          onStatusChange={() => queryClient.invalidateQueries({ queryKey: ["organizations"] })}
        />
      ),
    },
  ];

  const cardBg = useColorModeValue("white", "gray.900");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const muted = useColorModeValue("gray.600", "gray.400");
  const iconBg = useColorModeValue("purple.50", "purple.900");
  const iconColor = useColorModeValue("purple.600", "purple.300");
  const panelBg = useColorModeValue("white", "gray.900");
  const panelBorder = useColorModeValue("gray.200", "gray.700");

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
          />
        }
      />

      <Box w="full" maxW="7xl" mx="auto" px={{ base: 4, md: 10 }} mt={6}>
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
        ) : isError ? (
          <Stack align="center" justify="center" py={16} gap={4} textAlign="center">
            <Text fontSize="lg" color="red.500">
              {error?.message || "Failed to load organizations"}
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
                />
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
            <Stack flex="1" minW={0} gap={6}>
              <CustomTable
                data={rowsWithLiveProgress}
                columns={columns}
                pageSize={PAGE_SIZE}
                hidePagination
                selectedRowId={selectedOrgId ?? undefined}
                onRowClick={(row) => setSelectedOrgId(String(row.id))}
              />

              {/* Cursor-based pagination controls */}
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" color={muted}>
                  Showing {rowsWithLiveProgress.length} organization{rowsWithLiveProgress.length !== 1 ? "s" : ""}
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
                  <HStack justify="space-between" align="center" gap={3}>
                    <Text fontSize="sm" color={muted} lineClamp={1}>
                      {selectedOrg ? selectedOrg.organisation_name : "Select an organization"}
                    </Text>
                    {selectedOrg ? (
                      <Badge
                        colorPalette={statusConfig[selectedOrg.status].color}
                        variant="subtle"
                        rounded="full"
                        px={2}
                        py={0.5}
                        textTransform="capitalize"
                        flexShrink={0}
                      >
                        {selectedOrg.status}
                      </Badge>
                    ) : null}
                  </HStack>
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
