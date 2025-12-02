"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useEffect } from "react";
import ChakraProvider from "./chakra-provider";
import RestQueryClientProvider from "../components/HOC/restQueryClientProvider/RestQueryClientProvider";
import { setupAxiosInterceptors } from "@/core/api/axios-instance";
import { useAuthStore } from "@/modules/auth/store";
import { refreshTokens } from "@/modules/auth/api";

interface ProvidersProps {
  readonly children: ReactNode;
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

export default function Providers({ children }: ProvidersProps) {
  return (
    <RestQueryClientProvider>
      <ChakraProvider>
        <AxiosInterceptorSetup />
        {children}
      </ChakraProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </RestQueryClientProvider>
  );
}
