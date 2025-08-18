"use client";

import React from "react";
import { Button, CloseButton, Dialog, Portal, Text, Box, Separator, Stack, Badge } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import type { UserListItem } from "../../../lib/org-member";

export interface ViewUserDialogProps {
  trigger: React.ReactNode;
  user: UserListItem;
}

export default function ViewUserDialog({ trigger, user }: ViewUserDialogProps) {
  return (
    <Dialog.Root placement="center" scrollBehavior="inside" size={"md"}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content p={6} rounded="xl" boxShadow="lg">
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="8px" right="8px" rounded="full" />
            </Dialog.CloseTrigger>

            <Dialog.Header>
              <Dialog.Title fontSize="lg" fontWeight="bold">User details</Dialog.Title>
            </Dialog.Header>

            <Separator />

            <Dialog.Body>
              <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Text fontWeight="semibold">{user.first_name} {user.last_name}</Text>
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Text fontWeight="semibold">{user.email}</Text>
                </FormControl>

                <FormControl>
                  <FormLabel>Role</FormLabel>
                  <Text fontWeight="semibold">{user.organisation_role}</Text>
                </FormControl>
                <FormControl>
                  <FormLabel>Job title</FormLabel>
                  <Text fontWeight="semibold">{user.job_title}</Text>
                </FormControl>

                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Stack direction="row" gap={2}>
                    <Badge variant="subtle">{user.status}</Badge>
                    <Badge variant="subtle">{user.admin_status}</Badge>
                  </Stack>
                </FormControl>
              </Box>
            </Dialog.Body>

            <Separator />

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Close</Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
