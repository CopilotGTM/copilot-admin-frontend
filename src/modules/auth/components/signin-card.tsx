"use client";

import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LogIn, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PasswordInput from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toaster } from "@/components/ui/toaster";
import { loginAdmin } from "@/modules/auth/api";
import { loginSchema, type LoginInput } from "@/modules/auth/schemas";
import { useAuthStore } from "@/modules/auth/store";
import type { AdminUser } from "@/modules/auth/types";
import { clearRememberedEmail, getRememberedEmail, setRememberedEmail } from "@/modules/auth/utils";
export function SigninCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [emailValue, setEmailValue] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    setIsClient(true);
    const email = getRememberedEmail();
    if (email) {
      setEmailValue(email);
      setRememberMe(true);
      setValue("email", email);
    }
  }, [setValue]);

  const loginMutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: (response) => {
      const data = (response as unknown as { status: string; data: typeof response; message: string }).data;

      if (data.state === "ACTIVE" && data.tokens) {
        setAuth(
          data.tokens.access_token,
          data.tokens.refresh_token,
          {
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            role: data.role,
            state: data.state,
            created_at: data.created_at,
            email_verified: data.email_verified,
            last_login_at: data.last_login_at,
          } as AdminUser,
          rememberMe,
        );

        if (rememberMe) {
          setRememberedEmail(data.email);
        } else {
          clearRememberedEmail();
        }

        toaster.create({ title: "Login successful", type: "success", duration: 2000 });
        const callbackUrl = searchParams.get("callbackUrl");
        const redirectTo = callbackUrl ? decodeURI(callbackUrl) : "/";
        setTimeout(() => {
          globalThis.location.href = redirectTo;
        }, 100);
      } else if (data.state === "PASSWORD_CHANGE_REQUIRED" && data.password_reset_link) {
        toaster.create({
          title: "Password change required",
          description: "Please set your password to continue",
          type: "warning",
          duration: 3000,
        });
        router.push(`${data.password_reset_link}&force_change=true`);
      } else {
        toaster.create({
          title: "Login failed",
          description: "Unexpected response from server",
          type: "error",
          duration: 3000,
        });
      }
    },
    onError: () => {
      toaster.create({
        title: "Login failed",
        description: "Something went wrong",
        type: "error",
        duration: 2000,
      });
    },
  });

  const handleRememberMeChange = () => {
    const nextRememberMe = !rememberMe;
    setRememberMe(nextRememberMe);
    if (!nextRememberMe) clearRememberedEmail();
  };

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-surface-secondary px-4 py-10">
      <Card className="w-full max-w-md border-border bg-surface-primary shadow-card-elevated">
        <CardContent className="px-8 py-9">
          <div className="flex flex-col items-center gap-3 text-center">
            <Image src="/logo-full.svg" alt="Copilot-GTM logo" width={155} height={32} className="h-auto w-[155px]" priority />
            <div className="mt-4 space-y-1">
              <h1 className="text-2xl font-semibold text-fg-primary">Welcome back</h1>
              <p className="text-sm font-medium text-fg-muted">Log in to your CopilotGTM admin panel</p>
            </div>
          </div>

          <form className="mt-10 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
            <label className="flex flex-col gap-2 text-sm font-medium text-fg-secondary">
              Username
              <span className="relative block">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
                <Input
                  className="h-12 pl-10"
                  type="email"
                  autoComplete="username"
                  placeholder="Enter your username"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
              </span>
              {errors.email ? <span className="text-xs font-normal text-destructive">{errors.email.message}</span> : null}
              {isClient && emailValue ? <span className="text-xs font-normal text-fg-success">Email remembered from previous login</span> : null}
            </label>

            <PasswordInput error={errors.password?.message || ""} {...register("password")} />

            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-fg-secondary">
                  <Checkbox checked={rememberMe} onCheckedChange={handleRememberMeChange} />
                  Remember me
                </label>
                <Link className="text-sm font-semibold text-brand-primary hover:text-brand-hover" href="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="h-12 text-base" disabled={!isValid || isSubmitting || loginMutation.isPending}>
                {loginMutation.isPending ? "Signing in" : "Sign in"}
                {!loginMutation.isPending ? <LogIn data-icon="inline-end" /> : null}
              </Button>
            </div>

            {loginMutation.isError ? <p className="text-center text-sm text-destructive">An error occurred during login</p> : null}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default SigninCard;
