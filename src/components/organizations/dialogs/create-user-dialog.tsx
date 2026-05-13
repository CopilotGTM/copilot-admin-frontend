"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, IdCard, Mail, Shield, User as UserIcon } from "lucide-react";
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
import { createUserSchema, type CreateUserInput } from "@/modules/users/schemas";

export interface CreateUserDialogProps {
  trigger: React.ReactNode;
  organisationId: string;
  onCreate: (values: CreateUserInput) => Promise<void>;
}

const roleOptions = [
  { label: "Member", value: "member", description: "Standard user access" },
  { label: "Admin", value: "admin", description: "Full administrative access" },
] as const;

function Field({
  label,
  icon: Icon,
  error,
  children,
  className,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className ? `flex flex-col gap-2 text-sm font-medium text-fg-secondary ${className}` : "flex flex-col gap-2 text-sm font-medium text-fg-secondary"}>
      {label}
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
        {children}
      </span>
      {error ? <span className="text-xs font-normal text-signal-risk">{error}</span> : null}
    </label>
  );
}

export default function CreateUserDialog({ trigger, organisationId, onCreate }: Readonly<CreateUserDialogProps>) {
  const [open, setOpen] = React.useState(false);
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

  const resetForm = () => {
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

  const onSubmit = handleSubmit(async (values) => {
    await onCreate(values);
    resetForm();
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="px-6 py-5">
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription>Create a user in this organization and assign their app access role.</DialogDescription>
        </DialogHeader>
        <Separator />

        <form onSubmit={onSubmit}>
          <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
            <Field label="First name" icon={UserIcon} error={errors.first_name?.message}>
              <Input className="pl-9" placeholder="Alice" aria-invalid={!!errors.first_name} {...register("first_name")} />
            </Field>

            <Field label="Last name" icon={UserIcon} error={errors.last_name?.message}>
              <Input className="pl-9" placeholder="Doe" aria-invalid={!!errors.last_name} {...register("last_name")} />
            </Field>

            <Field label="Email" icon={Mail} error={errors.email?.message} className="md:col-span-2">
              <Input className="pl-9" type="email" placeholder="user@example.com" aria-invalid={!!errors.email} {...register("email")} />
            </Field>

            <Controller
              control={control}
              name="user_role"
              render={({ field }) => (
                <label className="flex flex-col gap-2 text-sm font-medium text-fg-secondary">
                  App role
                  <span className="relative block">
                    <Shield className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
                    <Select value={field.value ?? "member"} onValueChange={field.onChange} name={field.name}>
                      <SelectTrigger className="pl-9" aria-invalid={!!errors.user_role}>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {roleOptions.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              <span className="flex flex-col">
                                <span>{role.label}</span>
                                <span className="text-xs font-normal text-fg-muted">{role.description}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </span>
                  {errors.user_role ? <span className="text-xs font-normal text-signal-risk">{errors.user_role.message}</span> : null}
                </label>
              )}
            />

            <Field label="Job title" icon={Briefcase} error={errors.job_title?.message}>
              <Input className="pl-9" placeholder="Product Manager" aria-invalid={!!errors.job_title} {...register("job_title")} />
            </Field>

            <Field label="Organization role" icon={IdCard} error={errors.organisation_role?.message} className="md:col-span-2">
              <Input
                className="pl-9"
                placeholder="Project Owner"
                aria-invalid={!!errors.organisation_role}
                {...register("organisation_role")}
              />
            </Field>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? <Spinner data-icon="inline-start" size="sm" /> : null}
              Create user
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}