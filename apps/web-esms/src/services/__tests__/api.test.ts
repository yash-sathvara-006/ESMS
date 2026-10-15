import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api } from '../api'

describe('ApiService', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('getEmployees formats query parameters and returns paginated data', async () => {
    const mockResponse = {
      status: 'success',
      data: [{ id: '1', fullName: 'Alice Johnson' }],
      meta: { page: 1, limit: 10, total: 100 }
    }

    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response)

    const result = await api.getEmployees({
      page: 2,
      limit: 25,
      search: 'Alice'
    })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('page=2&limit=25&search=Alice'),
      expect.any(Object)
    )
    expect(result).toEqual({
      data: mockResponse.data,
      meta: mockResponse.meta
    })
  })

  it('updateSalary sends PUT request with proper JSON body and returns updated salary', async () => {
    const mockUpdated = {
      id: 'sal-100',
      baseSalary: 120000,
      netSalary: 130000
    }

    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdated
    } as Response)

    const result = await api.updateSalary('emp-100', {
      baseSalary: 120000,
      bonus: 15000,
      deductions: 5000,
      currency: 'USD',
      changeReason: 'Merit Promotion',
      changedBy: 'HR Lead'
    })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/employees/emp-100/salary'),
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: expect.stringContaining('"baseSalary":120000')
      })
    )
    expect(result).toEqual(mockUpdated)
  })

  it('throws an informative error when the server response is not ok', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Employee not found in organization' })
    } as Response)

    await expect(api.getEmployeeById('non-existent-id')).rejects.toThrow(
      'Employee not found in organization'
    )
  })
})
