"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

/**
 * Tabs component for organizing content into separate views
 * 
 * @example
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Content 1</TabsContent>
 *   <TabsContent value="tab2">Content 2</TabsContent>
 * </Tabs>
 */

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    className={cn("flex flex-col gap-2", className)}
    {...props}
  />
));
Tabs.displayName = TabsPrimitive.Root.displayName;

export type TabsListProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.List
> & {
  /**
   * Style variant
   * @default "default"
   */
  variant?: "default" | "underline" | "pills";
  /**
   * Enable HUD-style appearance
   * @default false
   */
  withHUD?: boolean;
};

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = "default", withHUD = false, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center",
      variant === "default" &&
        "h-9 w-fit rounded-lg bg-muted p-[3px] text-muted-foreground",
      variant === "underline" && "w-full border-b",
      variant === "pills" && "gap-2",
      withHUD &&
        variant === "default" &&
        "border border-primary/30 bg-background/50 backdrop-blur-sm",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export type TabsTriggerProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> & {
  /**
   * Show badge/count indicator
   */
  badge?: string | number;
  /**
   * Enable icon support
   */
  icon?: React.ReactNode;
};

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, badge, icon, children, ...props }, ref) => {
  const variant = React.useContext(TabsListVariantContext);

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium",
        "transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Default variant
        variant === "default" &&
          cn(
            "h-[calc(100%-1px)] flex-1 rounded-md border border-transparent px-3 py-1",
            "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            "dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30"
          ),
        // Underline variant
        variant === "underline" &&
          cn(
            "border-b-2 border-transparent px-4 py-2",
            "data-[state=active]:border-primary data-[state=active]:text-foreground",
            "hover:text-foreground"
          ),
        // Pills variant
        variant === "pills" &&
          cn(
            "rounded-md px-3 py-1.5",
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
            "hover:bg-muted"
          ),
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
      {badge !== undefined && (
        <span
          className={cn(
            "ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
            variant === "pills" && "data-[state=active]:bg-primary-foreground data-[state=active]:text-primary",
            variant !== "pills" && "bg-muted text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          )}
        >
          {badge}
        </span>
      )}
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// Context for variant prop
const TabsListVariantContext = React.createContext<
  "default" | "underline" | "pills"
>("default");

// Wrapper to provide variant context
export type TabsWithVariantProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Root
> & {
  /**
   * Style variant for the tabs
   * @default "default"
   */
  variant?: "default" | "underline" | "pills";
  /**
   * Enable HUD styling
   * @default false
   */
  withHUD?: boolean;
};

const TabsWithVariant = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsWithVariantProps
>(({ variant = "default", withHUD = false, children, ...props }, ref) => (
  <TabsListVariantContext.Provider value={variant}>
    <Tabs ref={ref} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === TabsList) {
          return React.cloneElement(child as React.ReactElement<TabsListProps>, {
            variant,
            withHUD,
          });
        }
        return child;
      })}
    </Tabs>
  </TabsListVariantContext.Provider>
));
TabsWithVariant.displayName = "TabsWithVariant";

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsWithVariant };

