"use client";

import { ChakraProvider as ChakraUIProvider, defaultSystem } from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "@/components/ui/color-mode";
import theme from "@/../theme";

export interface ChakraProviderProps extends ColorModeProviderProps {
  children: React.ReactNode;
}

export function ChakraProvider({ children, ...props }: Readonly<ChakraProviderProps>) {
  return (
    <ChakraUIProvider value={theme || defaultSystem}>
      <ColorModeProvider {...props}>{children}</ColorModeProvider>
    </ChakraUIProvider>
  );
}
