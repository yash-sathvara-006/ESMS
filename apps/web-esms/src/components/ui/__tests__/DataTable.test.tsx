import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable, type ColumnDef } from '../DataTable'

interface TestUser {
  id: string
  name: string
  role: string
}

const mockColumns: ColumnDef<TestUser>[] = [
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Job Title' }
]

const mockData: TestUser[] = [
  { id: '1', name: 'Alice Smith', role: 'Staff Software Engineer' },
  { id: '2', name: 'Bob Jones', role: 'VP of Product' }
]

describe('DataTable component', () => {
  it('renders table headers and rows correctly', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        getRowId={(row) => row.id}
      />
    )

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Job Title')).toBeInTheDocument()
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
  })

  it('renders custom empty message when data is empty', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={[]}
        emptyMessage="No employees found matching filter"
      />
    )

    expect(screen.getByText('No employees found matching filter')).toBeInTheDocument()
  })

  it('handles row click callback', () => {
    const handleRowClick = vi.fn()
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        getRowId={(row) => row.id}
        onRowClick={handleRowClick}
      />
    )

    fireEvent.click(screen.getByText('Alice Smith'))
    expect(handleRowClick).toHaveBeenCalledWith(mockData[0])
  })

  it('handles pagination controls and page change', () => {
    const handlePageChange = vi.fn()
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        getRowId={(row) => row.id}
        pagination={{
          page: 1,
          limit: 10,
          total: 50,
          onPageChange: handlePageChange
        }}
      />
    )

    const nextBtn = screen.getByRole('button', { name: /next page/i })
    fireEvent.click(nextBtn)
    expect(handlePageChange).toHaveBeenCalledWith(2)
  })
})
