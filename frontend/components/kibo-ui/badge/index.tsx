import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge component for status indicators with optional pulse animation
 * 
 * @example
 * <Badge>Default Badge</Badge>
 * <Badge variant="outline">Outline Badge</Badge>
 * <Badge variant="success">Success</Badge>
 * <BadgePulse variant="warning">Alert</BadgePulse>
 */

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success:
          "border-transparent bg-green-500 text-white [a&]:hover:bg-green-600 dark:bg-green-600/80",
        warning:
          "border-transparent bg-yellow-500 text-black [a&]:hover:bg-yellow-600 dark:bg-yellow-600/80",
        info:
          "border-transparent bg-blue-500 text-white [a&]:hover:bg-blue-600 dark:bg-blue-600/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    /**
     * Render as a child component (using Radix Slot)
     * @default false
     */
    asChild?: boolean;
  };

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "span";

    return (
      <Comp
        ref={ref}
        data-slot="badge"
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

/**
 * Badge with pulsing animation (always visible)
 * Useful for status indicators that need attention
 * 
 * @example
 * <BadgePulse variant="success">Active</BadgePulse>
 * <BadgePulse variant="warning">Pending</BadgePulse>
 * <BadgePulse variant="destructive">Critical</BadgePulse>
 */
export type BadgePulseProps = Omit<BadgeProps, "asChild">;

const BadgePulse = React.forwardRef<HTMLSpanElement, BadgePulseProps>(
  ({ className, variant, ...props }, ref) => {
    // Determine pulse color based on variant
    const pulseColor = React.useMemo(() => {
      switch (variant) {
        case "destructive":
          return "bg-destructive/30";
        case "secondary":
          return "bg-secondary/30";
        case "success":
          return "bg-green-500/30";
        case "warning":
          return "bg-yellow-500/30";
        case "info":
          return "bg-blue-500/30";
        default:
          return "bg-primary/30";
      }
    }, [variant]);

    return (
      <span className="relative inline-flex">
        {/* Pulsing animation layer */}
        <span
          className={cn(
            "absolute inset-0 animate-pulse rounded-full blur-sm",
            pulseColor
          )}
          aria-hidden="true"
        />
        {/* Badge */}
        <span
          ref={ref}
          data-slot="badge"
          className={cn("relative", badgeVariants({ variant }), className)}
          {...props}
        />
      </span>
    );
  }
);

BadgePulse.displayName = "BadgePulse";

/**
 * Badge with dot indicator for status
 * 
 * @example
 * <BadgeDot variant="success">Online</BadgeDot>
 * <BadgeDot variant="destructive">Offline</BadgeDot>
 */
export type BadgeDotProps = BadgeProps & {
  /**
   * Show pulsing animation on the dot
   * @default false
   */
  withPulse?: boolean;
};

const BadgeDot = React.forwardRef<HTMLSpanElement, BadgeDotProps>(
  ({ className, variant, withPulse = false, children, ...props }, ref) => {
    // Determine dot color based on variant
    const dotColor = React.useMemo(() => {
      switch (variant) {
        case "destructive":
          return "bg-red-500";
        case "secondary":
          return "bg-gray-500";
        case "success":
          return "bg-green-500";
        case "warning":
          return "bg-yellow-500";
        case "info":
          return "bg-blue-500";
        default:
          return "bg-primary";
      }
    }, [variant]);

    return (
      <Badge ref={ref} variant={variant} className={cn("gap-1.5", className)} {...props}>
        <span className="relative flex h-2 w-2">
          {withPulse && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                dotColor
              )}
              aria-hidden="true"
            />
          )}
          <span className={cn("relative inline-flex h-2 w-2 rounded-full", dotColor)} />
        </span>
        {children}
      </Badge>
    );
  }
);

BadgeDot.displayName = "BadgeDot";

/**
 * Badge group for related badges
 * Automatically handles spacing
 */
export type BadgeGroupProps = React.ComponentProps<"div"> & {
  /**
   * Spacing between badges
   * @default "sm"
   */
  spacing?: "xs" | "sm" | "md" | "lg";
};

const BadgeGroup = React.forwardRef<HTMLDivElement, BadgeGroupProps>(
  ({ className, spacing = "sm", ...props }, ref) => {
    const spacingClass = React.useMemo(() => {
      switch (spacing) {
        case "xs":
          return "gap-1";
        case "md":
          return "gap-3";
        case "lg":
          return "gap-4";
        default:
          return "gap-2";
      }
    }, [spacing]);

    return (
      <div
        ref={ref}
        className={cn("inline-flex flex-wrap items-center", spacingClass, className)}
        {...props}
      />
    );
  }
);

BadgeGroup.displayName = "BadgeGroup";

export { Badge, BadgePulse, BadgeDot, BadgeGroup, badgeVariants };

