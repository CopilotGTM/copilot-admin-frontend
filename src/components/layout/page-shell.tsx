import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminPageWidth = "full" | "wide" | "contained";

interface AdminPageShellProps {
  children: ReactNode;
  className?: string;
  width?: AdminPageWidth;
}

const widthClasses: Record<AdminPageWidth, string> = {
  full: "w-full",
  wide: "mx-auto w-full max-w-[1800px]",
  contained: "mx-auto w-full max-w-6xl",
};

export function AdminPageShell({ children, className, width = "wide" }: AdminPageShellProps) {
  return (
    <div className={cn(widthClasses[width], "px-4 py-6 md:px-6 lg:px-10", className)} data-admin-page-shell data-width={width}>
      {children}
    </div>
  );
}

export function AdminPageHeaderShell({ children, className, width = "wide" }: AdminPageShellProps) {
  return (
    <div className={cn(widthClasses[width], "px-4 py-4 md:px-6 md:py-6 lg:px-10", className)} data-admin-page-header-shell data-width={width}>
      {children}
    </div>
  );
}