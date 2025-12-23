"use client";

import { ReactNode } from "react";
import EmotionRegistry from "./emotion-registry";
import { AppProviders } from "@/core/providers";

interface ProvidersProps {
  readonly children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <EmotionRegistry>
      <AppProviders defaultTheme="light" enableSystem={false}>
        {children}
      </AppProviders>
    </EmotionRegistry>
  );
}
