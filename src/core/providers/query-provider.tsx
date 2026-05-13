"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/core/api/query-client";

export interface QueryProviderProps {
  readonly children: React.ReactNode;
}

export function QueryProvider({ children }: Readonly<QueryProviderProps>) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
