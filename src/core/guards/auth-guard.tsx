"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/modules/auth/store";
import { Box, Spinner, VStack, Text } from "@chakra-ui/react";

export interface AuthGuardProps {
  readonly children: React.ReactNode;
  readonly redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = "/signin" }: Readonly<AuthGuardProps>) {
  const router = useRouter();
  const { access_token, user, isHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for hydration
    if (!isHydrated) {
      return;
    }

    // Check if authenticated
    if (!access_token || !user) {
      router.replace(redirectTo);
    } else {
      setIsChecking(false);
    }
  }, [access_token, user, isHydrated, router, redirectTo]);

  // Show loading state during hydration or auth check
  if (!isHydrated || isChecking) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.500">Loading...</Text>
        </VStack>
      </Box>
    );
  }

  // User is authenticated
  return <>{children}</>;
}

export default AuthGuard;
