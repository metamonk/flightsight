import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button component with optional HUD-style glow effects
 * 
 * @example
 * <Button>Default Button</Button>
 * <Button variant="outline" size="sm">Small Outline</Button>
 * <Button withGlow>Button with Glow</Button>
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /**
     * Render as a child component (using Radix Slot)
     * @default false
     */
    asChild?: boolean;
    /**
     * Enable HUD-style glow effect on hover/focus
     * @default false
     */
    withGlow?: boolean;
    /**
     * Intensity of the glow effect
     * @default "medium"
     */
    glowIntensity?: "subtle" | "medium" | "strong";
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      withGlow = false,
      glowIntensity = "medium",
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    // Determine glow color based on variant
    const glowColor = React.useMemo(() => {
      switch (variant) {
        case "destructive":
          return "bg-destructive/20";
        case "secondary":
          return "bg-secondary/20";
        default:
          return "bg-primary/20";
      }
    }, [variant]);

    // Determine glow blur based on intensity
    const glowBlur = React.useMemo(() => {
      switch (glowIntensity) {
        case "subtle":
          return "blur-md";
        case "strong":
          return "blur-2xl";
        default:
          return "blur-xl";
      }
    }, [glowIntensity]);

    if (withGlow) {
      return (
        <div className="relative inline-flex">
          {/* Glow effect layer */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 rounded-md opacity-0 transition-opacity duration-300",
              "group-hover:opacity-100 group-focus-visible:opacity-100",
              glowColor,
              glowBlur
            )}
            aria-hidden="true"
          />
          {/* Button */}
          <Comp
            ref={ref}
            data-slot="button"
            className={cn("group relative", buttonVariants({ variant, size, className }))}
            {...props}
          />
        </div>
      );
    }

    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

/**
 * Button with pulsing glow animation (always visible)
 * Useful for call-to-action buttons or status indicators
 */
export type ButtonPulseProps = Omit<ButtonProps, "withGlow">;

const ButtonPulse = React.forwardRef<HTMLButtonElement, ButtonPulseProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    // Determine glow color based on variant
    const glowColor = React.useMemo(() => {
      switch (variant) {
        case "destructive":
          return "bg-destructive/20";
        case "secondary":
          return "bg-secondary/20";
        default:
          return "bg-primary/20";
      }
    }, [variant]);

    return (
      <div className="relative inline-flex">
        {/* Pulsing glow effect layer */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 animate-pulse rounded-md blur-xl",
            glowColor
          )}
          aria-hidden="true"
        />
        {/* Button */}
        <Comp
          ref={ref}
          data-slot="button"
          className={cn("relative", buttonVariants({ variant, size, className }))}
          {...props}
        />
      </div>
    );
  }
);

ButtonPulse.displayName = "ButtonPulse";

/**
 * Icon button wrapper with optional glow
 * Provides proper sizing and glow effects for icon-only buttons
 */
export type ButtonIconProps = ButtonProps & {
  /**
   * ARIA label for accessibility (required for icon buttons)
   */
  "aria-label": string;
};

const ButtonIcon = React.forwardRef<HTMLButtonElement, ButtonIconProps>(
  ({ size = "icon", ...props }, ref) => {
    return <Button ref={ref} size={size} {...props} />;
  }
);

ButtonIcon.displayName = "ButtonIcon";

/**
 * Button group for related actions
 * Automatically handles spacing and border radius
 */
export type ButtonGroupProps = React.ComponentProps<"div"> & {
  /**
   * Orientation of the button group
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
};

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        className={cn(
          "inline-flex",
          orientation === "horizontal"
            ? "flex-row [&>button]:rounded-none [&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-r-md [&>button:not(:last-child)]:border-r-0"
            : "flex-col [&>button]:rounded-none [&>button:first-child]:rounded-t-md [&>button:last-child]:rounded-b-md [&>button:not(:last-child)]:border-b-0",
          className
        )}
        {...props}
      />
    );
  }
);

ButtonGroup.displayName = "ButtonGroup";

export { Button, ButtonPulse, ButtonIcon, ButtonGroup, buttonVariants };

