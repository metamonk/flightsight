"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Select component with optional HUD-style glow effects for technical aesthetics
 * Built on Radix UI Select primitives for accessibility
 * 
 * @example
 * <Select>
 *   <SelectTrigger>
 *     <SelectValue placeholder="Select an option" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="option1">Option 1</SelectItem>
 *     <SelectItem value="option2">Option 2</SelectItem>
 *   </SelectContent>
 * </Select>
 * 
 * @example
 * // With glow effect
 * <Select>
 *   <SelectTrigger withGlow variant="primary">
 *     <SelectValue placeholder="Select with glow" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="1">Item 1</SelectItem>
 *   </SelectContent>
 * </Select>
 */

const selectTriggerVariants = cva(
  "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        primary:
          "border-primary/50 focus-visible:border-primary focus-visible:ring-primary/50 focus-visible:ring-[3px]",
        error:
          "border-destructive ring-destructive/20 dark:ring-destructive/40 focus-visible:border-destructive focus-visible:ring-destructive/50 focus-visible:ring-[3px]",
      },
      size: {
        sm: "h-8",
        default: "h-9",
        lg: "h-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

export type SelectTriggerProps = React.ComponentProps<
  typeof SelectPrimitive.Trigger
> &
  VariantProps<typeof selectTriggerVariants> & {
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

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(
  (
    {
      className,
      children,
      variant,
      size,
      withGlow = false,
      glowIntensity = "medium",
      ...props
    },
    ref
  ) => {
    // Determine glow color based on variant
    const glowColor = React.useMemo(() => {
      switch (variant) {
        case "primary":
          return "bg-primary/20";
        case "error":
          return "bg-destructive/20";
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
              "group-focus-visible:opacity-100 group-data-[state=open]:opacity-100",
              glowColor,
              glowBlur
            )}
            aria-hidden="true"
          />
          {/* Select Trigger */}
          <SelectPrimitive.Trigger
            ref={ref}
            data-slot="select-trigger"
            className={cn(
              "group relative",
              selectTriggerVariants({ variant, size, className })
            )}
            {...props}
          >
            {children}
            <SelectPrimitive.Icon asChild>
              <ChevronDownIcon className="size-4 opacity-50" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
        </div>
      );
    }

    return (
      <SelectPrimitive.Trigger
        ref={ref}
        data-slot="select-trigger"
        className={cn(selectTriggerVariants({ variant, size, className }))}
        {...props}
      >
        {children}
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon className="size-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    );
  }
);

SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    data-slot="select-scroll-up-button"
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUpIcon className="size-4" />
  </SelectPrimitive.ScrollUpButton>
));

SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    data-slot="select-scroll-down-button"
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDownIcon className="size-4" />
  </SelectPrimitive.ScrollDownButton>
));

SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentProps<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      data-slot="select-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));

SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentProps<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    data-slot="select-label"
    className={cn("text-muted-foreground px-2 py-1.5 text-xs font-medium", className)}
    {...props}
  />
));

SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentProps<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    data-slot="select-item"
    className={cn(
      "focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));

SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentProps<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    data-slot="select-separator"
    className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
    {...props}
  />
));

SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

/**
 * SelectField - Complete select with label and helper text
 * Automatically links label to select and handles layout
 */
export type SelectFieldProps = SelectTriggerProps & {
  /**
   * Label text (required for accessibility)
   */
  label: string;
  /**
   * Optional helper text displayed below select
   */
  helperText?: string;
  /**
   * Optional error message (sets variant to error)
   */
  error?: string;
  /**
   * The select content (items)
   */
  children: React.ReactNode;
  /**
   * Placeholder text for the select value
   */
  placeholder?: string;
  /**
   * Value change handler
   */
  onValueChange?: (value: string) => void;
  /**
   * Current value
   */
  value?: string;
  /**
   * Default value
   */
  defaultValue?: string;
};

const SelectField = React.forwardRef<HTMLButtonElement, SelectFieldProps>(
  (
    {
      label,
      helperText,
      error,
      children,
      placeholder,
      variant,
      className,
      onValueChange,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const selectId = React.useId();
    const helperId = helperText ? `${selectId}-helper` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;
    const describedBy = [helperId, errorId].filter(Boolean).join(" ");

    return (
      <div className="space-y-2">
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
        <Select
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
        >
          <SelectTrigger
            ref={ref}
            id={selectId}
            variant={error ? "error" : variant}
            aria-describedby={describedBy || undefined}
            aria-invalid={error ? true : undefined}
            className={className}
            {...props}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>{children}</SelectContent>
        </Select>
        {helperText && !error && (
          <p id={helperId} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectField,
  selectTriggerVariants,
};

