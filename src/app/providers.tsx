"use client";

import { AppProviders } from "@/core/providers";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}