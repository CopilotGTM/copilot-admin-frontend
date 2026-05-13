"use client";

import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import PasswordInput from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toaster } from "@/components/ui/toaster";
import { resetPassword } from "@/modules/auth/api";
import { resetPasswordSchema, type ResetPasswordInput } from "@/modules/auth/schemas";
export interface ResetPasswordCardProps {
  tokenHash: string;
  forceChange: boolean;
}

function Requirement({ valid, children }: { valid: boolean; children: React.ReactNode }) {
  return (
    <li className={valid ? "flex items-center gap-2 text-fg-secondary" : "flex items-center gap-2 text-signal-risk"}>
      {valid ? <CheckCircle2 data-icon="inline-start" /> : <XCircle data-icon="inline-start" />}
      {children}
    </li>
  );
}

export function ResetPasswordCard({ tokenHash, forceChange }: Readonly<ResetPasswordCardProps>) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      action: forceChange ? "force_change" : "forgot",
      new_password: "",
      confirm_password: "",
      token_hash: tokenHash,
    },
  });

  const newPassword = watch("new_password");
  const confirmPassword = watch("confirm_password");

  const passwordValidations = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[!@#$%^&*]/.test(newPassword),
    match: newPassword === confirmPassword && confirmPassword !== "",
  };

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordInput) => resetPassword(data),
    onSuccess: () => {
      toaster.create({ title: "Password reset successfully" });
      router.push("/signin");
    },
    onError: (error: unknown) => {
      toaster.create({
        title: "Failed to reset password",
        description: error instanceof Error ? error.message : "Something went wrong",
        type: "error",
      });
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    resetPasswordMutation.mutate(data);
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-surface-secondary px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-5">
        <Card className="border-border bg-surface-primary shadow-card-elevated">
          <CardContent className="px-8 py-9">
            <div className="flex flex-col items-center gap-3 text-center">
              <Image src="/ic-lock.svg" alt="Password reset" width={64} height={64} className="size-16" />
              <div className="mt-2 flex flex-col gap-1">
                <h1 className="text-2xl font-semibold text-fg-primary">Set new password</h1>
                <p className="text-sm font-medium text-fg-muted">Create a strong password for your account.</p>
              </div>
            </div>

            <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
              <PasswordInput
                label="New password"
                placeholder="Enter new password"
                autoComplete="new-password"
                {...register("new_password")}
                error={errors.new_password?.message}
              />

              <PasswordInput
                label="Confirm password"
                placeholder="Confirm new password"
                autoComplete="new-password"
                {...register("confirm_password")}
                error={errors.confirm_password?.message}
              />

              <div className="rounded-lg border border-border bg-surface-secondary/50 p-3 text-sm">
                <div className="mb-2 font-medium text-fg-primary">Password requirements</div>
                <ul className="flex flex-col gap-1.5">
                  <Requirement valid={passwordValidations.length}>Minimum 8 characters</Requirement>
                  <Requirement valid={passwordValidations.uppercase}>At least one uppercase letter</Requirement>
                  <Requirement valid={passwordValidations.number}>At least one number</Requirement>
                  <Requirement valid={passwordValidations.special}>At least one special character</Requirement>
                  <Requirement valid={passwordValidations.match}>Passwords must match</Requirement>
                </ul>
              </div>

              <Button type="submit" className="h-12 text-base" disabled={!isValid || isSubmitting || resetPasswordMutation.isPending}>
                {isSubmitting || resetPasswordMutation.isPending ? <Spinner data-icon="inline-start" size="sm" /> : null}
                Reset Password
              </Button>

              <p className="text-center text-sm text-fg-secondary">
                Remember your password?{" "}
                <Link href="/signin" className="font-semibold text-brand-primary hover:text-brand-hover">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {resetPasswordMutation.isError ? (
          <p className="text-center text-sm text-signal-risk">An error occurred during password reset</p>
        ) : null}
      </div>
    </main>
  );
}

export default ResetPasswordCard;