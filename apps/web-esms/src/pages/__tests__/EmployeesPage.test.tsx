import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { EmployeesPage } from '../EmployeesPage'
import { api } from '../../services/api'
import type { EmployeeDTO } from 'shared-types'

vi.mock('../../services/api', () => ({
  api: {
    getEmployees: vi.fn(),
    getDepartments: vi.fn(),
    getCountries: vi.fn(),
    getSalaryHistory: vi.fn()
  }
}))

vi.mock('../../components/ui/ToastProvider', () => ({
  notify: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

const mockEmployeeItem: EmployeeDTO = {
  id: 'emp-1',
  employeeCode: 'EMP0001',
  firstName: 'Jane',
  lastName: 'Doe',
  fullName: 'Jane Doe',
  email: 'jane.doe@example.com',
  gender: 'FEMALE',
  status: 'ACTIVE',
  hireDate: '2022-01-01',
  departmentId: 'dept-1',
  department: {
    id: 'dept-1',
    name: 'Engineering',
    code: 'ENG'
  },
  countryId: 'c-1',
  country: {
    id: 'c-1',
    name: 'United States',
    code: 'US',
    currency: 'USD',
    exchangeRateToUSD: 1
  },
  currentSalary: {
    id: 'sal-1',
    employeeId: 'emp-1',
    baseSalary: 180000,
    bonus: 20000,
    deductions: 10000,
    netSalary: 190000,
    currency: 'USD',
    isCurrent: true,
    effectiveDate: '2026-01-01'
  }
}

describe('EmployeesPage component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders employee directory with table headers and employee records', async () => {
    vi.mocked(api.getDepartments).mockResolvedValue({
      status: 'success',
      data: [{ id: 'dept-1', name: 'Engineering', code: 'ENG' }]
    })

    vi.mocked(api.getCountries).mockResolvedValue({
      status: 'success',
      data: [{ id: 'c-1', name: 'United States', code: 'US', currency: 'USD', exchangeRateToUSD: 1 }]
    })

    vi.mocked(api.getSalaryHistory).mockResolvedValue([])

    vi.mocked(api.getEmployees).mockResolvedValue({
      data: [mockEmployeeItem],
      meta: {
        page: 1,
        limit: 25,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      }
    })

    render(
      <MemoryRouter>
        <EmployeesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 4, name: /Employees/i })).toBeInTheDocument()
      expect(screen.getAllByText('Jane Doe').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('EMP0001').length).toBeGreaterThanOrEqual(1)
    })
  }, 15000)
})
