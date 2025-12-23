"use client";

import React, { useState } from "react";
import {
  Button,
  CloseButton,
  Dialog,
  Portal,
  Text,
  HStack,
  Box,
  Separator,
  Textarea,
  Stack,
  Icon,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { 
  CheckCircle2, 
  XCircle, 
  PauseCircle, 
  PlayCircle, 
  Ban,
  AlertTriangle,
} from "lucide-react";
import type { OrganizationListItem, OrganizationStatus } from "@/modules/organizations/types";
import { useUpdateOrganizationStatus } from "@/modules/organizations/hooks";
import { toaster } from "@/components/ui/toaster";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type StatusAction = "approve" | "reject" | "suspend" | "reinstate" | "deactivate";

interface ActionConfig {
  targetStatus: OrganizationStatus;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  confirmText: string;
}

const ACTION_CONFIG: Record<StatusAction, ActionConfig> = {
  approve: {
    targetStatus: "approved",
    label: "Approve Organization",
    description: "This organization will be activated and users can access it.",
    icon: CheckCircle2,
    color: "green",
    confirmText: "Approve",
  },
  reject: {
    targetStatus: "rejected",
    label: "Reject Organization",
    description: "This organization will be rejected and cannot be used. This action is final.",
    icon: XCircle,
    color: "red",
    confirmText: "Reject",
  },
  suspend: {
    targetStatus: "suspended",
    label: "Suspend Organization",
    description: "This organization will be temporarily suspended. Users will lose access until reinstated.",
    icon: PauseCircle,
    color: "orange",
    confirmText: "Suspend",
  },
  reinstate: {
    targetStatus: "approved",
    label: "Reinstate Organization",
    description: "This organization will be reinstated and users will regain access.",
    icon: PlayCircle,
    color: "green",
    confirmText: "Reinstate",
  },
  deactivate: {
    targetStatus: "deactivated",
    label: "Deactivate Organization",
    description: "This organization will be permanently deactivated. This action cannot be undone.",
    icon: Ban,
    color: "red",
    confirmText: "Deactivate",
  },
};

// Get valid actions based on current status
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

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export interface StatusChangeDialogProps {
  org: OrganizationListItem;
  action: StatusAction;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function StatusChangeDialog({ 
  org, 
  action, 
  isOpen,
  onClose,
  onSuccess 
}: Readonly<StatusChangeDialogProps>) {
  const [note, setNote] = useState("");
  
  const updateStatusMutation = useUpdateOrganizationStatus();
  const config = ACTION_CONFIG[action];

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
        title: `Organization ${config.confirmText.toLowerCase()}d`,
        description: `${org.organisation_name} has been ${config.confirmText.toLowerCase()}d successfully.`,
        type: "success",
        duration: 3000,
      });

      onClose();
      setNote("");
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

  const isDestructive = action === "reject" || action === "deactivate";

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) {
          onClose();
          setNote("");
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="md" rounded="xl" boxShadow="lg">
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="8px" right="8px" rounded="full" />
            </Dialog.CloseTrigger>

            <Dialog.Header>
              <HStack gap={3}>
                <Box
                  p={2}
                  rounded="full"
                  bg={`${config.color}.100`}
                  _dark={{ bg: `${config.color}.900` }}
                >
                  <Icon 
                    as={config.icon} 
                    boxSize={6} 
                    color={`${config.color}.600`}
                    _dark={{ color: `${config.color}.300` }}
                  />
                </Box>
                <Stack gap={0}>
                  <Dialog.Title fontSize="lg" fontWeight="bold">
                    {config.label}
                  </Dialog.Title>
                  <Text fontSize="sm" color="gray.500">
                    {org.organisation_name}
                  </Text>
                </Stack>
              </HStack>
            </Dialog.Header>

            <Separator />

            <Dialog.Body py={4}>
              <Stack gap={4}>
                {/* Warning for destructive actions */}
                {isDestructive && (
                  <HStack 
                    gap={3} 
                    p={3} 
                    bg="red.50" 
                    _dark={{ bg: "red.900", borderColor: "red.700" }} 
                    rounded="lg"
                    borderWidth="1px"
                    borderColor="red.200"
                  >
                    <Icon as={AlertTriangle} boxSize={5} color="red.500" />
                    <Text fontSize="sm" color="red.700" _dark={{ color: "red.200" }}>
                      This action cannot be undone.
                    </Text>
                  </HStack>
                )}

                <Text color="gray.600" _dark={{ color: "gray.300" }}>
                  {config.description}
                </Text>

                <FormControl>
                  <FormLabel>Note (optional)</FormLabel>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note for the audit trail..."
                    rows={3}
                    rounded="md"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    This note will be recorded in the organization&apos;s history.
                  </Text>
                </FormControl>
              </Stack>
            </Dialog.Body>

            <Separator />

            <Dialog.Footer gap={3}>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={updateStatusMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                colorPalette={isDestructive ? "red" : config.color}
                onClick={handleConfirm}
                loading={updateStatusMutation.isPending}
              >
                {config.confirmText}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

// Export helper for getting valid actions
export { getValidActions, type StatusAction };
