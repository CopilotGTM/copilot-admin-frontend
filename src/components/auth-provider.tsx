"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/modules/auth/store";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: Readonly<AuthGuardProps>) {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;

    const publicRoutes = ["/signin", "/forgot-password", "/reset-password"];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!isAuthenticated && !isPublicRoute) {
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`/signin?callbackUrl=${callbackUrl}`);
      return;
    }

    if (isAuthenticated && isPublicRoute) {
      const callbackUrl = searchParams.get("callbackUrl");
      const redirectTo = callbackUrl ? decodeURIComponent(callbackUrl) : "/";
      router.replace(redirectTo);
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, isHydrated, pathname, router, searchParams]);

  if (isLoading || !isHydrated) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background text-fg-secondary">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}