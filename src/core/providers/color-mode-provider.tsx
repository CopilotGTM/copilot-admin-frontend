"use client";

import { ColorModeProvider, type ColorModeProviderProps } from "@/components/ui/color-mode";

export interface AdminColorModeProviderProps extends ColorModeProviderProps {
  children: React.ReactNode;
}

export function AdminColorModeProvider({ children, ...props }: Readonly<AdminColorModeProviderProps>) {
  return <ColorModeProvider {...props}>{children}</ColorModeProvider>;
}