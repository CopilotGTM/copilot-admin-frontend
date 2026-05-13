import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CustomScrollbarProps extends React.HTMLAttributes<HTMLDivElement> {
  scrollbarWidth?: string;
  scrollbarTrackColor?: string;
  scrollbarThumbColor?: string;
  scrollbarThumbHoverColor?: string;
  scrollbarMargin?: string | number;
}

export const CustomScrollbar = forwardRef<HTMLDivElement, CustomScrollbarProps>(
  ({ children, className, style, scrollbarWidth = "10px", scrollbarTrackColor, scrollbarThumbColor, scrollbarThumbHoverColor, scrollbarMargin, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("overflow-y-auto [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-[var(--scrollbar-width)] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[var(--scrollbar-track)] [&::-webkit-scrollbar-track-piece]:my-[var(--scrollbar-margin)] [&::-webkit-scrollbar-track-piece]:rounded-md [&::-webkit-scrollbar-track-piece]:bg-[var(--scrollbar-track)] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)] hover:[&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb-hover)]", className)}
        style={
          {
            "--scrollbar-width": scrollbarWidth,
            "--scrollbar-track": scrollbarTrackColor ?? "var(--color-surface-secondary)",
            "--scrollbar-thumb": scrollbarThumbColor ?? "var(--color-brand-subtle)",
            "--scrollbar-thumb-hover": scrollbarThumbHoverColor ?? "var(--color-border-emphasized)",
            "--scrollbar-margin": typeof scrollbarMargin === "number" ? `${scrollbarMargin}px` : (scrollbarMargin ?? "10px"),
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {children}
      </div>
    );
  },
);

CustomScrollbar.displayName = "CustomScrollbar";