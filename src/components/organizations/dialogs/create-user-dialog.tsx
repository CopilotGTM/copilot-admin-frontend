"use client";

import React from "react";
import {
  Button,
  CloseButton,
  Dialog,
  Portal,
  Input,
  Text,
  Box,
  Separator,
  InputGroup,
  Icon,
  createListCollection,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserInput } from "@/modules/users/schemas";
import { Mail, User as UserIcon, Briefcase, IdCard, Shield } from "lucide-react";

export interface CreateUserDialogProps {
  trigger: React.ReactNode;
  organisationId: string;
  onCreate: (values: CreateUserInput) => Promise<void>;
}

export default function CreateUserDialog({ trigger, organisationId, onCreate }: Readonly<CreateUserDialogProps>) {
  const {
    register,
    handleSubmit,
    reset,
    control,
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

  const roleCollection = createListCollection({
    items: [
      { label: "Member", value: "member", description: "Standard user access" },
      { label: "Admin", value: "admin", description: "Full administrative access" },
    ],
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
                      startElement={<Icon as={UserIcon} color="gray.400" boxSize={4} ms={3} />}
                    >
                      <Input rounded="md" ps={10} placeholder="Alice" {...register("first_name")} />
                    </InputGroup>
                    {errors.first_name && <Text color="red.500" fontSize="xs">{errors.first_name.message}</Text>}
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Last name</FormLabel>
                    <InputGroup
                      startElement={<Icon as={UserIcon} color="gray.400" boxSize={4} ms={3} />}
                    >
                      <Input rounded="md" ps={10} placeholder="Doe" {...register("last_name")} />
                    </InputGroup>
                    {errors.last_name && <Text color="red.500" fontSize="xs">{errors.last_name.message}</Text>}
                  </FormControl>

                  <Box gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormControl isRequired>
                      <FormLabel>Email</FormLabel>
                      <InputGroup
                        startElement={<Icon as={Mail} color="gray.400" boxSize={4} ms={3} />}
                      >
                        <Input rounded="md" ps={10} type="email" placeholder="user@example.com" {...register("email")} />
                      </InputGroup>
                      {errors.email && <Text color="red.500" fontSize="xs">{errors.email.message}</Text>}
                    </FormControl>
                  </Box>

                  <Controller
                    control={control}
                    name="user_role"
                    render={({ field }) => (
                      <FormControl isRequired>
                        <FormLabel>App role</FormLabel>
                        <SelectRoot
                          collection={roleCollection}
                          name={field.name}
                          value={field.value ? [field.value] : []}
                          onValueChange={(details: { value: string[] }) => field.onChange(details.value[0])}
                        >
                          <SelectTrigger ps={3}>
                            <Box display="flex" alignItems="center" gap={2} flex={1}>
                              <Icon as={Shield} color="gray.400" boxSize={4} flexShrink={0} />
                              <SelectValueText placeholder="Select role" />
                            </Box>
                          </SelectTrigger>
                          <SelectContent>
                            {roleCollection.items.map((role) => (
                              <SelectItem item={role} key={role.value} px={3} py={2}>
                                <Box>
                                  <Text fontWeight="medium">{role.label}</Text>
                                  <Text fontSize="xs" color="gray.500">{role.description}</Text>
                                </Box>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </SelectRoot>
                        {errors.user_role && <Text color="red.500" fontSize="xs">{errors.user_role.message}</Text>}
                      </FormControl>
                    )}
                  />

                  <FormControl>
                    <FormLabel>Job title (optional)</FormLabel>
                    <InputGroup
                      startElement={<Icon as={Briefcase} color="gray.400" boxSize={4} ms={3} />}
                    >
                      <Input rounded="md" ps={10} placeholder="Product Manager" {...register("job_title")} />
                    </InputGroup>
                    {errors.job_title && <Text color="red.500" fontSize="xs">{errors.job_title.message}</Text>}
                  </FormControl>

                  <Box gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormControl isRequired>
                      <FormLabel>Organization role</FormLabel>
                      <InputGroup
                        startElement={<Icon as={IdCard} color="gray.400" boxSize={4} ms={3} />}
                      >
                        <Input rounded="md" ps={10} placeholder="Project Owner" {...register("organisation_role")} />
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
