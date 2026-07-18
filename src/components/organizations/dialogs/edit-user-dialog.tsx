"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, IdCard, ShieldCheck, User as UserIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import type { UpdateUserDetailsRequest, UserListItem } from "@/modules/users/types";

const editUserSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  job_title: z.string().min(1),
  organisation_role: z.string().min(1),
  user_role: z.enum(["member", "admin"]),
});

type EditUserInput = z.infer<typeof editUserSchema>;

export interface EditUserDialogProps {
  trigger: React.ReactNode;
  user: UserListItem;
  onUpdate: (user_id: string, payload: UpdateUserDetailsRequest) => Promise<void>;
}

function Field({ label, icon: Icon, error, children }: { label: string; icon: React.ElementType; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-fg-secondary">
      {label}
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
        {children}
      </span>
      {error ? <span className="text-xs font-normal text-destructive">{error}</span> : null}
    </label>
  );
}

export default function EditUserDialog({ trigger, user, onUpdate }: Readonly<EditUserDialogProps>) {
  const [open, setOpen] = React.useState(false);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<EditUserInput>({
    resolver: zodResolver(editUserSchema),
    mode: "onChange",
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      job_title: user.job_title,
      organisation_role: user.organisation_role,
      user_role: user.user_role,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await onUpdate(user.user_id, values);
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="px-6 py-5">
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>Update the user&apos;s profile, organization role, and app access role.</DialogDescription>
        </DialogHeader>
        <Separator />

        <form onSubmit={onSubmit}>
          <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
            <Field label="First name" icon={UserIcon} error={errors.first_name?.message}>
              <Input className="pl-10" placeholder="Alice" aria-invalid={!!errors.first_name} {...register("first_name")} />
            </Field>
            <Field label="Last name" icon={UserIcon} error={errors.last_name?.message}>
              <Input className="pl-10" placeholder="Doe" aria-invalid={!!errors.last_name} {...register("last_name")} />
            </Field>
            <Field label="Job title" icon={Briefcase} error={errors.job_title?.message}>
              <Input className="pl-10" placeholder="Product Manager" aria-invalid={!!errors.job_title} {...register("job_title")} />
            </Field>
            <Field label="Organization role" icon={IdCard} error={errors.organisation_role?.message}>
              <Input className="pl-10" placeholder="Project Owner" aria-invalid={!!errors.organisation_role} {...register("organisation_role")} />
            </Field>
            <Controller
              control={control}
              name="user_role"
              render={({ field }) => (
                <Field label="App role" icon={ShieldCheck} error={errors.user_role?.message}>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full pl-10" aria-invalid={!!errors.user_role}>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? <Spinner data-icon="inline-start" size="sm" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
