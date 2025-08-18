"use client";

import React from "react";
import {
  Button,
  CloseButton,
  Dialog,
  Portal,
  Text,
  HStack,
  Image,
  Box,
  Separator,
  Badge,
  Icon,
  Stack,
  Link,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Globe, Link2, Image as ImageIcon } from "lucide-react";
import type { OrganizationListItem } from "../../../lib/organizations";
import { format } from "date-fns";

export interface ViewOrgDialogProps {
  trigger: React.ReactNode;
  org: OrganizationListItem;
}

const statusColor: Record<OrganizationListItem["status"], string> = {
  pending: "yellow",
  approved: "green",
  rejected: "red",
  suspended: "orange",
  deactivated: "gray",
};

function formatDate(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return format(d, "PPpp");
}

export default function ViewOrgDialog({ trigger, org }: ViewOrgDialogProps) {
  return (
    <Dialog.Root placement="center" scrollBehavior="inside" size={"xl"} motionPreset="slide-in-bottom">
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content display="flex" flexDirection="column" maxH={{ base: "85vh", md: "80vh" }} rounded="xl" boxShadow="lg">
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="8px" right="8px" rounded="full" />
            </Dialog.CloseTrigger>

            <Dialog.Header>
              <Stack gap={1}>
                <Dialog.Title fontSize="lg" fontWeight="bold" lineHeight="28px" color="gray.700">
                  Organization details
                </Dialog.Title>
                <Text fontSize="sm" color="gray.500">
                  View all fields for {org.organisation_name}
                </Text>
              </Stack>
            </Dialog.Header>

            <Separator />

            <Dialog.Body flex="1 1 auto" overflowY="auto">
              <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                <FormControl>
                  <FormLabel>ID</FormLabel>
                  <Text fontWeight="semibold">{org.organisation_id}</Text>
                </FormControl>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Badge colorPalette={statusColor[org.status]} variant="subtle" rounded="md" textTransform="capitalize">
                    {org.status}
                  </Badge>
                </FormControl>

                <FormControl>
                  <FormLabel>Organization Name</FormLabel>
                  <Text fontWeight="semibold">{org.organisation_name}</Text>
                </FormControl>
                <FormControl>
                  <FormLabel>Country</FormLabel>
                  <Text fontWeight="semibold">{org.country}</Text>
                </FormControl>

                <FormControl>
                  <FormLabel>Sales team size</FormLabel>
                  <Text fontWeight="semibold">{org.sales_team_size}</Text>
                </FormControl>
                <FormControl>
                  <FormLabel>Active</FormLabel>
                  <Text fontWeight="semibold">{org.is_active ? "Yes" : "No"}</Text>
                </FormControl>

                <FormControl>
                  <FormLabel>Company address</FormLabel>
                  <Text fontWeight="semibold">{org.company_address}</Text>
                </FormControl>
                <FormControl>
                  <FormLabel>Billing address</FormLabel>
                  <Text fontWeight="semibold">{org.billing_address}</Text>
                </FormControl>

                <Box gridColumn={{ base: "auto", md: "1 / -1" }}>
                  <FormControl>
                    <FormLabel display="flex" alignItems="center" gap={2}>
                      <Icon as={Link2} /> Linked URLs
                    </FormLabel>
                    {org.linked_urls && org.linked_urls.length > 0 ? (
                      <HStack gap={2} flexWrap="wrap">
                        {org.linked_urls.map((u, idx) => (
                          <Badge key={`${u}-${idx}`} variant="subtle" colorPalette="purple" px={2} py={1} rounded="md">
                            <Link href={u} target="_blank" rel="noopener noreferrer">
                              {u}
                            </Link>
                          </Badge>
                        ))}
                      </HStack>
                    ) : (
                      <Text color="gray.500">—</Text>
                    )}
                  </FormControl>
                </Box>

                <Box gridColumn={{ base: "auto", md: "1 / -1" }}>
                  <FormControl>
                    <FormLabel display="flex" alignItems="center" gap={2}>
                      <Icon as={Globe} /> Website URLs
                    </FormLabel>
                    {org.website_urls && org.website_urls.length > 0 ? (
                      <HStack gap={2} flexWrap="wrap">
                        {org.website_urls.map((u, idx) => (
                          <Badge key={`${u}-${idx}`} variant="subtle" colorPalette="gray" px={2} py={1} rounded="md">
                            <Link href={u} target="_blank" rel="noopener noreferrer">
                              {u}
                            </Link>
                          </Badge>
                        ))}
                      </HStack>
                    ) : (
                      <Text color="gray.500">—</Text>
                    )}
                  </FormControl>
                </Box>

                <Box gridColumn={{ base: "auto", md: "1 / -1" }}>
                  <FormControl>
                    <FormLabel>Summary</FormLabel>
                    <Text fontWeight="semibold" whiteSpace="pre-wrap">{org.summary || "—"}</Text>
                  </FormControl>
                </Box>

                <Box gridColumn={{ base: "auto", md: "1 / -1" }}>
                  <FormControl>
                    <FormLabel display="flex" alignItems="center" gap={2}>
                      <Icon as={ImageIcon} /> Logo
                    </FormLabel>
                    {org.logo_url ? (
                      <Box borderWidth="1px" rounded="lg" p={2} maxW="220px">
                        <Image src={org.logo_url} alt="Logo" width="200px" height="auto" />
                      </Box>
                    ) : (
                      <Text color="gray.500">—</Text>
                    )}
                  </FormControl>
                </Box>

                <FormControl>
                  <FormLabel>Created at</FormLabel>
                  <Text fontWeight="semibold">{formatDate(org.created_at)}</Text>
                </FormControl>
                <FormControl>
                  <FormLabel>Updated at</FormLabel>
                  <Text fontWeight="semibold">{formatDate(org.updated_at)}</Text>
                </FormControl>
              </Box>
            </Dialog.Body>

            <Separator />

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" p={4} rounded="md">
                  Close
                </Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
