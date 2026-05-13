import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-14 w-full rounded-md border border-border bg-surface-primary px-3 py-2 text-sm text-fg-primary transition-colors outline-none placeholder:text-fg-placeholder hover:border-border-emphasized focus-visible:border-border-focus focus-visible:shadow-input-focus disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:opacity-50 aria-invalid:border-signal-risk aria-invalid:shadow-input-error",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
