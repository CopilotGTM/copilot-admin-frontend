"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Spinner, Center } from "@chakra-ui/react";
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
    // Wait until Zustand persist has hydrated from cookie storage.
    if (!isHydrated) {
      return;
    }

    // Public routes that don't require authentication
    const publicRoutes = [
      "/signin",
      "/forgot-password",
      "/reset-password",
    ];
    const isPublicRoute = publicRoutes.includes(pathname);

    // If not authenticated and trying to access a protected route
    if (!isAuthenticated && !isPublicRoute) {
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`/signin?callbackUrl=${callbackUrl}`);
      return;
    }

    // If authenticated and trying to access login/forgot-password/reset-password page
    if (
      isAuthenticated &&
      (pathname === "/signin" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password")
    ) {
      const callbackUrl = searchParams.get("callbackUrl");
      const redirectTo = callbackUrl ? decodeURIComponent(callbackUrl) : "/";
      router.replace(redirectTo);
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, isHydrated, pathname, router, searchParams]);

  if (isLoading || !isHydrated) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return <>{children}</>;
}
