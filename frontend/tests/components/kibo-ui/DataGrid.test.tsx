import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { DataGrid, type DataGridColumn } from '@/components/kibo-ui/datagrid'
import { testAccessibility } from '@/tests/helpers/accessibility'

interface TestUser {
  id: string
  name: string
  email: string
  role: string
  age: number
}

const mockUsers: TestUser[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', age: 30 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', age: 25 },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User', age: 35 },
  { id: '4', name: 'Alice Williams', email: 'alice@example.com', role: 'Admin', age: 28 },
  { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', age: 32 },
]

const baseColumns: DataGridColumn<TestUser>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: false },
  { key: 'age', label: 'Age', sortable: true },
]

describe('DataGrid Component', () => {
  describe('Basic Rendering', () => {
    it('should render with minimal props', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} />)
      
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should render all rows', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} />)
      
      mockUsers.forEach((user) => {
        expect(screen.getByText(user.name)).toBeInTheDocument()
      })
    })

    it('should apply custom className', () => {
      const { container } = render(
        <DataGrid data={mockUsers} columns={baseColumns} className="custom-grid" />
      )
      
      expect(container.querySelector('.custom-grid')).toBeInTheDocument()
    })
  })

  describe('Sorting', () => {
    it('should sort ascending when clicking sortable column', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} />)
      
      const nameHeader = screen.getByText('Name').closest('th')
      fireEvent.click(nameHeader!)
      
      const rows = screen.getAllByRole('row')
      const firstDataRow = rows[1] // Skip header row
      expect(within(firstDataRow).getByText('Alice Williams')).toBeInTheDocument()
    })

    it('should sort descending on second click', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} />)
      
      const nameHeader = screen.getByText('Name').closest('th')
      fireEvent.click(nameHeader!)
      fireEvent.click(nameHeader!)
      
      const rows = screen.getAllByRole('row')
      const firstDataRow = rows[1]
      expect(within(firstDataRow).getByText('John Doe')).toBeInTheDocument()
    })

    it('should clear sort on third click', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} />)
      
      const nameHeader = screen.getByText('Name').closest('th')
      fireEvent.click(nameHeader!)
      fireEvent.click(nameHeader!)
      fireEvent.click(nameHeader!)
      
      const rows = screen.getAllByRole('row')
      const firstDataRow = rows[1]
      // Should return to original order
      expect(within(firstDataRow).getByText('John Doe')).toBeInTheDocument()
    })

    it('should not sort non-sortable columns', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} />)
      
      const roleHeader = screen.getByText('Role').closest('th')
      const originalOrder = screen.getAllByRole('row')[1]
      
      fireEvent.click(roleHeader!)
      
      const newOrder = screen.getAllByRole('row')[1]
      expect(originalOrder).toEqual(newOrder)
    })

    it('should sort numbers correctly', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} />)
      
      const ageHeader = screen.getByText('Age').closest('th')
      fireEvent.click(ageHeader!)
      
      const rows = screen.getAllByRole('row')
      const firstDataRow = rows[1]
      expect(within(firstDataRow).getByText('Jane Smith')).toBeInTheDocument() // Age 25
    })
  })

  describe('Search/Filtering', () => {
    it('should show search input when searchable is true', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} searchable />)
      
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })

    it('should filter rows based on search query', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} searchable />)
      
      const searchInput = screen.getByPlaceholderText('Search...')
      fireEvent.change(searchInput, { target: { value: 'john' } })
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })

    it('should search across multiple columns', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} searchable />)
      
      const searchInput = screen.getByPlaceholderText('Search...')
      fireEvent.change(searchInput, { target: { value: 'admin' } })
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Alice Williams')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })

    it('should show clear button when search has value', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} searchable />)
      
      const searchInput = screen.getByPlaceholderText('Search...')
      fireEvent.change(searchInput, { target: { value: 'john' } })
      
      const clearButton = screen.getByLabelText('Clear search')
      expect(clearButton).toBeInTheDocument()
    })

    it('should clear search when clear button is clicked', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} searchable />)
      
      const searchInput = screen.getByPlaceholderText('Search...') as HTMLInputElement
      fireEvent.change(searchInput, { target: { value: 'john' } })
      
      const clearButton = screen.getByLabelText('Clear search')
      fireEvent.click(clearButton)
      
      expect(searchInput.value).toBe('')
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('should use custom search placeholder', () => {
      render(
        <DataGrid
          data={mockUsers}
          columns={baseColumns}
          searchable
          searchPlaceholder="Find users..."
        />
      )
      
      expect(screen.getByPlaceholderText('Find users...')).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('should show pagination controls when paginated is true', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} paginated pageSize={2} />)
      
      expect(screen.getByText(/Showing 1 to 2 of 5 results/)).toBeInTheDocument()
      expect(screen.getByLabelText('Next page')).toBeInTheDocument()
    })

    it('should paginate data correctly', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} paginated pageSize={2} />)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument()
    })

    it('should navigate to next page', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} paginated pageSize={2} />)
      
      const nextButton = screen.getByLabelText('Next page')
      fireEvent.click(nextButton)
      
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })

    it('should navigate to previous page', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} paginated pageSize={2} />)
      
      const nextButton = screen.getByLabelText('Next page')
      fireEvent.click(nextButton)
      
      const prevButton = screen.getByLabelText('Previous page')
      fireEvent.click(prevButton)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should navigate to first page', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} paginated pageSize={2} />)
      
      const nextButton = screen.getByLabelText('Next page')
      fireEvent.click(nextButton)
      fireEvent.click(nextButton)
      
      const firstButton = screen.getByLabelText('First page')
      fireEvent.click(firstButton)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should navigate to last page', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} paginated pageSize={2} />)
      
      const lastButton = screen.getByLabelText('Last page')
      fireEvent.click(lastButton)
      
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument()
    })

    it('should change page size', () => {
      render(
        <DataGrid
          data={mockUsers}
          columns={baseColumns}
          paginated
          pageSize={2}
          pageSizeOptions={[2, 5, 10]}
        />
      )
      
      const pageSelector = screen.getByRole('combobox')
      fireEvent.click(pageSelector)
      
      const option5 = screen.getByText('5')
      fireEvent.click(option5)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument()
    })

    it('should disable first/prev buttons on first page', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} paginated pageSize={2} />)
      
      expect(screen.getByLabelText('First page')).toBeDisabled()
      expect(screen.getByLabelText('Previous page')).toBeDisabled()
    })

    it('should disable next/last buttons on last page', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} paginated pageSize={10} />)
      
      expect(screen.getByLabelText('Next page')).toBeDisabled()
      expect(screen.getByLabelText('Last page')).toBeDisabled()
    })
  })

  describe('Row Selection', () => {
    it('should show checkboxes when selectable is true', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} selectable />)
      
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    it('should select individual rows', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} selectable />)
      
      const checkboxes = screen.getAllByRole('checkbox')
      const firstRowCheckbox = checkboxes[1] // Skip header checkbox
      
      fireEvent.click(firstRowCheckbox)
      expect(firstRowCheckbox).toBeChecked()
    })

    it('should select all rows with header checkbox', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} selectable />)
      
      const checkboxes = screen.getAllByRole('checkbox')
      const selectAllCheckbox = checkboxes[0]
      
      fireEvent.click(selectAllCheckbox)
      
      checkboxes.slice(1).forEach((checkbox) => {
        expect(checkbox).toBeChecked()
      })
    })

    it('should call onSelectionChange when selection changes', () => {
      const handleSelectionChange = vi.fn()
      render(
        <DataGrid
          data={mockUsers}
          columns={baseColumns}
          selectable
          onSelectionChange={handleSelectionChange}
        />
      )
      
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])
      
      expect(handleSelectionChange).toHaveBeenCalled()
    })

    it('should support single selection mode', () => {
      const handleSelectionChange = vi.fn()
      render(
        <DataGrid
          data={mockUsers}
          columns={baseColumns}
          selectable
          selectionMode="single"
          onSelectionChange={handleSelectionChange}
        />
      )
      
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0]) // First data row
      fireEvent.click(checkboxes[1]) // Second data row
      
      const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1][0]
      expect(lastCall.size).toBe(1)
    })

    it('should show selection count', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} selectable />)
      
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])
      fireEvent.click(checkboxes[2])
      
      expect(screen.getByText('2 rows selected')).toBeInTheDocument()
    })
  })

  describe('Custom Rendering', () => {
    it('should use custom render function', () => {
      const columns: DataGridColumn<TestUser>[] = [
        {
          key: 'name',
          label: 'Name',
          render: (value) => <span className="custom-name">{value.toUpperCase()}</span>,
        },
      ]

      render(<DataGrid data={mockUsers} columns={columns} />)
      
      expect(screen.getByText('JOHN DOE')).toBeInTheDocument()
      expect(screen.getByText('JOHN DOE').closest('span')).toHaveClass('custom-name')
    })

    it('should pass row and index to render function', () => {
      const columns: DataGridColumn<TestUser>[] = [
        {
          key: 'name',
          label: 'Name',
          render: (value, row, index) => (
            <span>{`${index + 1}. ${row.name} (${row.role})`}</span>
          ),
        },
      ]

      render(<DataGrid data={mockUsers} columns={columns} />)
      
      expect(screen.getByText('1. John Doe (Admin)')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show loading skeletons when loading is true', () => {
      render(<DataGrid data={[]} columns={baseColumns} loading pageSize={3} />)
      
      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should not show data when loading', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} loading />)
      
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty message when no data', () => {
      render(<DataGrid data={[]} columns={baseColumns} />)
      
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('should show custom empty message', () => {
      render(
        <DataGrid
          data={[]}
          columns={baseColumns}
          emptyMessage="No users found. Add a user to get started."
        />
      )
      
      expect(screen.getByText(/No users found/)).toBeInTheDocument()
    })

    it('should show empty message when all rows are filtered out', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} searchable />)
      
      const searchInput = screen.getByPlaceholderText('Search...')
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
      
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })
  })

  describe('Row Click Handlers', () => {
    it('should call onRowClick when row is clicked', () => {
      const handleRowClick = vi.fn()
      render(
        <DataGrid
          data={mockUsers}
          columns={baseColumns}
          onRowClick={handleRowClick}
        />
      )
      
      const firstRow = screen.getAllByRole('row')[1]
      fireEvent.click(firstRow)
      
      expect(handleRowClick).toHaveBeenCalledWith(mockUsers[0], 0)
    })

    it('should call onRowDoubleClick when row is double-clicked', () => {
      const handleDoubleClick = vi.fn()
      render(
        <DataGrid
          data={mockUsers}
          columns={baseColumns}
          onRowDoubleClick={handleDoubleClick}
        />
      )
      
      const firstRow = screen.getAllByRole('row')[1]
      fireEvent.doubleClick(firstRow)
      
      expect(handleDoubleClick).toHaveBeenCalledWith(mockUsers[0], 0)
    })
  })

  describe('Styling Variants', () => {
    it('should apply striped styling', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} striped />)
      
      const table = screen.getAllByRole('table')[0]
      expect(table).toHaveClass('[&_tbody_tr:nth-child(even)]:bg-muted/30')
    })

    it('should apply HUD styling', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} withHUD />)
      
      const table = screen.getAllByRole('table')[0]
      expect(table).toHaveClass('border-primary/30')
    })

    it('should apply dense padding', () => {
      const { container } = render(
        <DataGrid data={mockUsers} columns={baseColumns} dense />
      )
      
      const cells = container.querySelectorAll('td')
      cells.forEach((cell) => {
        expect(cell).toHaveClass('py-2')
      })
    })
  })

  describe('Column Configuration', () => {
    it('should respect column width', () => {
      const columns: DataGridColumn<TestUser>[] = [
        { key: 'name', label: 'Name', width: '300px' },
        { key: 'email', label: 'Email' },
      ]

      render(<DataGrid data={mockUsers} columns={columns} />)
      
      const nameHeader = screen.getByText('Name').closest('th')
      expect(nameHeader).toHaveStyle({ width: '300px' })
    })

    it('should hide columns with hidden prop', () => {
      const columns: DataGridColumn<TestUser>[] = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email', hidden: true },
        { key: 'role', label: 'Role' },
      ]

      render(<DataGrid data={mockUsers} columns={columns} />)
      
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.queryByText('Email')).not.toBeInTheDocument()
      expect(screen.getByText('Role')).toBeInTheDocument()
    })

    it('should align columns correctly', () => {
      const columns: DataGridColumn<TestUser>[] = [
        { key: 'name', label: 'Name', align: 'left' },
        { key: 'age', label: 'Age', align: 'center' },
        { key: 'role', label: 'Role', align: 'right' },
      ]

      render(<DataGrid data={mockUsers} columns={columns} />)
      
      const ageCell = screen.getByText('Age').closest('th')
      const roleCell = screen.getByText('Role').closest('th')
      
      expect(ageCell).toHaveClass('text-center')
      expect(roleCell).toHaveClass('text-right')
    })
  })

  describe('Accessibility', () => {
    it('should have no violations with basic grid', async () => {
      const { container } = render(<DataGrid data={mockUsers} columns={baseColumns} />)
      await testAccessibility(container)
    })

    it('should have no violations with search and pagination', async () => {
      const { container } = render(
        <DataGrid
          data={mockUsers}
          columns={baseColumns}
          searchable
          paginated
        />
      )
      await testAccessibility(container)
    })

    it('should have no violations with selection', async () => {
      const { container } = render(
        <DataGrid data={mockUsers} columns={baseColumns} selectable />
      )
      await testAccessibility(container)
    })

    it('should have proper ARIA labels', () => {
      render(<DataGrid data={mockUsers} columns={baseColumns} selectable paginated />)
      
      expect(screen.getByLabelText('Select all rows')).toBeInTheDocument()
      expect(screen.getByLabelText('First page')).toBeInTheDocument()
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty data array', () => {
      render(<DataGrid data={[]} columns={baseColumns} />)
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('should handle single row', () => {
      render(<DataGrid data={[mockUsers[0]]} columns={baseColumns} />)
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should handle missing optional properties', () => {
      const incompleteData = [{ id: '1', name: 'Test' }] as any
      const columns: DataGridColumn[] = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
      ]

      render(<DataGrid data={incompleteData} columns={columns} />)
      expect(screen.getByText('Test')).toBeInTheDocument()
    })

    it('should handle custom getRowId', () => {
      render(
        <DataGrid
          data={mockUsers}
          columns={baseColumns}
          getRowId={(user) => user.email}
          selectable
        />
      )
      
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])
      expect(checkboxes[1]).toBeChecked()
    })
  })
})

