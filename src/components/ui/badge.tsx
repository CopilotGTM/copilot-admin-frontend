import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-surface-muted text-fg-secondary border-border/50 [a]:hover:bg-surface-active",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        // Signal variants (for deal risk, status indicators)
        success:
          "bg-signal-success/10 text-signal-success border-signal-success/20",
        warning:
          "bg-signal-warning/15 text-signal-warning border-signal-warning/30",
        risk: "bg-signal-risk/10 text-signal-risk border-signal-risk/20",
        info: "bg-signal-info/10 text-signal-info border-signal-info/20",
        "primary-subtle":
          "bg-primary/10 text-primary border-primary/20 dark:bg-primary/15 dark:border-primary/40",
        // Stakeholder role variants
        champion:
          "bg-primary/10 text-primary border-primary/20 dark:bg-primary/15 dark:text-primary dark:border-primary/40",
        supporter:
          "bg-signal-success/10 text-signal-success border-signal-success/20 dark:bg-signal-success/15 dark:text-signal-success dark:border-signal-success/40",
        neutral:
          "bg-surface-muted text-fg-secondary border-border dark:bg-surface-muted dark:text-fg-secondary dark:border-border",
        blocker:
          "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/15 dark:text-destructive dark:border-destructive/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export { Badge, badgeVariants, type BadgeVariant };
