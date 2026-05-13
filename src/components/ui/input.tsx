import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-border bg-surface-primary px-3 py-1.5 text-sm text-fg-primary transition-colors motion-reduce:transition-none outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-fg-primary placeholder:text-fg-placeholder hover:border-border-emphasized focus-visible:border-border-focus focus-visible:shadow-input-focus disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:opacity-50 aria-invalid:border-signal-risk aria-invalid:shadow-input-error",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
