"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

/**
 * Separator component for visual dividers
 * 
 * @example
 * <Separator />
 * <Separator orientation="vertical" />
 * <Separator variant="gradient" />
 */

export type SeparatorProps = React.ComponentPropsWithoutRef<
  typeof SeparatorPrimitive.Root
> & {
  /**
   * Visual style variant
   * @default "solid"
   */
  variant?: "solid" | "dashed" | "dotted" | "gradient" | "glow";
  /**
   * Thickness of the separator
   * @default "default"
   */
  thickness?: "thin" | "default" | "thick";
};

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    {
      className,
      orientation = "horizontal",
      decorative = true,
      variant = "solid",
      thickness = "default",
      ...props
    },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0",
        // Base orientation styles
        orientation === "horizontal" ? "w-full" : "h-full",
        // Thickness
        orientation === "horizontal"
          ? {
              thin: "h-[0.5px]",
              default: "h-px",
              thick: "h-0.5",
            }[thickness]
          : {
              thin: "w-[0.5px]",
              default: "w-px",
              thick: "w-0.5",
            }[thickness],
        // Variant styles
        variant === "solid" && "bg-border",
        variant === "dashed" &&
          cn(
            "bg-transparent",
            orientation === "horizontal"
              ? "border-t border-dashed border-border"
              : "border-l border-dashed border-border"
          ),
        variant === "dotted" &&
          cn(
            "bg-transparent",
            orientation === "horizontal"
              ? "border-t border-dotted border-border"
              : "border-l border-dotted border-border"
          ),
        variant === "gradient" &&
          cn(
            orientation === "horizontal"
              ? "bg-gradient-to-r from-transparent via-border to-transparent"
              : "bg-gradient-to-b from-transparent via-border to-transparent"
          ),
        variant === "glow" &&
          cn(
            orientation === "horizontal"
              ? "bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_8px_rgba(var(--primary),0.3)]"
              : "bg-gradient-to-b from-transparent via-primary/50 to-transparent shadow-[0_0_8px_rgba(var(--primary),0.3)]"
          ),
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

/**
 * Separator with label in the middle
 * 
 * @example
 * <SeparatorWithLabel>OR</SeparatorWithLabel>
 * <SeparatorWithLabel variant="gradient">Continue</SeparatorWithLabel>
 */
export type SeparatorWithLabelProps = {
  children: React.ReactNode;
  className?: string;
  variant?: SeparatorProps["variant"];
  thickness?: SeparatorProps["thickness"];
};

const SeparatorWithLabel = React.forwardRef<
  HTMLDivElement,
  SeparatorWithLabelProps
>(({ children, className, variant = "solid", thickness = "default" }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3 text-sm text-muted-foreground", className)}
  >
    <Separator variant={variant} thickness={thickness} className="flex-1" />
    {children}
    <Separator variant={variant} thickness={thickness} className="flex-1" />
  </div>
));
SeparatorWithLabel.displayName = "SeparatorWithLabel";

export { Separator, SeparatorWithLabel };

