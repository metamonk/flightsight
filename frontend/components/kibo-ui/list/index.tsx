import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

/**
 * List - A flexible, accessible list component system
 * 
 * Based on the Item pattern from the EXAMPLE design system, this provides:
 * - Semantic HTML with proper ARIA roles
 * - Flexible composition of list items
 * - Variants for different visual styles
 * - Support for media, content, actions, headers, and footers
 * - Responsive design with size variants
 * - Keyboard navigation and focus management
 * 
 * @example
 * ```tsx
 * <ListGroup>
 *   <ListItem>
 *     <ListItemMedia variant="icon">
 *       <UserIcon />
 *     </ListItemMedia>
 *     <ListItemContent>
 *       <ListItemTitle>John Doe</ListItemTitle>
 *       <ListItemDescription>Flight Instructor</ListItemDescription>
 *     </ListItemContent>
 *     <ListItemActions>
 *       <Button size="sm">Edit</Button>
 *     </ListItemActions>
 *   </ListItem>
 *   <ListItemSeparator />
 *   <ListItem>
 *     ...
 *   </ListItem>
 * </ListGroup>
 * ```
 */

/**
 * ListGroup - Container for list items
 * Provides semantic list structure with role="list"
 */
function ListGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="list"
      data-slot="list-group"
      className={cn('group/list-group flex flex-col', className)}
      {...props}
    />
  )
}

/**
 * ListItemSeparator - Visual separator between list items
 */
function ListItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="list-item-separator"
      orientation="horizontal"
      className={cn('my-0', className)}
      {...props}
    />
  )
}

/**
 * List item variants with CVA
 */
const listItemVariants = cva(
  'group/list-item flex items-center border border-transparent text-sm rounded-md transition-colors [a&]:hover:bg-accent/50 [a&]:transition-colors duration-100 flex-wrap outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border-border',
        muted: 'bg-muted/50',
      },
      size: {
        default: 'p-4 gap-4',
        sm: 'py-3 px-4 gap-2.5',
        lg: 'p-6 gap-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

/**
 * ListItem - Individual list item
 * Can be used as a regular div or as a child of an interactive element
 * via the asChild prop
 */
function ListItem({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof listItemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      role="listitem"
      data-slot="list-item"
      data-variant={variant}
      data-size={size}
      className={cn(listItemVariants({ variant, size, className }))}
      {...props}
    />
  )
}

/**
 * List item media variants (icons, images, avatars)
 */
const listItemMediaVariants = cva(
  'flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=list-item-description]]/list-item:self-start [&_svg]:pointer-events-none group-has-[[data-slot=list-item-description]]/list-item:translate-y-0.5',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "size-8 border rounded-sm bg-muted [&_svg:not([class*='size-'])]:size-4",
        image:
          'size-10 rounded-sm overflow-hidden [&_img]:size-full [&_img]:object-cover',
        avatar:
          'size-10 rounded-full overflow-hidden [&_img]:size-full [&_img]:object-cover',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

/**
 * ListItemMedia - Container for icons, images, or avatars
 */
function ListItemMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof listItemMediaVariants>) {
  return (
    <div
      data-slot="list-item-media"
      data-variant={variant}
      className={cn(listItemMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

/**
 * ListItemContent - Main content area, takes up available space
 */
function ListItemContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="list-item-content"
      className={cn(
        'flex flex-1 flex-col gap-1 [&+[data-slot=list-item-content]]:flex-none',
        className,
      )}
      {...props}
    />
  )
}

/**
 * ListItemTitle - Primary text for the list item
 */
function ListItemTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="list-item-title"
      className={cn(
        'flex w-fit items-center gap-2 text-sm leading-snug font-medium',
        className,
      )}
      {...props}
    />
  )
}

/**
 * ListItemDescription - Secondary text with automatic truncation
 */
function ListItemDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="list-item-description"
      className={cn(
        'text-muted-foreground line-clamp-2 text-sm leading-normal font-normal text-balance',
        '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  )
}

/**
 * ListItemActions - Container for action buttons or controls
 */
function ListItemActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="list-item-actions"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  )
}

/**
 * ListItemHeader - Optional header spanning full width
 */
function ListItemHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="list-item-header"
      className={cn(
        'flex basis-full items-center justify-between gap-2',
        className,
      )}
      {...props}
    />
  )
}

/**
 * ListItemFooter - Optional footer spanning full width
 */
function ListItemFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="list-item-footer"
      className={cn(
        'flex basis-full items-center justify-between gap-2',
        className,
      )}
      {...props}
    />
  )
}

/**
 * ListItemMetadata - Optional metadata container for tags, badges, timestamps
 */
function ListItemMetadata({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="list-item-metadata"
      className={cn(
        'flex items-center gap-2 text-xs text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export {
  ListGroup,
  ListItem,
  ListItemMedia,
  ListItemContent,
  ListItemTitle,
  ListItemDescription,
  ListItemActions,
  ListItemHeader,
  ListItemFooter,
  ListItemMetadata,
  ListItemSeparator,
}

// Type exports for external use
export type { VariantProps }
export type ListItemVariant = VariantProps<typeof listItemVariants>['variant']
export type ListItemSize = VariantProps<typeof listItemVariants>['size']
export type ListItemMediaVariant = VariantProps<typeof listItemMediaVariants>['variant']

