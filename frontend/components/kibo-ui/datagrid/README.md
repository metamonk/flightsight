# DataGrid Component

A comprehensive data grid component with advanced features for displaying and manipulating tabular data.

## Overview

The DataGrid component extends the basic Table with powerful data management features including sorting, filtering, pagination, row selection, and more. It's designed for displaying large datasets with excellent performance and user experience.

## Features

- ✅ **Multi-Column Sorting** - Click headers to sort by any column
- ✅ **Global Search** - Filter across all columns with real-time search
- ✅ **Pagination** - Navigate large datasets efficiently
- ✅ **Row Selection** - Single or multiple row selection
- ✅ **Custom Renderers** - Customize cell content and formatting
- ✅ **Loading States** - Built-in skeleton loaders
- ✅ **Empty States** - Customizable empty data messages
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Keyboard Navigation** - Full keyboard support
- ✅ **Accessibility** - WCAG 2.1 AA compliant
- ✅ **TypeScript** - Fully typed with generics

## Installation

```tsx
import { DataGrid, type DataGridColumn } from '@/components/kibo-ui/datagrid'
```

## Basic Usage

### Simple DataGrid

```tsx
interface User {
  id: string
  name: string
  email: string
  role: string
}

const columns: DataGridColumn<User>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: false },
]

export function UserTable() {
  const users: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  ]

  return (
    <DataGrid
      data={users}
      columns={columns}
    />
  )
}
```

### With Search and Pagination

```tsx
<DataGrid
  data={users}
  columns={columns}
  searchable
  searchPlaceholder="Search users..."
  paginated
  pageSize={25}
  pageSizeOptions={[10, 25, 50, 100]}
/>
```

### With Row Selection

```tsx
function UserTableWithSelection() {
  const [selectedIds, setSelectedIds] = React.useState<Set<string | number>>(new Set())

  return (
    <DataGrid
      data={users}
      columns={columns}
      selectable
      selectionMode="multiple"
      selectedRows={selectedIds}
      onSelectionChange={setSelectedIds}
    />
  )
}
```

## Column Configuration

### Column Definition

```tsx
interface DataGridColumn<T> {
  key: string              // Property name in data object
  label: string            // Display name in header
  sortable?: boolean       // Enable sorting (default: false)
  width?: string | number  // Column width
  hidden?: boolean         // Hide column
  render?: (value: any, row: T, index: number) => React.ReactNode
  sortFn?: (a: T, b: T) => number
  filterFn?: (row: T, query: string) => boolean
  align?: 'left' | 'center' | 'right'
  className?: string       // Additional CSS classes
}
```

### Custom Cell Rendering

```tsx
const columns: DataGridColumn<User>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    render: (value, user) => (
      <div className="flex items-center gap-2">
        <Avatar src={user.avatar} />
        <span className="font-medium">{value}</span>
      </div>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value) => (
      <Badge variant={value === 'active' ? 'default' : 'secondary'}>
        {value}
      </Badge>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    align: 'right',
    render: (_, user) => (
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => handleEdit(user)}>
          Edit
        </Button>
        <Button size="sm" variant="ghost" onClick={() => handleDelete(user)}>
          Delete
        </Button>
      </div>
    ),
  },
]
```

### Custom Sorting

```tsx
const columns: DataGridColumn<User>[] = [
  {
    key: 'created_at',
    label: 'Created',
    sortable: true,
    sortFn: (a, b) => {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    },
    render: (value) => formatDate(value),
  },
]
```

### Custom Filtering

```tsx
const columns: DataGridColumn<User>[] = [
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    filterFn: (user, query) => {
      // Custom search logic
      return user.email.toLowerCase().includes(query) ||
             user.name.toLowerCase().includes(query)
    },
  },
]
```

## Advanced Patterns

### With Loading State

```tsx
function AsyncUserTable() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  return (
    <DataGrid
      data={users ?? []}
      columns={columns}
      loading={isLoading}
    />
  )
}
```

### With Row Click Handlers

```tsx
<DataGrid
  data={bookings}
  columns={columns}
  onRowClick={(booking) => {
    router.push(`/bookings/${booking.id}`)
  }}
  onRowDoubleClick={(booking) => {
    handleQuickView(booking)
  }}
/>
```

### With HUD Styling

```tsx
<DataGrid
  data={flightData}
  columns={columns}
  withHUD
  striped
  stickyHeader
/>
```

### With Dense Padding

```tsx
<DataGrid
  data={users}
  columns={columns}
  dense
  pageSize={50}
/>
```

### Controlled Selection

```tsx
function ControlledSelectionExample() {
  const [selected, setSelected] = React.useState<Set<string | number>>(new Set())

  const handleBulkDelete = () => {
    // Use selected IDs
    console.log('Deleting:', Array.from(selected))
    setSelected(new Set()) // Clear selection
  }

  return (
    <>
      <DataGrid
        data={users}
        columns={columns}
        selectable
        selectionMode="multiple"
        selectedRows={selected}
        onSelectionChange={setSelected}
      />
      {selected.size > 0 && (
        <Button onClick={handleBulkDelete} variant="destructive">
          Delete {selected.size} items
        </Button>
      )}
    </>
  )
}
```

### Custom Row ID

```tsx
<DataGrid
  data={users}
  columns={columns}
  getRowId={(user) => user.email} // Use email as unique ID
  selectable
/>
```

## Complete Example: Bookings Table

```tsx
import { DataGrid, type DataGridColumn } from '@/components/kibo-ui/datagrid'
import { Badge } from '@/components/kibo-ui/badge'
import { Button } from '@/components/kibo-ui/button'
import { formatDate } from '@/lib/utils/date'

interface Booking {
  id: string
  scheduled_start: string
  status: 'confirmed' | 'pending' | 'cancelled'
  lesson_type: string
  student: { name: string; email: string }
  instructor: { name: string }
  aircraft: { registration: string }
}

function BookingsTable() {
  const { data: bookings, isLoading } = useBookings()
  const [selectedBookings, setSelectedBookings] = React.useState<Set<string | number>>(new Set())

  const columns: DataGridColumn<Booking>[] = [
    {
      key: 'scheduled_start',
      label: 'Date & Time',
      sortable: true,
      render: (value) => (
        <div>
          <div className="font-medium">{formatDate(value, 'MMM d, yyyy')}</div>
          <div className="text-sm text-muted-foreground">{formatDate(value, 'h:mm a')}</div>
        </div>
      ),
    },
    {
      key: 'student',
      label: 'Student',
      sortable: true,
      sortFn: (a, b) => a.student.name.localeCompare(b.student.name),
      render: (student) => (
        <div>
          <div className="font-medium">{student.name}</div>
          <div className="text-sm text-muted-foreground">{student.email}</div>
        </div>
      ),
    },
    {
      key: 'instructor',
      label: 'Instructor',
      sortable: true,
      sortFn: (a, b) => a.instructor.name.localeCompare(b.instructor.name),
      render: (instructor) => instructor.name,
    },
    {
      key: 'aircraft',
      label: 'Aircraft',
      sortable: true,
      sortFn: (a, b) => a.aircraft.registration.localeCompare(b.aircraft.registration),
      render: (aircraft) => aircraft.registration,
    },
    {
      key: 'lesson_type',
      label: 'Lesson Type',
      sortable: true,
      render: (value) => value.replace('_', ' ').toUpperCase(),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'center',
      render: (status) => (
        <Badge
          variant={
            status === 'confirmed' ? 'default' :
            status === 'pending' ? 'secondary' :
            'destructive'
          }
        >
          {status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, booking) => (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost">
            Edit
          </Button>
          <Button size="sm" variant="ghost">
            Cancel
          </Button>
        </div>
      ),
    },
  ]

  const handleBulkAction = () => {
    console.log('Selected bookings:', Array.from(selectedBookings))
  }

  return (
    <div className="space-y-4">
      {selectedBookings.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedBookings.size} booking(s) selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleBulkAction}>
              Bulk Reschedule
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSelectedBookings(new Set())}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      <DataGrid
        data={bookings ?? []}
        columns={columns}
        loading={isLoading}
        searchable
        searchPlaceholder="Search bookings..."
        paginated
        pageSize={25}
        pageSizeOptions={[10, 25, 50, 100]}
        selectable
        selectionMode="multiple"
        selectedRows={selectedBookings}
        onSelectionChange={setSelectedBookings}
        onRowClick={(booking) => {
          router.push(`/dashboard/booking/${booking.id}`)
        }}
        emptyMessage="No bookings found. Try adjusting your filters."
        striped
      />
    </div>
  )
}
```

## Props API

### DataGrid Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | **Required** | Array of data to display |
| `columns` | `DataGridColumn<T>[]` | **Required** | Column definitions |
| `searchable` | `boolean` | `false` | Enable global search |
| `searchPlaceholder` | `string` | `"Search..."` | Search input placeholder |
| `paginated` | `boolean` | `false` | Enable pagination |
| `pageSize` | `number` | `10` | Default rows per page |
| `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Available page sizes |
| `selectable` | `boolean` | `false` | Enable row selection |
| `selectionMode` | `'single' \| 'multiple'` | `'multiple'` | Selection behavior |
| `selectedRows` | `Set<string \| number>` | `undefined` | Controlled selection |
| `onSelectionChange` | `(ids: Set<string \| number>) => void` | `undefined` | Selection change handler |
| `onRowClick` | `(row: T, index: number) => void` | `undefined` | Row click handler |
| `onRowDoubleClick` | `(row: T, index: number) => void` | `undefined` | Row double-click handler |
| `getRowId` | `(row: T, index: number) => string \| number` | `(row) => row.id ?? index` | Get unique row ID |
| `loading` | `boolean` | `false` | Show loading skeletons |
| `emptyMessage` | `string` | `"No data available"` | Empty state message |
| `className` | `string` | `undefined` | Additional container CSS |
| `striped` | `boolean` | `false` | Alternate row colors |
| `withHUD` | `boolean` | `false` | Enable HUD styling |
| `stickyHeader` | `boolean` | `false` | Make header sticky |
| `dense` | `boolean` | `false` | Reduced padding |

## Accessibility

The DataGrid component follows WCAG 2.1 Level AA guidelines:

- ✅ **Keyboard Navigation** - Tab through interactive elements, arrow keys for navigation
- ✅ **Screen Reader Support** - Proper ARIA labels and semantic HTML
- ✅ **Focus Management** - Visible focus indicators on all interactive elements
- ✅ **Sort Indicators** - Visual and text indicators for sort direction
- ✅ **Selection Feedback** - Clear visual feedback for selected rows
- ✅ **Loading States** - Announced loading states
- ✅ **Empty States** - Descriptive empty state messages

### Keyboard Shortcuts

- `Tab` / `Shift+Tab` - Navigate through interactive elements
- `Space` - Toggle row selection (when focused)
- `Enter` - Trigger row click (when focused)
- `Escape` - Clear search (when search is focused)

## Performance Considerations

### Large Datasets

For optimal performance with large datasets (1000+ rows):

1. **Enable Pagination** - Limits rendered rows
```tsx
<DataGrid data={largeDataset} columns={columns} paginated pageSize={50} />
```

2. **Memoize Columns** - Prevent unnecessary re-renders
```tsx
const columns = React.useMemo(() => [
  { key: 'name', label: 'Name', sortable: true },
  // ... more columns
], [])
```

3. **Optimize Renderers** - Keep render functions lightweight
```tsx
// ❌ Don't: Heavy computation in render
render: (value) => expensiveCalculation(value)

// ✅ Do: Pre-calculate or memoize
render: (value) => preCalculatedValues[value]
```

4. **Use Dense Mode** - Reduces DOM size
```tsx
<DataGrid data={data} columns={columns} dense />
```

### Virtual Scrolling

For extremely large datasets (10,000+ rows), consider using a virtual scrolling library like `react-window` or `@tanstack/react-virtual` with the DataGrid as a template.

## Styling

### Custom Styling

```tsx
// Custom container styling
<DataGrid
  className="custom-datagrid"
  data={data}
  columns={columns}
/>

// Custom column styling
const columns: DataGridColumn<User>[] = [
  {
    key: 'name',
    label: 'Name',
    className: 'font-bold text-primary',
  },
]
```

### Theme Integration

The DataGrid uses theme tokens from your design system:

- `--color-border` - Table borders
- `--color-muted` - Striped row backgrounds
- `--color-primary` - HUD borders
- `--color-foreground` - Text colors
- `--color-muted-foreground` - Secondary text

## Common Patterns

### Export to CSV

```tsx
function ExportableDataGrid() {
  const handleExport = () => {
    const csv = data.map(row => 
      columns.map(col => row[col.key]).join(',')
    ).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.csv'
    a.click()
  }

  return (
    <>
      <Button onClick={handleExport}>Export to CSV</Button>
      <DataGrid data={data} columns={columns} />
    </>
  )
}
```

### Column Visibility Toggle

```tsx
function DataGridWithColumnToggle() {
  const [hiddenColumns, setHiddenColumns] = React.useState<Set<string>>(new Set())

  const columns: DataGridColumn<User>[] = baseColumns.map(col => ({
    ...col,
    hidden: hiddenColumns.has(col.key),
  }))

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Columns</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {baseColumns.map(col => (
            <DropdownMenuCheckboxItem
              key={col.key}
              checked={!hiddenColumns.has(col.key)}
              onCheckedChange={(checked) => {
                setHiddenColumns(prev => {
                  const next = new Set(prev)
                  if (checked) {
                    next.delete(col.key)
                  } else {
                    next.add(col.key)
                  }
                  return next
                })
              }}
            >
              {col.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DataGrid data={data} columns={columns} />
    </>
  )
}
```

### Server-Side Pagination

```tsx
function ServerPaginatedDataGrid() {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(25)

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () => fetchUsers({ page, pageSize }),
  })

  // For server-side pagination, handle page changes manually
  // and pass pre-paginated data to DataGrid
  return (
    <DataGrid
      data={data?.users ?? []}
      columns={columns}
      loading={isLoading}
      // Don't use built-in pagination for server-side
      paginated={false}
    />
  )
}
```

## Migration from Table

If you're currently using the basic Table component:

```tsx
// Before: Basic Table
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map(user => (
      <TableRow key={user.id}>
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

// After: DataGrid
const columns: DataGridColumn<User>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
]

<DataGrid
  data={users}
  columns={columns}
  searchable
  paginated
/>
```

## Related Components

- [Table](../table/README.md) - Basic table component
- [List](../list/README.md) - List component for simpler data display
- [Card](../card/README.md) - Card-based layouts

## Support

For issues or questions, refer to:
- [Design System Documentation](../../../DESIGN_SYSTEM.md)
- [Accessibility Guidelines](../../../docs/ACCESSIBILITY_GUIDELINES.md)
- [Component Library Overview](../../README.md)

