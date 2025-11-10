"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

/**
 * Tooltip component for brief contextual information
 * 
 * @example
 * <Tooltip>
 *   <TooltipTrigger>Hover me</TooltipTrigger>
 *   <TooltipContent>
 *     <p>Tooltip text</p>
 *   </TooltipContent>
 * </Tooltip>
 */

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipPortal = TooltipPrimitive.Portal;

export type TooltipProps = React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Root
> & {
  /**
   * Delay before showing tooltip (ms)
   * @default 200
   */
  delayDuration?: number;
};

const Tooltip = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Root>,
  TooltipProps
>(({ delayDuration = 200, children, ...props }, ref) => (
  <TooltipProvider delayDuration={delayDuration}>
    <TooltipRoot {...props}>{children}</TooltipRoot>
  </TooltipProvider>
));
Tooltip.displayName = "Tooltip";

export type TooltipContentProps = React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
> & {
  /**
   * Show arrow pointing to trigger
   * @default true
   */
  showArrow?: boolean;
  /**
   * Enable HUD-style appearance
   * @default false
   */
  withHUD?: boolean;
};

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(
  (
    {
      className,
      sideOffset = 4,
      showArrow = true,
      withHUD = false,
      children,
      ...props
    },
    ref
  ) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs",
          "animate-in fade-in-0 zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          withHUD
            ? "border border-primary/30 bg-background/95 text-foreground shadow-lg backdrop-blur-sm"
            : "bg-primary text-primary-foreground",
          className
        )}
        {...props}
      >
        {children}
        {showArrow && (
          <TooltipPrimitive.Arrow
            className={cn(
              "fill-primary",
              withHUD && "fill-background"
            )}
          />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * Simple tooltip wrapper for common use cases
 * 
 * @example
 * <TooltipSimple content="Delete item">
 *   <Button variant="destructive">Delete</Button>
 * </TooltipSimple>
 */
export type TooltipSimpleProps = {
  /**
   * Tooltip content (text or elements)
   */
  content: React.ReactNode;
  /**
   * Element to trigger the tooltip
   */
  children: React.ReactElement;
  /**
   * Tooltip side
   * @default "top"
   */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * Delay before showing (ms)
   * @default 200
   */
  delayDuration?: number;
  /**
   * Show arrow
   * @default true
   */
  showArrow?: boolean;
  /**
   * Enable HUD style
   * @default false
   */
  withHUD?: boolean;
};

const TooltipSimple = React.forwardRef<HTMLElement, TooltipSimpleProps>(
  (
    {
      content,
      children,
      side = "top",
      delayDuration = 200,
      showArrow = true,
      withHUD = false,
    },
    ref
  ) => (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} showArrow={showArrow} withHUD={withHUD}>
        {content}
      </TooltipContent>
    </Tooltip>
  )
);
TooltipSimple.displayName = "TooltipSimple";

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipSimple,
};

