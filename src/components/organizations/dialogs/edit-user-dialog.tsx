"use client";

import React from "react";
import { Button, CloseButton, Dialog, Portal, Input, Box, Separator, InputGroup, Icon } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User as UserIcon, Briefcase, IdCard } from "lucide-react";
import type { UserListItem, UpdateUserDetailsRequest } from "@/modules/users/types";

const editUserSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  job_title: z.string().min(1),
  organisation_role: z.string().min(1),
});

type EditUserInput = z.infer<typeof editUserSchema>;

export interface EditUserDialogProps {
  trigger: React.ReactNode;
  user: UserListItem;
  onUpdate: (user_id: string, payload: UpdateUserDetailsRequest) => Promise<void>;
}

export default function EditUserDialog({ trigger, user, onUpdate }: Readonly<EditUserDialogProps>) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm<EditUserInput>({
    resolver: zodResolver(editUserSchema),
    mode: "onChange",
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      job_title: user.job_title,
      organisation_role: user.organisation_role,
    },
  });

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
              <Dialog.Title fontSize="lg" fontWeight="bold">Edit user</Dialog.Title>
            </Dialog.Header>

            <Separator />

            <Dialog.Body>
              <form
                onSubmit={handleSubmit(async (values) => {
                  await onUpdate(user.user_id, values);
                })}
              >
                <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormControl isRequired>
                    <FormLabel>First name</FormLabel>
                    <InputGroup startElement={<Button disabled variant="ghost" w="48px" h="48px"><Icon as={UserIcon} color="gray.400" /></Button>}>
                      <Input rounded="md" placeholder="Alice" {...register("first_name")} />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Last name</FormLabel>
                    <InputGroup startElement={<Button disabled variant="ghost" w="48px" h="48px"><Icon as={UserIcon} color="gray.400" /></Button>}>
                      <Input rounded="md" placeholder="Doe" {...register("last_name")} />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Job title</FormLabel>
                    <InputGroup startElement={<Button disabled variant="ghost" w="48px" h="48px"><Icon as={Briefcase} color="gray.400" /></Button>}>
                      <Input rounded="md" placeholder="Product Manager" {...register("job_title")} />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Organization role</FormLabel>
                    <InputGroup startElement={<Button disabled variant="ghost" w="48px" h="48px"><Icon as={IdCard} color="gray.400" /></Button>}>
                      <Input rounded="md" placeholder="Project Owner" {...register("organisation_role")} />
                    </InputGroup>
                  </FormControl>
                </Box>

                <Separator my={4} />

                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </Dialog.ActionTrigger>
                  <Button type="submit" bg="purple.600" color="white" _hover={{ bg: "purple.500" }} disabled={!isValid} loading={isSubmitting}>
                    Save changes
                  </Button>
                </Dialog.Footer>
              </form>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
