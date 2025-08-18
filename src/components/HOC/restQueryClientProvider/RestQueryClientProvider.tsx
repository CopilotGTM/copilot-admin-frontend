// src/components/ClientProviders.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { RestQueryClientProviderProps } from "./restQueryClientProvider.types";
import restTanStackClient from "../../../core/rest-client/rest-client.tanStack";

export default function RestQueryClientProvider(
  props: RestQueryClientProviderProps,
) {
  const { children } = props;

  return (
    <QueryClientProvider client={restTanStackClient}>
      {children}
    </QueryClientProvider>
  );
}
