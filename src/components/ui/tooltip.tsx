"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  showArrow?: boolean;
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
  content: React.ReactNode;
  contentProps?: React.ComponentProps<typeof TooltipPrimitive.Content>;
  disabled?: boolean;
  children?: React.ReactNode;
  positioning?: { placement?: string };
  openDelay?: number;
  closeDelay?: number;
}

/**
 * Map Chakra-style `positioning.placement` values to Radix `side` + `align`.
 */
function mapPlacement(placement?: string): {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
} {
  if (!placement) return {};
  const parts = placement.split("-");
  const side = parts[0] as "top" | "right" | "bottom" | "left";
  const align = parts[1] as "start" | "center" | "end" | undefined;
  return { side, align };
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      showArrow,
      children,
      disabled,
      content,
      contentProps,
      positioning,
      openDelay = 0,
      closeDelay: _closeDelay, // eslint-disable-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
    } = props;

    if (disabled) return children;

    const { side, align } = mapPlacement(positioning?.placement);

    return (
      <TooltipPrimitive.Provider delayDuration={openDelay}>
        <TooltipPrimitive.Root>
          <TooltipPrimitive.Trigger asChild>
            {children}
          </TooltipPrimitive.Trigger>
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
              ref={ref}
              side={side}
              align={align}
              sideOffset={4}
              className={cn(
                "z-50 inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) items-center gap-1.5 rounded-md bg-surface-inverted px-3 py-1.5 text-xs text-fg-inverted shadow-tooltip data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
                contentProps?.className,
              )}
              {...contentProps}
            >
              {content}
              {showArrow && (
                <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-surface-inverted fill-surface-inverted" />
              )}
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
    );
  },
);
