"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Table component for displaying tabular data
 * 
 * @example
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Name</TableHead>
 *       <TableHead>Status</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>John Doe</TableCell>
 *       <TableCell>Active</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 */

export type TableProps = React.HTMLAttributes<HTMLTableElement> & {
  /**
   * Enable HUD-style appearance
   * @default false
   */
  withHUD?: boolean;
  /**
   * Enable striped rows
   * @default false
   */
  striped?: boolean;
};

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, withHUD = false, striped = false, ...props }, ref) => (
    <div className="relative w-full overflow-x-auto">
      <table
        ref={ref}
        className={cn(
          "w-full caption-bottom text-sm",
          withHUD && "border border-primary/30",
          striped && "[&_tbody_tr:nth-child(even)]:bg-muted/30",
          className
        )}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  /**
   * Enable sorting functionality
   */
  sortable?: boolean;
  /**
   * Current sort direction
   */
  sortDirection?: "asc" | "desc" | null;
  /**
   * Callback when sort is triggered
   */
  onSort?: () => void;
};

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, sortable, sortDirection, onSort, ...props }, ref) => {
    const content = (
      <>
        {children}
        {sortable && (
          <span className="ml-2 inline-flex">
            {sortDirection === "asc" && <ArrowUp className="h-4 w-4" />}
            {sortDirection === "desc" && <ArrowDown className="h-4 w-4" />}
            {!sortDirection && (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
          </span>
        )}
      </>
    );

    return (
      <th
        ref={ref}
        className={cn(
          "h-10 px-2 text-left align-middle font-medium text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
          sortable && "cursor-pointer select-none hover:bg-muted/50",
          className
        )}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        {sortable ? (
          <div className="flex items-center whitespace-nowrap">{content}</div>
        ) : (
          <div className="whitespace-nowrap">{content}</div>
        )}
      </th>
    );
  }
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

/**
 * Empty state for tables with no data
 * 
 * @example
 * <TableBody>
 *   {data.length === 0 ? (
 *     <TableEmpty colSpan={3}>No results found</TableEmpty>
 *   ) : (
 *     data.map(row => <TableRow key={row.id}>...</TableRow>)
 *   )}
 * </TableBody>
 */
export type TableEmptyProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  /**
   * Number of columns to span
   */
  colSpan: number;
};

const TableEmpty = React.forwardRef<HTMLTableCellElement, TableEmptyProps>(
  ({ className, children, colSpan, ...props }, ref) => (
    <tr>
      <td
        ref={ref}
        colSpan={colSpan}
        className={cn(
          "p-8 text-center text-muted-foreground",
          className
        )}
        {...props}
      >
        {children || "No data available"}
      </td>
    </tr>
  )
);
TableEmpty.displayName = "TableEmpty";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableEmpty,
};

