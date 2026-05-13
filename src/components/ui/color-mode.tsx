"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type ColorMode = "light" | "dark";

export interface ColorModeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ColorMode;
  enableSystem?: boolean;
  forcedTheme?: ColorMode;
  attribute?: string;
  disableTransitionOnChange?: boolean;
}

export interface UseColorModeReturn {
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
  toggleColorMode: () => void;
}

const ColorModeContext = React.createContext<UseColorModeReturn | null>(null);

export function ColorModeProvider({ children, defaultTheme = "light", forcedTheme }: ColorModeProviderProps) {
  const [colorMode, setColorModeState] = React.useState<ColorMode>(forcedTheme ?? defaultTheme);

  const setColorMode = React.useCallback(
    (nextColorMode: ColorMode) => {
      if (forcedTheme) return;
      setColorModeState(nextColorMode);
    },
    [forcedTheme],
  );

  React.useEffect(() => {
    const nextColorMode = forcedTheme ?? colorMode;
    document.documentElement.classList.toggle("dark", nextColorMode === "dark");
    document.documentElement.dataset.theme = nextColorMode;
  }, [colorMode, forcedTheme]);

  const value = React.useMemo<UseColorModeReturn>(() => {
    const resolvedColorMode = forcedTheme ?? colorMode;
    return {
      colorMode: resolvedColorMode,
      setColorMode,
      toggleColorMode: () => setColorMode(resolvedColorMode === "dark" ? "light" : "dark"),
    };
  }, [colorMode, forcedTheme, setColorMode]);

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}

export function useColorMode(): UseColorModeReturn {
  const context = React.useContext(ColorModeContext);
  if (context) return context;

  return {
    colorMode: "light",
    setColorMode: () => undefined,
    toggleColorMode: () => undefined,
  };
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? dark : light;
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? <Moon /> : <Sun />;
}

export const ColorModeButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(function ColorModeButton(
  { className, ...props },
  ref,
) {
  const { toggleColorMode } = useColorMode();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <Skeleton className="size-8" />;

  return (
    <Button
      type="button"
      onClick={toggleColorMode}
      variant="ghost"
      aria-label="Toggle color mode"
      size="icon-sm"
      ref={ref}
      className={className}
      {...props}
    >
      <ColorModeIcon />
    </Button>
  );
});

export const LightMode = React.forwardRef<HTMLSpanElement, React.ComponentProps<"span">>(function LightMode(
  { className, ...props },
  ref,
) {
  return <span ref={ref} className={cn("contents", className)} data-theme="light" {...props} />;
});

export const DarkMode = React.forwardRef<HTMLSpanElement, React.ComponentProps<"span">>(function DarkMode(
  { className, ...props },
  ref,
) {
  return <span ref={ref} className={cn("contents dark", className)} data-theme="dark" {...props} />;
});