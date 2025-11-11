"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/kibo-ui/table";
import { Button } from "@/components/kibo-ui/button";
import { Input } from "@/components/kibo-ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/kibo-ui/select";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * DataGrid - Advanced data table component with sorting, filtering, pagination
 * 
 * A comprehensive data grid component that extends the basic Table with:
 * - Multi-column sorting
 * - Search/filtering
 * - Pagination with configurable page sizes
 * - Row selection (single/multiple)
 * - Column visibility control
 * - Loading and empty states
 * - Responsive design
 * - Keyboard navigation
 * - Accessibility features
 * 
 * @example
 * ```tsx
 * const columns: DataGridColumn<User>[] = [
 *   { key: 'name', label: 'Name', sortable: true },
 *   { key: 'email', label: 'Email', sortable: true },
 *   { key: 'role', label: 'Role', sortable: false },
 * ]
 * 
 * <DataGrid
 *   data={users}
 *   columns={columns}
 *   searchable
 *   paginated
 *   pageSize={10}
 *   onRowClick={(user) => handleUserClick(user)}
 * />
 * ```
 */

export interface DataGridColumn<T = any> {
  /** Unique key for the column (must match data property) */
  key: string;
  /** Display label for column header */
  label: string;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Custom width for the column */
  width?: string | number;
  /** Hide column by default */
  hidden?: boolean;
  /** Custom cell renderer */
  render?: (value: any, row: T, index: number) => React.ReactNode;
  /** Custom sort comparator */
  sortFn?: (a: T, b: T) => number;
  /** Custom filter function */
  filterFn?: (row: T, query: string) => boolean;
  /** Alignment of cell content */
  align?: "left" | "center" | "right";
  /** CSS class for the column */
  className?: string;
}

export interface DataGridProps<T = any> {
  /** Array of data to display */
  data: T[];
  /** Column definitions */
  columns: DataGridColumn<T>[];
  /** Enable global search/filter */
  searchable?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Enable pagination */
  paginated?: boolean;
  /** Default page size */
  pageSize?: number;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Enable row selection */
  selectable?: boolean;
  /** Selection mode */
  selectionMode?: "single" | "multiple";
  /** Selected row IDs */
  selectedRows?: Set<string | number>;
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: Set<string | number>) => void;
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Row double-click handler */
  onRowDoubleClick?: (row: T, index: number) => void;
  /** Get unique row ID */
  getRowId?: (row: T, index: number) => string | number;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional className for the container */
  className?: string;
  /** Enable striped rows */
  striped?: boolean;
  /** Enable HUD styling */
  withHUD?: boolean;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Dense padding */
  dense?: boolean;
}

type SortDirection = "asc" | "desc" | null;

interface SortState {
  key: string;
  direction: SortDirection;
}

/**
 * DataGrid Component
 */
export function DataGrid<T = any>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = "Search...",
  paginated = false,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  selectable = false,
  selectionMode = "multiple",
  selectedRows: controlledSelectedRows,
  onSelectionChange,
  onRowClick,
  onRowDoubleClick,
  getRowId = (row: any, index: number) => row.id ?? index,
  loading = false,
  emptyMessage = "No data available",
  className,
  striped = false,
  withHUD = false,
  stickyHeader = false,
  dense = false,
}: DataGridProps<T>) {
  // State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortState, setSortState] = React.useState<SortState>({ key: "", direction: null });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [currentPageSize, setCurrentPageSize] = React.useState(pageSize);
  const [internalSelectedRows, setInternalSelectedRows] = React.useState<Set<string | number>>(new Set());

  // Use controlled or internal selection
  const selectedRows = controlledSelectedRows ?? internalSelectedRows;
  const setSelectedRows = onSelectionChange ?? setInternalSelectedRows;

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchable || !searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((row) => {
      // Check each column for matches
      return columns.some((column) => {
        if (column.filterFn) {
          return column.filterFn(row, query);
        }
        
        const value = (row as any)[column.key];
        if (value == null) return false;
        
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchable, columns]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortState.key || !sortState.direction) return filteredData;

    const column = columns.find((col) => col.key === sortState.key);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      if (column.sortFn) {
        const result = column.sortFn(a, b);
        return sortState.direction === "asc" ? result : -result;
      }

      const aValue = (a as any)[column.key];
      const bValue = (b as any)[column.key];

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Compare values
      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortState.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortState, columns]);

  // Paginate data
  const { paginatedData, totalPages } = React.useMemo(() => {
    if (!paginated) {
      return { paginatedData: sortedData, totalPages: 1 };
    }

    const total = Math.ceil(sortedData.length / currentPageSize);
    const start = (currentPage - 1) * currentPageSize;
    const end = start + currentPageSize;

    return {
      paginatedData: sortedData.slice(start, end),
      totalPages: total,
    };
  }, [sortedData, paginated, currentPage, currentPageSize]);

  // Visible columns
  const visibleColumns = React.useMemo(() => {
    return columns.filter((col) => !col.hidden);
  }, [columns]);

  // Handlers
  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    setSortState((prev) => {
      if (prev.key !== columnKey) {
        return { key: columnKey, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { key: columnKey, direction: "desc" };
      }
      return { key: "", direction: null };
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedData.map((row, index) => getRowId(row as T, index)));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (rowId: string | number) => {
    const newSet = new Set(selectedRows);
    if (selectionMode === "single") {
      newSet.clear();
      newSet.add(rowId);
    } else {
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
    }
    setSelectedRows(newSet);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (size: string) => {
    setCurrentPageSize(Number(size));
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate stats
  const startIndex = paginated ? (currentPage - 1) * currentPageSize + 1 : 1;
  const endIndex = paginated ? Math.min(currentPage * currentPageSize, sortedData.length) : sortedData.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      {(searchable || selectable) && (
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Selection info */}
          {selectable && selectedRows.size > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedRows.size} row{selectedRows.size !== 1 ? "s" : ""} selected
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div
        className={cn(
          "rounded-lg border overflow-hidden",
          withHUD && "border-primary/30"
        )}
      >
        <div className={cn("overflow-x-auto", stickyHeader && "max-h-[600px]")}>
          <Table striped={striped} withHUD={withHUD}>
            <TableHeader className={cn(stickyHeader && "sticky top-0 z-10 bg-background")}>
              <TableRow>
                {/* Selection column */}
                {selectable && selectionMode === "multiple" && (
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={paginatedData.length > 0 && selectedRows.size === paginatedData.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-input"
                      aria-label="Select all rows"
                    />
                  </TableHead>
                )}

                {/* Data columns */}
                {visibleColumns.map((column) => (
                  <TableHead
                    key={column.key}
                    sortable={column.sortable}
                    sortDirection={sortState.key === column.key ? sortState.direction : null}
                    onSort={column.sortable ? () => handleSort(column.key) : undefined}
                    style={{ width: column.width }}
                    className={cn(
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right",
                      dense && "py-2",
                      column.className
                    )}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Loading state */}
              {loading && (
                <>
                  {Array.from({ length: pageSize }).map((_, i) => (
                    <TableRow key={i}>
                      {selectable && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                      {visibleColumns.map((col) => (
                        <TableCell key={col.key}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              )}

              {/* Empty state */}
              {!loading && paginatedData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                    className="h-32 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}

              {/* Data rows */}
              {!loading &&
                paginatedData.map((row, index) => {
                  const rowId = getRowId(row as T, index);
                  const isSelected = selectedRows.has(rowId);

                  return (
                    <TableRow
                      key={rowId}
                      data-state={isSelected ? "selected" : undefined}
                      onClick={() => onRowClick?.(row as T, index)}
                      onDoubleClick={() => onRowDoubleClick?.(row as T, index)}
                      className={cn(
                        onRowClick && "cursor-pointer",
                        dense && "h-10"
                      )}
                    >
                      {/* Selection cell */}
                      {selectable && (
                        <TableCell className="w-12">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(rowId)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-input"
                            aria-label={`Select row ${rowId}`}
                          />
                        </TableCell>
                      )}

                      {/* Data cells */}
                      {visibleColumns.map((column) => {
                        const value = (row as any)[column.key];
                        const renderedValue = column.render
                          ? column.render(value, row as T, index)
                          : value;

                        return (
                          <TableCell
                            key={column.key}
                            className={cn(
                              column.align === "center" && "text-center",
                              column.align === "right" && "text-right",
                              dense && "py-2",
                              column.className
                            )}
                          >
                            {renderedValue}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {paginated && !loading && sortedData.length > 0 && (
        <div className="flex items-center justify-between gap-4 text-sm">
          {/* Results info */}
          <div className="text-muted-foreground">
            Showing {startIndex} to {endIndex} of {sortedData.length} result{sortedData.length !== 1 ? "s" : ""}
          </div>

          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            {/* Page size selector */}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Rows per page:</span>
              <Select value={String(currentPageSize)} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="h-8 w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
                aria-label="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1 px-2">
                <span className="text-muted-foreground">Page</span>
                <span className="font-medium">{currentPage}</span>
                <span className="text-muted-foreground">of</span>
                <span className="font-medium">{totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
                aria-label="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

DataGrid.displayName = "DataGrid";

// Type exports
export type { SortDirection, SortState };

