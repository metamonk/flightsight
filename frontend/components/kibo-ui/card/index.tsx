import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card Component with HUD-style corner brackets and grid overlay
 * 
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *     <CardDescription>Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>Content</CardContent>
 * </Card>
 */

export type CardProps = React.ComponentProps<"div"> & {
  /**
   * Enables HUD-style corner brackets
   * @default true
   */
  withCorners?: boolean;
  /**
   * Enables grid overlay for technical look
   * @default true
   */
  withGrid?: boolean;
  /**
   * Enables glowing top border
   * @default false
   */
  withGlow?: boolean;
  /**
   * Enables scan line animation effect
   * @default false
   */
  withScanLine?: boolean;
};

function Card({
  className,
  withCorners = true,
  withGrid = true,
  withGlow = false,
  withScanLine = false,
  children,
  ...props
}: CardProps) {
  return (
    <div className="relative w-full" {...props}>
      {/* Corner accents - HUD style */}
      {withCorners && (
        <>
          <div className="absolute -left-2 -top-2 h-8 w-8 border-l-2 border-t-2 border-primary" />
          <div className="absolute -right-2 -top-2 h-8 w-8 border-r-2 border-t-2 border-primary" />
          <div className="absolute -left-2 -bottom-2 h-8 w-8 border-l-2 border-b-2 border-primary" />
          <div className="absolute -right-2 -bottom-2 h-8 w-8 border-r-2 border-b-2 border-primary" />
        </>
      )}

      {/* Main card */}
      <div
        data-slot="card"
        className={cn(
          "relative overflow-hidden",
          "bg-card text-card-foreground",
          "flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
          "backdrop-blur-sm",
          className
        )}
      >
        {/* Grid overlay for technical look */}
        {withGrid && (
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(100,150,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(100,150,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
        )}

        {/* Glowing top border */}
        {withGlow && (
          <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />
        )}

        {/* Content */}
        <div className="relative">{children}</div>

        {/* Scan line effect */}
        {withScanLine && (
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(100,150,255,0.02)_50%)] bg-[length:100%_4px] animate-[scan_8s_linear_infinite]" />
        )}
      </div>
    </div>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        "[.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("px-6", className)} {...props} />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

/**
 * Status indicator with pulse animation
 * 
 * @example
 * <CardStatus status="active" label="System Active" id="WX-2025" />
 */
export type CardStatusProps = {
  status?: "active" | "inactive" | "warning" | "error";
  label: string;
  id?: string;
  className?: string;
};

function CardStatus({
  status = "active",
  label,
  id,
  className,
}: CardStatusProps) {
  const statusColors = {
    active: "bg-accent",
    inactive: "bg-muted-foreground",
    warning: "bg-yellow-500",
    error: "bg-destructive",
  };

  const textColors = {
    active: "text-accent",
    inactive: "text-muted-foreground",
    warning: "text-yellow-500",
    error: "text-destructive",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            statusColors[status],
            status === "active" && "animate-pulse"
          )}
        />
        <span
          className={cn(
            "font-mono text-xs uppercase tracking-wider",
            textColors[status]
          )}
        >
          {label}
        </span>
      </div>
      {id && (
        <>
          <div className="h-4 w-px bg-border" />
          <span className="font-mono text-xs text-muted-foreground">
            ID: {id}
          </span>
        </>
      )}
    </div>
  );
}

/**
 * Icon container with glow effect
 * 
 * @example
 * <CardIcon>
 *   <CloudRain className="h-8 w-8" />
 * </CardIcon>
 */
export type CardIconProps = React.ComponentProps<"div"> & {
  /**
   * Enables pulsing glow effect
   * @default true
   */
  withGlow?: boolean;
};

function CardIcon({
  className,
  withGlow = true,
  children,
  ...props
}: CardIconProps) {
  return (
    <div className="relative" {...props}>
      {withGlow && (
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
      )}
      <div
        className={cn(
          "relative flex items-center justify-center",
          "h-16 w-16 rounded-lg",
          "border border-primary/30 bg-primary/10",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Stats display with technical styling
 * 
 * @example
 * <CardStats>
 *   <CardStat label="Update Rate" value="60min" variant="primary" />
 *   <CardStat label="Accuracy" value="98.5%" variant="accent" />
 * </CardStats>
 */
function CardStats({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-4 border-t border-border pt-6",
        className
      )}
      {...props}
    />
  );
}

export type CardStatProps = {
  label: string;
  value: string;
  variant?: "default" | "primary" | "accent" | "muted";
  className?: string;
};

function CardStat({
  label,
  value,
  variant = "default",
  className,
}: CardStatProps) {
  const variantColors = {
    default: "text-foreground",
    primary: "text-primary",
    accent: "text-accent",
    muted: "text-muted-foreground",
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={cn("font-mono text-xl font-semibold", variantColors[variant])}>
        {value}
      </div>
    </div>
  );
}

/**
 * Divider with gradient effect
 */
function CardDivider({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "h-px w-24 bg-gradient-to-r from-primary to-transparent",
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardStatus,
  CardIcon,
  CardStats,
  CardStat,
  CardDivider,
};

