"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dialog component with optional HUD-style visual effects
 * 
 * @example
 * <Dialog>
 *   <DialogTrigger>Open</DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Dialog Title</DialogTitle>
 *       <DialogDescription>Dialog description</DialogDescription>
 *     </DialogHeader>
 *   </DialogContent>
 * </Dialog>
 */

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export type DialogContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  /**
   * Show the close button in the top-right corner
   * @default true
   */
  showCloseButton?: boolean;
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
   * Enable glowing border effect
   * @default false
   */
  withGlow?: boolean;
};

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      className,
      children,
      showCloseButton = true,
      withCorners = false,
      withGrid = false,
      withGlow = false,
      ...props
    },
    ref
  ) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
          "gap-4 rounded-xl border bg-background p-6 shadow-lg duration-200",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          withGlow && "border-t-primary/50 shadow-[0_-4px_20px_-4px_rgba(var(--primary),0.2)]",
          className
        )}
        {...props}
      >
        {/* Grid overlay */}
        {withGrid && (
          <div
            className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
            aria-hidden="true"
          />
        )}

        {/* Corner brackets */}
        {withCorners && (
          <>
            {/* Top-left corner */}
            <div
              className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-primary/50"
              aria-hidden="true"
            />
            {/* Top-right corner */}
            <div
              className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-primary/50"
              aria-hidden="true"
            />
            {/* Bottom-left corner */}
            <div
              className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-primary/50"
              aria-hidden="true"
            />
            {/* Bottom-right corner */}
            <div
              className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-primary/50"
              aria-hidden="true"
            />
          </>
        )}

        {/* Content */}
        <div className="relative">{children}</div>

        {/* Close button */}
        {showCloseButton && (
          <DialogPrimitive.Close
            className={cn(
              "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background",
              "transition-opacity hover:opacity-100",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:pointer-events-none",
              "data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

