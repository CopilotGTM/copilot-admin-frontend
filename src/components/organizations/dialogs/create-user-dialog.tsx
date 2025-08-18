"use client";

import React from "react";
import { Button, CloseButton, Dialog, Portal, Input, Text, Box, Separator, InputGroup, Icon } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserInput } from "../../../app/schemas/users";
import { Mail, User as UserIcon, Briefcase, IdCard } from "lucide-react";

export interface CreateUserDialogProps {
  trigger: React.ReactNode;
  organisationId: string;
  onCreate: (values: CreateUserInput) => Promise<void>;
}

export default function CreateUserDialog({ trigger, organisationId, onCreate }: CreateUserDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid, errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    mode: "onChange",
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      organisation_id: organisationId,
      user_role: "member",
      job_title: "",
      organisation_role: "",
    },
  });

  const onSubmit = async (values: CreateUserInput) => {
    await onCreate(values);
    reset({
      first_name: "",
      last_name: "",
      email: "",
      organisation_id: organisationId,
      user_role: "member",
      job_title: "",
      organisation_role: "",
    });
  };

  const formId = "create-user-form";

  return (
    <Dialog.Root placement="center" scrollBehavior="inside" size={"md"}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content rounded="xl" boxShadow="lg">
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="8px" right="8px" rounded="full" />
            </Dialog.CloseTrigger>

            <Dialog.Header>
              <Dialog.Title fontSize="lg" fontWeight="bold">Add user</Dialog.Title>
            </Dialog.Header>

            <Separator />

            <Dialog.Body>
              <form id={formId} onSubmit={handleSubmit(onSubmit)}>
                <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormControl isRequired>
                    <FormLabel>First name</FormLabel>
                    <InputGroup
                      startElement={
                        <Button disabled variant="ghost" w="48px" h="48px">
                          <Icon as={UserIcon} color="gray.400" />
                        </Button>
                      }
                    >
                      <Input rounded="md" placeholder="Alice" {...register("first_name")} />
                    </InputGroup>
                    {errors.first_name && <Text color="red.500" fontSize="xs">{errors.first_name.message}</Text>}
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Last name</FormLabel>
                    <InputGroup
                      startElement={
                        <Button disabled variant="ghost" w="48px" h="48px">
                          <Icon as={UserIcon} color="gray.400" />
                        </Button>
                      }
                    >
                      <Input rounded="md" placeholder="Doe" {...register("last_name")} />
                    </InputGroup>
                    {errors.last_name && <Text color="red.500" fontSize="xs">{errors.last_name.message}</Text>}
                  </FormControl>

                  <Box gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormControl isRequired>
                      <FormLabel>Email</FormLabel>
                      <InputGroup
                        startElement={
                          <Button disabled variant="ghost" w="48px" h="48px">
                            <Icon as={Mail} color="gray.400" />
                          </Button>
                        }
                      >
                        <Input rounded="md" type="email" placeholder="user@example.com" {...register("email")} />
                      </InputGroup>
                      {errors.email && <Text color="red.500" fontSize="xs">{errors.email.message}</Text>}
                    </FormControl>
                  </Box>

                  <FormControl isRequired>
                    <FormLabel>User role</FormLabel>
                    <Input rounded="md" list="role-options" placeholder="member or admin" {...register("user_role")} />
                    <datalist id="role-options">
                      <option value="member" />
                      <option value="admin" />
                    </datalist>
                    {errors.user_role && <Text color="red.500" fontSize="xs">{errors.user_role.message}</Text>}
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Job title</FormLabel>
                    <InputGroup
                      startElement={
                        <Button disabled variant="ghost" w="48px" h="48px">
                          <Icon as={Briefcase} color="gray.400" />
                        </Button>
                      }
                    >
                      <Input rounded="md" placeholder="Product Manager" {...register("job_title")} />
                    </InputGroup>
                    {errors.job_title && <Text color="red.500" fontSize="xs">{errors.job_title.message}</Text>}
                  </FormControl>

                  <Box gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormControl isRequired>
                      <FormLabel>Organization role</FormLabel>
                      <InputGroup
                        startElement={
                          <Button disabled variant="ghost" w="48px" h="48px">
                            <Icon as={IdCard} color="gray.400" />
                          </Button>
                        }
                      >
                        <Input rounded="md" placeholder="Project Owner" {...register("organisation_role")} />
                      </InputGroup>
                      {errors.organisation_role && <Text color="red.500" fontSize="xs">{errors.organisation_role.message}</Text>}
                    </FormControl>
                  </Box>
                </Box>
              </form>
            </Dialog.Body>

            <Separator />

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button type="submit" form={formId} bg="purple.600" color="white" _hover={{ bg: "purple.500" }} disabled={!isValid} loading={isSubmitting}>
                Create user
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
