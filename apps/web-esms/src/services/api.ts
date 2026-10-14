import type {
  EmployeeDTO,
  PaginatedResponse,
  EmployeeFilterQuery,
  UpdateSalaryInput,
  SalaryDTO,
  DepartmentDTO,
  CountryDTO,
  AnalyticsSummaryDTO,
  DepartmentSpendDTO,
  CountrySpendDTO,
  PayEquityDTO,
  SalaryBandDTO,
  SalaryAuditLogDTO,
  ExportEmployeeInput
} from 'shared-types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    const json = await response.json();

    if (!response.ok) {
      const errorMsg = json.message || json.errors?.map((e: any) => e.message).join(', ') || 'An unexpected error occurred';
      throw new Error(errorMsg);
    }

    return json;
  }

  // Health
  async checkHealth(): Promise<{ status: string; databaseProvider: string; timestamp: string }> {
    return this.request<{ status: string; databaseProvider: string; timestamp: string }>('/health');
  }

  // Metadata
  async getDepartments(): Promise<{ status: string; data: DepartmentDTO[] }> {
    return this.request<{ status: string; data: DepartmentDTO[] }>('/metadata/departments');
  }

  async getCountries(): Promise<{ status: string; data: CountryDTO[] }> {
    return this.request<{ status: string; data: CountryDTO[] }>('/metadata/countries');
  }

  // Employees
  async getEmployees(filters: Partial<EmployeeFilterQuery> = {}): Promise<PaginatedResponse<EmployeeDTO>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.departmentId) params.append('departmentId', filters.departmentId);
    if (filters.countryId) params.append('countryId', filters.countryId);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.status) params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<{ status: string; data: EmployeeDTO[]; meta: any }>(`/employees${qs}`);
    return {
      data: res.data,
      meta: res.meta
    };
  }

  async getEmployeeById(id: string): Promise<{ status: string; data: EmployeeDTO }> {
    return this.request<{ status: string; data: EmployeeDTO }>(`/employees/${id}`);
  }

  async getSalaryHistory(employeeId: string): Promise<SalaryAuditLogDTO[]> {
    const res = await this.getEmployeeById(employeeId);
    return res.data?.salaryAuditLogs || [];
  }

  async updateSalary(employeeId: string, input: UpdateSalaryInput): Promise<{ status: string; message: string; data: SalaryDTO }> {
    return this.request<{ status: string; message: string; data: SalaryDTO }>(`/employees/${employeeId}/salary`, {
      method: 'PUT',
      body: JSON.stringify(input)
    });
  }

  async exportEmployees(input: ExportEmployeeInput): Promise<Blob> {
    const response = await fetch(`${API_BASE}/employees/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      throw new Error(json.message || 'Failed to export employees from backend');
    }

    return response.blob();
  }

  // Strategic Analytics
  async getSummary(): Promise<{ status: string; data: AnalyticsSummaryDTO }> {
    return this.request<{ status: string; data: AnalyticsSummaryDTO }>('/analytics/summary');
  }

  async getDepartmentSpend(): Promise<{ status: string; data: DepartmentSpendDTO[] }> {
    return this.request<{ status: string; data: DepartmentSpendDTO[] }>('/analytics/by-department');
  }

  async getCountrySpend(): Promise<{ status: string; data: CountrySpendDTO[] }> {
    return this.request<{ status: string; data: CountrySpendDTO[] }>('/analytics/by-country');
  }

  async getPayEquity(): Promise<{ status: string; data: PayEquityDTO[] }> {
    return this.request<{ status: string; data: PayEquityDTO[] }>('/analytics/pay-equity');
  }

  async getSalaryBands(): Promise<{ status: string; data: SalaryBandDTO[] }> {
    return this.request<{ status: string; data: SalaryBandDTO[] }>('/analytics/salary-bands');
  }
}

export const api = new ApiService();
