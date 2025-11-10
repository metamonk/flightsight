"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

/**
 * Popover component for rich contextual content
 * 
 * @example
 * <Popover>
 *   <PopoverTrigger>Click me</PopoverTrigger>
 *   <PopoverContent>
 *     <p>Popover content</p>
 *   </PopoverContent>
 * </Popover>
 */

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;
const PopoverClose = PopoverPrimitive.Close;

export type PopoverContentProps = React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
> & {
  /**
   * Enable HUD-style corner brackets
   * @default false
   */
  withCorners?: boolean;
  /**
   * Enable subtle grid overlay pattern
   * @default false
   */
  withGrid?: boolean;
  /**
   * Show arrow pointing to trigger
   * @default true
   */
  showArrow?: boolean;
};

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(
  (
    {
      className,
      align = "center",
      sideOffset = 4,
      withCorners = false,
      withGrid = false,
      showArrow = true,
      children,
      ...props
    },
    ref
  ) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        {/* Grid overlay */}
        {withGrid && (
          <div
            className="pointer-events-none absolute inset-0 rounded-md opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "16px 16px",
            }}
            aria-hidden="true"
          />
        )}

        {/* Corner brackets */}
        {withCorners && (
          <>
            <div
              className="pointer-events-none absolute left-1 top-1 h-3 w-3 border-l-2 border-t-2 border-primary/50"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute right-1 top-1 h-3 w-3 border-r-2 border-t-2 border-primary/50"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute bottom-1 left-1 h-3 w-3 border-b-2 border-l-2 border-primary/50"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute bottom-1 right-1 h-3 w-3 border-b-2 border-r-2 border-primary/50"
              aria-hidden="true"
            />
          </>
        )}

        <div className="relative">{children}</div>

        {showArrow && <PopoverPrimitive.Arrow className="fill-popover" />}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverClose };

