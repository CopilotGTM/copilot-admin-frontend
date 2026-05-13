"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toaster } from "@/components/ui/toaster";
import { CreateUserInput, createUserSchema } from "@/app/schemas/users";
import { listOrganizations } from "@/modules/organizations/api";
import { createUser } from "../../api";
import { useState } from "react";

interface CreateUserDialogProps {
  readonly trigger: React.ReactNode;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-fg-secondary">
      {label}
      {children}
      {error ? <span className="text-xs font-normal text-destructive">{error}</span> : null}
    </label>
  );
}

const roleOptions = [
  { label: "Member", value: "member" },
  { label: "Admin", value: "admin" },
] as const;

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

  const { data: orgData, isLoading: isOrganizationsLoading } = useQuery({
    queryKey: ["organizations-list"],
    queryFn: () => listOrganizations({ limit: 100 }),
  });

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toaster.create({ title: "User created successfully", type: "success" });
      setOpen(false);
      reset({ user_role: "member" });
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="px-6 py-5">
          <DialogTitle>Create new user</DialogTitle>
          <DialogDescription>Add a user to an organization and assign their app access role.</DialogDescription>
        </DialogHeader>
        <Separator />

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
            <Field label="First name" error={errors.first_name?.message}>
              <Input {...register("first_name")} placeholder="Jane" aria-invalid={!!errors.first_name} />
            </Field>
            <Field label="Last name" error={errors.last_name?.message}>
              <Input {...register("last_name")} placeholder="Doe" aria-invalid={!!errors.last_name} />
            </Field>

            <div className="md:col-span-2">
              <Field label="Email" error={errors.email?.message}>
                <Input {...register("email")} type="email" placeholder="jane@example.com" autoComplete="email" aria-invalid={!!errors.email} />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Controller
                control={control}
                name="organisation_id"
                render={({ field }) => (
                  <Field label="Organization" error={errors.organisation_id?.message}>
                    <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={isOrganizationsLoading}>
                      <SelectTrigger aria-invalid={!!errors.organisation_id}>
                        <SelectValue placeholder={isOrganizationsLoading ? "Loading organizations" : "Select organization"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {(orgData?.organizations ?? []).map((org) => (
                            <SelectItem key={org.organisation_id} value={org.organisation_id}>
                              {org.organisation_name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>

            <Field label="Job title" error={errors.job_title?.message}>
              <Input {...register("job_title")} placeholder="Software Engineer" aria-invalid={!!errors.job_title} />
            </Field>
            <Field label="Org role" error={errors.organisation_role?.message}>
              <Input {...register("organisation_role")} placeholder="Developer" aria-invalid={!!errors.organisation_role} />
            </Field>

            <div className="md:col-span-2">
              <Controller
                control={control}
                name="user_role"
                render={({ field }) => (
                  <Field label="App role" error={errors.user_role?.message}>
                    <Select value={field.value ?? "member"} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={!!errors.user_role}>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {roleOptions.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isSubmitting || mutation.isPending ? <Spinner data-icon="inline-start" size="sm" /> : null}
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}