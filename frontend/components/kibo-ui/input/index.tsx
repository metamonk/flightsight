import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Input component with optional HUD-style glow effects for technical aesthetics
 * 
 * @example
 * <Input placeholder="Enter text..." />
 * <Input withGlow placeholder="With glow effect" />
 * <Input variant="error" value="Invalid input" />
 */

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default:
          "border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        error:
          "border-destructive ring-destructive/20 dark:ring-destructive/40 focus-visible:border-destructive focus-visible:ring-destructive/50 focus-visible:ring-[3px]",
        success:
          "border-primary ring-primary/20 dark:ring-primary/40 focus-visible:border-primary focus-visible:ring-primary/50 focus-visible:ring-[3px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type InputProps = Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants> & {
    /**
     * Enable HUD-style glow effect on focus
     * @default false
     */
    withGlow?: boolean;
    /**
     * Intensity of the glow effect
     * @default "medium"
     */
    glowIntensity?: "subtle" | "medium" | "strong";
  };

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant,
      withGlow = false,
      glowIntensity = "medium",
      ...props
    },
    ref
  ) => {
    // Determine glow color based on variant
    const glowColor = React.useMemo(() => {
      switch (variant) {
        case "error":
          return "bg-destructive/20";
        case "success":
          return "bg-primary/20";
        default:
          return "bg-ring/20";
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
        <div className="relative inline-flex w-full">
          {/* Glow effect layer */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 rounded-md opacity-0 transition-opacity duration-300",
              "group-focus-within:opacity-100",
              glowColor,
              glowBlur
            )}
            aria-hidden="true"
          />
          {/* Input */}
          <input
            ref={ref}
            type={type}
            data-slot="input"
            className={cn("group relative", inputVariants({ variant, className }))}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(inputVariants({ variant, className }))}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

/**
 * Input with label wrapper for better accessibility
 * Automatically links label to input and handles layout
 */
export type InputFieldProps = InputProps & {
  /**
   * Label text (required for accessibility)
   */
  label: string;
  /**
   * Optional helper text displayed below input
   */
  helperText?: string;
  /**
   * Optional error message (sets variant to error)
   */
  error?: string;
  /**
   * Layout orientation
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal";
};

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      helperText,
      error,
      orientation = "vertical",
      id,
      variant,
      className,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [helperId, errorId].filter(Boolean).join(" ");

    return (
      <div
        className={cn(
          "space-y-2",
          orientation === "horizontal" && "flex items-center gap-4 space-y-0"
        )}
      >
        <label
          htmlFor={inputId}
          className={cn(
            "text-sm font-medium text-foreground",
            orientation === "horizontal" && "min-w-32"
          )}
        >
          {label}
        </label>
        <div className="flex-1 space-y-1">
          <Input
            ref={ref}
            id={inputId}
            variant={error ? "error" : variant}
            aria-describedby={describedBy || undefined}
            aria-invalid={error ? true : undefined}
            className={className}
            {...props}
          />
          {helperText && !error && (
            <p
              id={helperId}
              className="text-xs text-muted-foreground"
            >
              {helperText}
            </p>
          )}
          {error && (
            <p
              id={errorId}
              className="text-xs text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

InputField.displayName = "InputField";

/**
 * Input group for related inputs with consistent styling
 * Useful for forms with multiple related fields
 */
export type InputGroupProps = React.ComponentProps<"div"> & {
  /**
   * Orientation of the input group
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal";
};

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, orientation = "vertical", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        className={cn(
          "flex",
          orientation === "horizontal"
            ? "flex-row items-end gap-2"
            : "flex-col gap-4",
          className
        )}
        {...props}
      />
    );
  }
);

InputGroup.displayName = "InputGroup";

/**
 * Search input with built-in styling and icon support
 * Optimized for search functionality with appropriate semantics
 */
export type SearchInputProps = Omit<InputProps, "type">;

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <Input
          ref={ref}
          type="search"
          className={cn("pl-9", className)}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { Input, InputField, InputGroup, SearchInput, inputVariants };

