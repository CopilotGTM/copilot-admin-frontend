"use client";

import { useEffect } from "react";
import { ChakraProvider, type ChakraProviderProps } from "./chakra-provider";
import { QueryProvider } from "./query-provider";
import { setupAxiosInterceptors } from "@/core/api/axios-instance";
import { useAuthStore } from "@/modules/auth/store";
import { refreshTokens } from "@/modules/auth/api";

export interface AppProvidersProps extends ChakraProviderProps {
  readonly children: React.ReactNode;
}

// Component to setup axios interceptors after mount
function AxiosInterceptorSetup() {
  useEffect(() => {
    setupAxiosInterceptors(
      () => {
        const state = useAuthStore.getState();
        return {
          access_token: state.access_token,
          refresh_token: state.refresh_token,
          updateTokens: state.updateTokens,
          clearAuth: state.clearAuth,
        };
      },
      refreshTokens
    );
  }, []);

  return null;
}

export function AppProviders({ children, ...props }: Readonly<AppProvidersProps>) {
  return (
    <ChakraProvider {...props}>
      <QueryProvider>
        <AxiosInterceptorSetup />
        {children}
      </QueryProvider>
    </ChakraProvider>
  );
}
