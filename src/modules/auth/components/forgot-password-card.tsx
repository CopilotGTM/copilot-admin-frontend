"use client";

import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Mail, MoveLeft, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { forgotPassword as sendResetPasswordLink } from "@/modules/auth/api";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/modules/auth/schemas";
export function ForgotPasswordCard() {
  const [alertState, setAlertState] = useState<
    | { status: "success" | "error"; title: string; description?: string }
    | null
  >(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: sendResetPasswordLink,
    onSuccess: () => {
      setAlertState({
        status: "success",
        title: "Reset link sent successfully",
        description: "Please check your email inbox. If you do not see it, check your spam or junk folder.",
      });
      reset({ email: "" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Something went wrong";
      setAlertState({
        status: "error",
        title: "Failed to send reset link",
        description: message,
      });
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    setAlertState(null);
    forgotPasswordMutation.mutate(data);
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-surface-secondary px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-5">
        <Card className="border-border bg-surface-primary shadow-card-elevated">
          <CardContent className="px-8 py-9">
            <div className="flex flex-col items-center gap-3 text-center">
              <Image src="/ic-lock.svg" alt="Password reset" width={64} height={64} className="size-16" />
              <div className="mt-2 flex flex-col gap-1">
                <h1 className="text-2xl font-semibold text-fg-primary">Forgot Password?</h1>
                <p className="text-sm font-medium text-fg-muted">No worries, we will send you reset instructions.</p>
              </div>
            </div>

            <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
              <label className="flex flex-col gap-2 text-sm font-medium text-fg-secondary">
                Email
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
                  <Input
                    className="h-12 pl-10"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                </span>
                {errors.email ? <span className="text-xs font-normal text-signal-risk">{errors.email.message}</span> : null}
              </label>

              <Button type="submit" className="h-12 text-base" disabled={!isValid || isSubmitting || forgotPasswordMutation.isPending}>
                {isSubmitting || forgotPasswordMutation.isPending ? <Spinner data-icon="inline-start" size="sm" /> : null}
                Reset Password
              </Button>

              <Link className="mx-auto inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-hover" href="/signin">
                <MoveLeft data-icon="inline-start" />
                Back to Sign in
              </Link>
            </form>
          </CardContent>
        </Card>

        {alertState ? (
          <Alert variant={alertState.status === "error" ? "destructive" : "default"} className={alertState.status === "success" ? "border-signal-success/20 bg-signal-success/10 text-signal-success" : undefined}>
            {alertState.status === "success" ? <CheckCircle2 data-icon="inline-start" /> : <XCircle data-icon="inline-start" />}
            <AlertTitle>{alertState.title}</AlertTitle>
            {alertState.description ? <AlertDescription>{alertState.description}</AlertDescription> : null}
          </Alert>
        ) : null}
      </div>
    </main>
  );
}

export default ForgotPasswordCard;