import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { DashboardPage } from '../DashboardPage'
import { api } from '../../services/api'

// Mock react-chartjs-2 to prevent HTMLCanvasElement getContext error in jsdom
vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-bar-chart">Mock Chart</div>
}))

// Mock API calls
vi.mock('../../services/api', () => ({
  api: {
    getTimeframe: vi.fn(),
    getSummary: vi.fn(),
    getDepartmentSpend: vi.fn(),
    getCountrySpend: vi.fn(),
    getSalaryBands: vi.fn()
  }
}))

vi.mock('../../components/ui/ToastProvider', () => ({
  notify: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

describe('DashboardPage component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dashboard metrics when data is loaded from API', async () => {
    vi.mocked(api.getTimeframe).mockResolvedValueOnce({
      status: 'success',
      data: {
        years: [2026, 2025, 2024],
        currentYear: 2026,
        currentMonth: 10,
        minYear: 2024,
        maxYear: 2026
      }
    })

    vi.mocked(api.getSummary).mockResolvedValueOnce({
      status: 'success',
      data: {
        totalHeadcount: 10000,
        totalAnnualPayrollUSD: 785000000,
        averageSalaryUSD: 78500,
        medianSalaryUSD: 72000,
        totalDepartments: 6,
        totalCountries: 8
      }
    })

    vi.mocked(api.getDepartmentSpend).mockResolvedValueOnce({
      status: 'success',
      data: [
        {
          departmentId: 'dept-1',
          departmentCode: 'ENG',
          departmentName: 'Engineering',
          headcount: 3500,
          totalPayrollUSD: 310000000,
          minSalaryUSD: 60000,
          averageSalaryUSD: 88500,
          maxSalaryUSD: 160000,
          percentageOfTotalSpend: 39.5
        }
      ]
    })

    vi.mocked(api.getCountrySpend).mockResolvedValueOnce({
      status: 'success',
      data: []
    })

    vi.mocked(api.getSalaryBands).mockResolvedValueOnce({
      status: 'success',
      data: []
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('How we pay people')).toBeInTheDocument()
      expect(screen.getByText('10,000')).toBeInTheDocument()
      expect(screen.getByText('Engineering')).toBeInTheDocument()
      expect(screen.getAllByText('2026').length).toBeGreaterThanOrEqual(2)
    })
  })

  it('renders independent month and year filters for Average salary by country and Salary distribution', async () => {
    vi.mocked(api.getTimeframe).mockResolvedValueOnce({
      status: 'success',
      data: {
        years: [2026, 2025, 2024],
        currentYear: 2026,
        currentMonth: 10,
        minYear: 2024,
        maxYear: 2026
      }
    })

    vi.mocked(api.getSummary).mockResolvedValueOnce({
      status: 'success',
      data: {
        totalHeadcount: 10000,
        totalAnnualPayrollUSD: 785000000,
        averageSalaryUSD: 78500,
        medianSalaryUSD: 72000,
        totalDepartments: 6,
        totalCountries: 8
      }
    })

    vi.mocked(api.getDepartmentSpend).mockResolvedValueOnce({
      status: 'success',
      data: []
    })

    vi.mocked(api.getCountrySpend).mockResolvedValueOnce({
      status: 'success',
      data: []
    })

    vi.mocked(api.getSalaryBands).mockResolvedValueOnce({
      status: 'success',
      data: []
    })

    render(<DashboardPage />)

    await waitFor(() => {
      // Assert that both cards have their own Month and Year triggers rendered
      expect(screen.getByText('Average salary by country')).toBeInTheDocument()
      expect(screen.getByText('Salary distribution')).toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: /Select month:/i }).length).toBe(2)
      expect(screen.getAllByRole('button', { name: /Select year:/i }).length).toBe(2)
    })
  })
})
