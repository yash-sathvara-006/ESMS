import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {
  EmployeeDTO,
  DepartmentDTO,
  CountryDTO,
  PaginationMeta,
  SalaryAuditLogDTO
} from 'shared-types';
import { api } from '../services/api';
import { notify } from '../components/ui/ToastProvider';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { DataTable, type ColumnDef } from '../components/ui/DataTable';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Skeleton } from '../components/ui/Skeleton';
import { SalaryEditModal } from '../components/SalaryEditModal';
import { useDebounce } from '../hooks/useDebounce';
import { /* Plus, */ Download, Upload, Edit3, User } from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // ── Employee list ─────────────────────────────────────────────────────────
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Filter options ────────────────────────────────────────────────────────
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [countries, setCountries] = useState<CountryDTO[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  // ── Active filters ────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchTerm, 350);
  const [selectedDept, setSelectedDept] = useState(searchParams.get('departmentId') || '');
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('countryId') || '');
  const [selectedGender, setSelectedGender] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // Reset page to 1 when search term debounce triggers
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // ── Detail panel ──────────────────────────────────────────────────────────
  const [selectedEmp, setSelectedEmp] = useState<EmployeeDTO | null>(null);
  const [empAuditLogs, setEmpAuditLogs] = useState<SalaryAuditLogDTO[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // ── Salary modal ──────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEmployee, setModalEmployee] = useState<EmployeeDTO | null>(null);

  // ── Load filter metadata once ─────────────────────────────────────────────
  useEffect(() => {
    setIsLoadingFilters(true);
    Promise.all([api.getDepartments(), api.getCountries()])
      .then(([deptRes, countryRes]) => {
        setDepartments(deptRes.data || []);
        setCountries(countryRes.data || []);
      })
      .catch(() => {
        notify.error('Cannot connect to ESMS backend. Ensure server is running on port 5000.');
      })
      .finally(() => {
        setIsLoadingFilters(false);
      });
  }, []);

  // ── Load employees (re-runs when any filter/page/limit changes) ───────────
  const loadEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getEmployees({
        page,
        limit,
        search: debouncedSearch || undefined,
        departmentId: selectedDept || undefined,
        countryId: selectedCountry || undefined,
        gender: (selectedGender as any) || undefined,
        status: 'ACTIVE',
        sortBy: 'employeeCode',
        sortOrder: 'asc'
      });
      setEmployees(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      notify.error(`Failed to load employees: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedDept, selectedCountry, selectedGender]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // ── Auto-select first employee if selectedEmp not in current list ─────────
  useEffect(() => {
    if (employees.length === 0) {
      setSelectedEmp(null);
      setEmpAuditLogs([]);
      return;
    }

    if (!selectedEmp) {
      setSelectedEmp(employees[0]);
    } else {
      const match = employees.find((e) => e.id === selectedEmp.id);
      if (match) {
        setSelectedEmp(match);
      } else {
        // If current employee not in filtered list, select first filtered employee
        setSelectedEmp(employees[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees]);

  // ── Salary history for selected employee ──────────────────────────────────
  const loadSalaryHistory = useCallback(async (empId: string) => {
    try {
      setIsLoadingLogs(true);
      const logs = await api.getSalaryHistory(empId);
      const seen = new Set<string>();
      const unique = (logs || []).filter((l) => {
        if (seen.has(l.id)) return false;
        seen.add(l.id);
        return true;
      });
      unique.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
      setEmpAuditLogs(unique);
    } catch {
      setEmpAuditLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEmp?.id) {
      loadSalaryHistory(selectedEmp.id);
    }
  }, [selectedEmp?.id, loadSalaryHistory]);

  const handleEditEmployee = (emp: EmployeeDTO) => {
    setModalEmployee(emp);
    setIsModalOpen(true);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to page 1 when page size changes
  };

  const handleSalaryUpdated = async (updatedEmpId?: string) => {
    const targetId = updatedEmpId || selectedEmp?.id;
    // 1. Reload the employee table in background
    loadEmployees();

    // 2. Immediately refresh the selected employee's details (base salary, gauge, etc.)
    if (targetId) {
      try {
        const res = await api.getEmployeeById(targetId);
        if (res.data) {
          setSelectedEmp(res.data);
        }
        // 3. Immediately refresh salary history audit logs
        await loadSalaryHistory(targetId);
      } catch (err) {
        console.error('Error refreshing updated employee:', err);
      }
    }
  };

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0
    }).format(amount);

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns: ColumnDef<EmployeeDTO>[] = [
    {
      key: 'fullName',
      header: 'Employee',
      render: (emp) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
            {emp.fullName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            {emp.employeeCode}
          </Typography>
        </Box>
      )
    },
    {
      key: 'title',
      header: 'Title',
      render: (emp) => (
        <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.8125rem' }}>
          {emp.department?.name} Specialist
        </Typography>
      )
    },
    {
      key: 'country',
      header: 'Country',
      render: (emp) => (
        <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.8125rem' }}>
          {emp.country?.name}
        </Typography>
      )
    },
    {
      key: 'baseSalary',
      header: 'Base Salary',
      render: (emp) => {
        const sal = emp.currentSalary;
        return (
          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
            {sal ? formatCurrency(sal.baseSalary, sal.currency) : '$0'}
          </Typography>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (emp) => (
        <Badge
          label={emp.status === 'ACTIVE' ? 'Active' : 'On leave'}
          variant={emp.status === 'ACTIVE' ? 'success' : 'warning'}
          size="sm"
        />
      )
    }
  ];

  // ── Pay band gauge ────────────────────────────────────────────────────────
  const curSalary = selectedEmp?.currentSalary?.baseSalary || 0;
  const minBand = Math.round(curSalary * 0.7);
  const maxBand = Math.round(curSalary * 1.4);
  const bandPos = maxBand > minBand ? Math.round(((curSalary - minBand) / (maxBand - minBand)) * 100) : 50;

  const formatDateSafe = (dateStr?: string) => {
    if (!dateStr) return 'Current';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Current' : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // ── Unified salary history items (Always includes Current Active Salary) ──
  const salaryHistoryItems = useMemo(() => {
    if (!selectedEmp || !selectedEmp.currentSalary) return [];

    const items: Array<{
      id: string;
      date: string;
      title: string;
      subtitle: string;
      isCurrent: boolean;
      amount: number;
      currency: string;
    }> = [];

    // 1. Current Active Salary (Always first)
    items.push({
      id: 'current-active-salary',
      date: selectedEmp.currentSalary.effectiveDate || selectedEmp.hireDate || '',
      title: 'Current Salary',
      subtitle: empAuditLogs.length > 0
        ? (empAuditLogs[0].changeReason || 'Latest adjusted salary')
        : 'Initial contract baseline',
      isCurrent: true,
      amount: selectedEmp.currentSalary.baseSalary,
      currency: selectedEmp.currentSalary.currency
    });

    // 2. Historical changes (if any audit logs exist)
    if (empAuditLogs.length > 0) {
      // Prior revisions
      for (let i = 1; i < empAuditLogs.length; i++) {
        items.push({
          id: empAuditLogs[i].id,
          date: empAuditLogs[i].changedAt,
          title: 'Salary Adjustment',
          subtitle: empAuditLogs[i].changeReason || 'Compensation adjustment',
          isCurrent: false,
          amount: empAuditLogs[i].newBase,
          currency: empAuditLogs[i].currency || selectedEmp.currentSalary.currency
        });
      }

      // Initial contract salary prior to first revision
      const oldestLog = empAuditLogs[empAuditLogs.length - 1];
      if (oldestLog && oldestLog.previousBase > 0) {
        items.push({
          id: 'initial-hire-baseline',
          date: selectedEmp.hireDate || '',
          title: 'Starting Salary',
          subtitle: 'Initial employment offer',
          isCurrent: false,
          amount: oldestLog.previousBase,
          currency: oldestLog.currency || selectedEmp.currentSalary.currency
        });
      }
    }

    return items;
  }, [selectedEmp, empAuditLogs]);

  // ── Filter option arrays for Select ──────────────────────────────────────
  const countryOptions = [
    { value: '', label: 'All Countries' },
    ...countries.map((c) => ({ value: c.id, label: c.name }))
  ];
  const deptOptions = [
    { value: '', label: 'All Departments' },
    ...departments.map((d) => ({ value: d.id, label: d.name }))
  ];
  const genderOptions = [
    { value: '', label: 'All Genders' },
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'NON_BINARY', label: 'Other' }
  ];

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, mx: 'auto' }}>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          mb: 3
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.875rem' }, color: '#0f172a' }}>
            Employees
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem', mt: 0.25 }}>
            {meta?.total ? meta.total.toLocaleString() : '—'} people · {countries.length} countries
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="secondary" leftIcon={<Upload className="w-4 h-4 text-slate-500" />}>Import Excel</Button>
          <Button variant="secondary" leftIcon={<Download className="w-4 h-4 text-slate-500" />}>Export</Button>
          {/* <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>Add employee</Button> */}
        </Box>
      </Box>

      {/* Filter Bar */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
        {/* Search */}
        <Box sx={{ flex: 1, minWidth: 260 }}>
          <SearchInput
            placeholder="Search name, ID or title"
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            isLoading={isLoadingFilters}
          />
        </Box>

        {/* Country filter */}
        <Box sx={{ width: 160 }}>
          <Select
            value={selectedCountry}
            placeholder="Country"
            options={countryOptions}
            onChange={(e) => { setSelectedCountry(e.target.value as string); setPage(1); }}
            isLoading={isLoadingFilters}
          />
        </Box>

        {/* Department filter */}
        <Box sx={{ width: 170 }}>
          <Select
            value={selectedDept}
            placeholder="Department"
            options={deptOptions}
            onChange={(e) => { setSelectedDept(e.target.value as string); setPage(1); }}
            isLoading={isLoadingFilters}
          />
        </Box>

        {/* Gender filter */}
        <Box sx={{ width: 140 }}>
          <Select
            value={selectedGender}
            placeholder="Gender"
            options={genderOptions}
            onChange={(e) => { setSelectedGender(e.target.value as string); setPage(1); }}
            isLoading={isLoadingFilters}
          />
        </Box>
      </Box>

      {/* Master-Detail Layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '65% 35%' }, gap: 3, alignItems: 'start' }}>

        {/* Left: Employee Table */}
        <Card padding="none">
          <DataTable
            columns={columns}
            data={employees}
            isLoading={isLoading}
            skeletonRowCount={limit}
            selectedRowId={selectedEmp?.id}
            getRowId={(e) => e.id}
            onRowClick={(emp) => setSelectedEmp(emp)}
            pagination={
              meta
                ? {
                  page: meta.page,
                  total: meta.total,
                  limit: meta.limit,
                  onPageChange: setPage,
                  onLimitChange: handleLimitChange
                }
                : undefined
            }
          />
        </Card>

        {/* Right: Detail Panel */}
        <Box
          sx={{
            position: { lg: 'sticky' },
            top: 24,
            maxHeight: { lg: 'calc(100vh - 48px)' },
            overflowY: 'auto',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE and Edge
            '&::-webkit-scrollbar': {
              display: 'none' // Chrome, Safari, Edge
            }
          }}
        >
          {isLoading ? (
            <Card padding="lg">
              <Skeleton width={110} height={14} className="mb-2" />
              <Box sx={{ mt: 1, mb: 3 }}>
                <Skeleton width={180} height={26} className="mb-1" />
                <Skeleton width={230} height={16} />
              </Box>

              {/* Current Salary Skeleton */}
              <Box sx={{ mb: 3.5, p: 2.5, borderRadius: '16px', backgroundColor: '#fafbfc', border: '1px solid #f1f5f9' }}>
                <Skeleton width={160} height={34} className="mb-1" />
                <Skeleton width={120} height={16} />
              </Box>

              {/* Pay Band Gauge Skeleton */}
              <Box sx={{ mb: 3.5 }}>
                <Skeleton width={200} height={16} className="mb-2" />
                <Skeleton height={8} borderRadius="4px" />
              </Box>

              {/* Salary History Skeleton */}
              <Box sx={{ mb: 4 }}>
                <Skeleton width={100} height={16} className="mb-2" />
                <Skeleton count={3} height={40} className="mb-2" />
              </Box>

              {/* Edit CTA Skeleton */}
              <Skeleton height={42} borderRadius="12px" />
            </Card>
          ) : selectedEmp ? (
            <Card padding="lg">
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.8125rem' }}>
                Selected employee
              </Typography>

              <Box sx={{ mt: 1, mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {selectedEmp.fullName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8125rem', mt: 0.25 }}>
                  Senior Specialist · {selectedEmp.department?.name} · {selectedEmp.country?.name}
                </Typography>
              </Box>

              {/* Current Salary */}
              <Box sx={{ mb: 3.5, p: 2.5, borderRadius: '16px', backgroundColor: '#fafbfc', border: '1px solid #f1f5f9' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                  {selectedEmp.currentSalary
                    ? formatCurrency(selectedEmp.currentSalary.baseSalary, selectedEmp.currentSalary.currency)
                    : '$0'}
                </Typography>
                {selectedEmp.currentSalary?.currency !== 'USD' && selectedEmp.currentSalary?.baseSalaryUSD && (
                  <Typography variant="body2" sx={{ color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', mt: 0.5 }}>
                    ≈ ${selectedEmp.currentSalary.baseSalaryUSD.toLocaleString()} USD / year
                  </Typography>
                )}
              </Box>

              {/* Pay Band Gauge */}
              <Box sx={{ mb: 3.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', display: 'block', mb: 1.25 }}>
                  Position in pay band ({selectedEmp.department?.name}, {selectedEmp.country?.name})
                </Typography>
                <ProgressBar
                  value={bandPos}
                  height={8}
                  barColor="#4f46e5"
                  trackColor="#eeeffe"
                  labelLeft={`Min ${formatCurrency(minBand, selectedEmp.currentSalary?.currency || 'USD')}`}
                  labelRight={`Max ${formatCurrency(maxBand, selectedEmp.currentSalary?.currency || 'USD')}`}
                />
              </Box>

              {/* Salary History */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', display: 'block', mb: 1.5 }}>
                  Salary history
                </Typography>

                {isLoadingLogs ? (
                  <Skeleton count={3} height={36} className="mb-2" />
                ) : salaryHistoryItems.length === 0 ? (
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', py: 1 }}>
                    Baseline salary contract (No historical modifications)
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.25,
                      maxHeight: 240,
                      overflowY: 'auto',
                      scrollbarWidth: 'none', // Firefox
                      msOverflowStyle: 'none', // IE and Edge
                      '&::-webkit-scrollbar': {
                        display: 'none' // Chrome, Safari, Edge
                      }
                    }}
                  >
                    {salaryHistoryItems.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 1,
                          px: 1.25,
                          borderRadius: '10px',
                          backgroundColor: item.isCurrent ? '#f8fafc' : 'transparent',
                          border: item.isCurrent ? '1px solid #e2e8f0' : 'none',
                          borderBottom: item.isCurrent ? '1px solid #e2e8f0' : '1px solid #f8fafc'
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8125rem' }}>
                              {formatDateSafe(item.date)}
                            </Typography>
                            {item.isCurrent && (
                              <Badge label="Current" variant="success" size="sm" />
                            )}
                          </Box>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                            {item.subtitle}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            color: item.isCurrent ? '#0f172a' : '#475569',
                            fontSize: item.isCurrent ? '0.875rem' : '0.8125rem'
                          }}
                        >
                          {formatCurrency(item.amount, item.currency)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              {/* Edit CTA */}
              <Button
                variant="primary"
                fullWidth
                leftIcon={<Edit3 className="w-4 h-4" />}
                onClick={() => handleEditEmployee(selectedEmp)}
                sx={{ py: 1.5 }}
              >
                Edit salary
              </Button>
            </Card>
          ) : (
            <Card padding="lg">
              <Box sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
                <User className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <Typography variant="body2">Select an employee to view details</Typography>
              </Box>
            </Card>
          )}
        </Box>
      </Box>

      {/* Salary Edit Modal */}
      <SalaryEditModal
        employee={modalEmployee}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setModalEmployee(null); }}
        onSalaryUpdated={handleSalaryUpdated}
      />
    </Box>
  );
};
