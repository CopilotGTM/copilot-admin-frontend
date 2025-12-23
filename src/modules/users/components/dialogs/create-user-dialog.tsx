"use client";

import {
  Dialog,
  Button,
  Stack,
  Input,
  Portal,
  CloseButton,
  createListCollection,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from "@chakra-ui/react";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/form-control";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../../api";
import { CreateUserInput, createUserSchema } from "@/app/schemas/users";
import { listOrganizations } from "@/modules/organizations/api";
import { useState } from "react";
import { toaster } from "@/components/ui/toaster";

interface CreateUserDialogProps {
  readonly trigger: React.ReactNode;
}

export function CreateUserDialog({ trigger }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      user_role: "member",
    },
  });

  // Fetch organizations for the dropdown
  const { data: orgData } = useQuery({
    queryKey: ["organizations-list"],
    queryFn: () => listOrganizations({ limit: 100 }),
  });

  const orgCollection = createListCollection({
    items: orgData?.organizations || [],
    itemToString: (item) => item.organisation_name,
    itemToValue: (item) => item.organisation_id,
  });

  const roleCollection = createListCollection({
    items: [
      { label: "Member", value: "member" },
      { label: "Admin", value: "admin" },
    ],
  });

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toaster.create({
        title: "User created successfully",
        type: "success",
      });
      setOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toaster.create({
        title: "Failed to create user",
        description: error?.message || "Unknown error",
        type: "error",
      });
    },
  });

  const onSubmit = (data: CreateUserInput) => {
    mutation.mutate(data);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(details: { open: boolean }) => setOpen(details.open)}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="8px" right="8px" rounded="full" />
            </Dialog.CloseTrigger>
            <Dialog.Header>
              <Dialog.Title>Create New User</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Stack direction="row" gap={4}>
                  <FormControl isInvalid={!!errors.first_name}>
                    <FormLabel>First Name</FormLabel>
                    <Input {...register("first_name")} placeholder="Jane" />
                    <FormErrorMessage>
                      {errors.first_name?.message}
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.last_name}>
                    <FormLabel>Last Name</FormLabel>
                    <Input {...register("last_name")} placeholder="Doe" />
                    <FormErrorMessage>
                      {errors.last_name?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Stack>

                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="jane@example.com"
                  />
                  <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>

                <Controller
                  control={control}
                  name="organisation_id"
                  render={({ field }) => (
                    <FormControl isInvalid={!!errors.organisation_id}>
                      <FormLabel>Organization</FormLabel>
                      <SelectRoot
                        collection={orgCollection}
                        name={field.name}
                        value={field.value ? [field.value] : []}
                        onValueChange={(details: { value: string[] }) => field.onChange(details.value[0])}
                      >
                        <SelectTrigger>
                          <SelectValueText placeholder="Select organization" />
                        </SelectTrigger>
                        <SelectContent>
                          {orgCollection.items.map((org) => (
                            <SelectItem
                              item={org}
                              key={org.organisation_id}
                            >
                              {org.organisation_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                      <FormErrorMessage>
                        {errors.organisation_id?.message}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                />

                <Stack direction="row" gap={4}>
                  <FormControl isInvalid={!!errors.job_title}>
                    <FormLabel>Job Title</FormLabel>
                    <Input
                      {...register("job_title")}
                      placeholder="Software Engineer"
                    />
                    <FormErrorMessage>
                      {errors.job_title?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.organisation_role}>
                    <FormLabel>Org Role</FormLabel>
                    <Input
                      {...register("organisation_role")}
                      placeholder="Developer"
                    />
                    <FormErrorMessage>
                      {errors.organisation_role?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Stack>

                <Controller
                  control={control}
                  name="user_role"
                  render={({ field }) => (
                    <FormControl isInvalid={!!errors.user_role}>
                      <FormLabel>App Role</FormLabel>
                      <SelectRoot
                        collection={roleCollection}
                        name={field.name}
                        value={field.value ? [field.value] : []}
                        onValueChange={(details: { value: string[] }) => field.onChange(details.value[0])}
                      >
                        <SelectTrigger>
                          <SelectValueText placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleCollection.items.map((role) => (
                            <SelectItem item={role} key={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                      <FormErrorMessage>
                        {errors.user_role?.message}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                />
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button
                onClick={handleSubmit(onSubmit)}
                loading={isSubmitting || mutation.isPending}
                bg="purple.600"
                color="white"
                _hover={{ bg: "purple.500" }}
              >
                Create User
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
