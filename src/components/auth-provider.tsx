"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Spinner, Center } from "@chakra-ui/react";
import useAuthStore from "../app/stores/use-auth-store";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Public routes that don't require authentication
    const publicRoutes = [
      "/",
      "/signin",
      "/forgot-password",
      "/reset-password",
    ];
    const isPublicRoute = publicRoutes.includes(pathname);

    // If not authenticated and trying to access a protected route
    if (!isAuthenticated && !isPublicRoute) {
      router.push("/signin");
    }

    // If authenticated and trying to access login/forgot-password/reset-password page
    if (
      isAuthenticated &&
      (pathname === "/signin" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password")
    ) {
      router.push("/");
    }

    setIsLoading(false);
  }, [isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return <>{children}</>;
}
