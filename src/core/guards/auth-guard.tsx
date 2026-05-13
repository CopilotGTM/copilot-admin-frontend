"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/modules/auth/store";

export interface AuthGuardProps {
  readonly children: React.ReactNode;
  readonly redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = "/signin" }: Readonly<AuthGuardProps>) {
  const router = useRouter();
  const { access_token, user, isHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;

    if (!access_token || !user) {
      router.replace(redirectTo);
    } else {
      setIsChecking(false);
    }
  }, [access_token, user, isHydrated, router, redirectTo]);

  if (!isHydrated || isChecking) {
    return (
      <div className="grid min-h-dvh place-items-center bg-surface-secondary">
        <div className="flex flex-col items-center gap-4 text-sm text-fg-muted">
          <Spinner size="lg" />
          Loading...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthGuard;