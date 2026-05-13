import * as React from "react";
import { cn } from "@/lib/utils";

export const Prose = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(function Prose({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "max-w-[65ch] text-sm leading-7 text-fg-secondary",
        "[&_a]:font-medium [&_a]:text-fg-primary [&_a]:underline [&_a]:underline-offset-4",
        "[&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-5",
        "[&_code]:rounded-md [&_code]:border [&_code]:border-border [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.925em]",
        "[&_h1]:mb-4 [&_h1]:mt-0 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:leading-tight [&_h1]:text-fg-primary",
        "[&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-fg-primary",
        "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-fg-primary",
        "[&_h4]:mb-2 [&_h4]:mt-5 [&_h4]:font-semibold [&_h4]:text-fg-primary",
        "[&_img]:my-7 [&_img]:rounded-lg [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_p]:my-4 [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-surface-secondary [&_pre]:p-4",
        "[&_pre_code]:border-0 [&_pre_code]:p-0 [&_table]:my-8 [&_table]:w-full [&_table]:text-left",
        "[&_tbody_tr]:border-b [&_tbody_tr]:border-border [&_td]:px-4 [&_td]:py-2 [&_th]:px-4 [&_th]:pb-2 [&_th]:font-medium",
        "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6",
        className,
      )}
      {...props}
    />
  );
});