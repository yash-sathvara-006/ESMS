import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SalaryEditModal } from '../SalaryEditModal'
import { api } from '../../services/api'
import type { EmployeeDTO } from 'shared-types'

// Mock the API module
vi.mock('../../services/api', () => ({
  api: {
    updateSalary: vi.fn()
  }
}))

// Mock Toast Provider
vi.mock('../ui/ToastProvider', () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

const mockEmployee: EmployeeDTO = {
  id: 'emp-101',
  employeeCode: 'EMP-101',
  firstName: 'Yash',
  lastName: 'Sathvara',
  fullName: 'Yash Sathvara',
  email: 'yash@closedigit.com',
  gender: 'MALE',
  status: 'ACTIVE',
  hireDate: '2024-01-15',
  departmentId: 'dept-eng',
  department: {
    id: 'dept-eng',
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
    id: 'sal-101',
    employeeId: 'emp-101',
    baseSalary: 100000,
    bonus: 10000,
    deductions: 5000,
    netSalary: 105000,
    currency: 'USD',
    isCurrent: true,
    effectiveDate: '2026-01-01',
    deductionItems: [
      {
        id: 'ded-1',
        salaryId: 'sal-101',
        category: 'TAX',
        label: 'Federal Tax',
        amount: 5000
      }
    ]
  }
}

describe('SalaryEditModal component', () => {
  const handleClose = vi.fn()
  const handleSalaryUpdated = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders employee information and current compensation details', () => {
    render(
      <SalaryEditModal
        employee={mockEmployee}
        isOpen={true}
        onClose={handleClose}
        onSalaryUpdated={handleSalaryUpdated}
      />
    )

    expect(screen.getByRole('heading', { level: 6, name: /Update Salary & Deductions/i })).toBeInTheDocument()
    expect(screen.getByText(/Yash Sathvara · EMP-101 · Engineering/i)).toBeInTheDocument()
  })

  it('does not render when isOpen is false or employee is null', () => {
    const { container, rerender } = render(
      <SalaryEditModal
        employee={null}
        isOpen={true}
        onClose={handleClose}
        onSalaryUpdated={handleSalaryUpdated}
      />
    )
    expect(container).toBeEmptyDOMElement()

    rerender(
      <SalaryEditModal
        employee={mockEmployee}
        isOpen={false}
        onClose={handleClose}
        onSalaryUpdated={handleSalaryUpdated}
      />
    )
    expect(screen.queryByText(/Update Salary & Deductions/i)).not.toBeInTheDocument()
  })

  it('validates minimum 3-character audit change reason before submitting', async () => {
    render(
      <SalaryEditModal
        employee={mockEmployee}
        isOpen={true}
        onClose={handleClose}
        onSalaryUpdated={handleSalaryUpdated}
      />
    )

    // Set a reason shorter than 3 characters
    const reasonInput = screen.getByPlaceholderText(/Annual Merit Promotion/i)
    fireEvent.change(reasonInput, { target: { value: 'ab' } })

    const form = screen.getByRole('dialog').querySelector('form')!
    fireEvent.submit(form)

    expect(
      await screen.findByText(/Please provide a valid audit reason \(minimum 3 characters\)/i)
    ).toBeInTheDocument()
    expect(api.updateSalary).not.toHaveBeenCalled()
  })

  it('calculates live net salary dynamically when user edits base or bonus', () => {
    render(
      <SalaryEditModal
        employee={mockEmployee}
        isOpen={true}
        onClose={handleClose}
        onSalaryUpdated={handleSalaryUpdated}
      />
    )

    expect(screen.getByText('New Calculated Net Salary')).toBeInTheDocument()
    const matches = screen.getAllByText('$105,000')
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('successfully submits salary update with valid input and calls callbacks', async () => {
    vi.mocked(api.updateSalary).mockResolvedValueOnce({
      status: 'success',
      message: 'Updated',
      data: {
        ...mockEmployee.currentSalary!,
        baseSalary: 100000,
        bonus: 10000,
        netSalary: 105000
      }
    })

    render(
      <SalaryEditModal
        employee={mockEmployee}
        isOpen={true}
        onClose={handleClose}
        onSalaryUpdated={handleSalaryUpdated}
      />
    )

    // Fill in valid audit reason
    const reasonInput = screen.getByPlaceholderText(/Annual Merit Promotion/i)
    fireEvent.change(reasonInput, { target: { value: 'Annual Performance Merit Increase' } })

    const form = screen.getByRole('dialog').querySelector('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(api.updateSalary).toHaveBeenCalledWith(
        'emp-101',
        expect.objectContaining({
          baseSalary: 100000,
          bonus: 10000,
          changeReason: 'Annual Performance Merit Increase',
          changedBy: 'HR Manager'
        })
      )
    })

    expect(handleSalaryUpdated).toHaveBeenCalledWith('emp-101')
    expect(handleClose).toHaveBeenCalled()
  })
})
