import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { DepartmentSpendDTO, CountrySpendDTO } from 'shared-types';
import { api } from '../services/api';
import { notify } from '../components/ui/ToastProvider';
import { Card } from '../components/ui/Card';
import { DataTable, type ColumnDef } from '../components/ui/DataTable';

export const ReportsPage: React.FC = () => {
  const [departmentSpend, setDepartmentSpend] = useState<DepartmentSpendDTO[]>([]);
  const [countrySpend, setCountrySpend] = useState<CountrySpendDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const [deptRes, countryRes] = await Promise.all([
        api.getDepartmentSpend(),
        api.getCountrySpend()
      ]);
      setDepartmentSpend(deptRes.data || []);
      setCountrySpend(countryRes.data || []);
    } catch (err: any) {
      console.error('Failed to load reports:', err);
      notify.error(`Failed to load reports: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const countryColumns: ColumnDef<CountrySpendDTO>[] = [
    {
      key: 'countryName',
      header: 'Jurisdiction',
      render: (c) => <span className="font-semibold text-slate-900">{c.countryName}</span>
    },
    {
      key: 'currency',
      header: 'Currency',
      render: (c) => <span className="font-mono text-xs font-semibold text-slate-600">{c.currency}</span>
    },
    {
      key: 'headcount',
      header: 'Headcount',
      render: (c) => <span className="font-mono text-slate-700">{c.headcount.toLocaleString()}</span>
    },
    {
      key: 'totalPayrollUSD',
      header: 'Annual Spend (USD)',
      render: (c) => <span className="font-mono font-semibold text-slate-900">${c.totalPayrollUSD.toLocaleString()}</span>
    },
    {
      key: 'percentageOfTotalSpend',
      header: 'Spend Share',
      render: (c) => <span className="font-mono text-indigo-600 font-semibold">{c.percentageOfTotalSpend.toFixed(1)}%</span>
    }
  ];

  const deptColumns: ColumnDef<DepartmentSpendDTO>[] = [
    {
      key: 'departmentName',
      header: 'Department',
      render: (d) => <span className="font-semibold text-slate-900">{d.departmentName}</span>
    },
    {
      key: 'headcount',
      header: 'Headcount',
      render: (d) => <span className="font-mono text-slate-700">{d.headcount.toLocaleString()}</span>
    },
    {
      key: 'totalPayrollUSD',
      header: 'Department Spend (USD)',
      render: (d) => <span className="font-mono font-semibold text-slate-900">${d.totalPayrollUSD.toLocaleString()}</span>
    },
    {
      key: 'percentageOfTotalSpend',
      header: 'Spend Share',
      render: (d) => <span className="font-mono text-indigo-600 font-semibold">{d.percentageOfTotalSpend.toFixed(1)}%</span>
    }
  ];

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, mx: 'auto' }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.875rem' }, color: '#0f172a' }}>
          Strategic Compensation Reports
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem', mt: 0.25 }}>
          Multi-currency audit metrics and jurisdictional payroll allocations across 10,000 employees
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Card
          title="Geographic Jurisdiction Spend Report"
          subtitle="Annual payroll expenditure and employee distribution across active countries"
          padding="none"
        >
          <DataTable
            columns={countryColumns}
            data={countrySpend}
            isLoading={isLoading}
            skeletonRowCount={5}
          />
        </Card>

        <Card
          title="Departmental Spend & Headcount Allocation"
          subtitle="Department payroll totals and organization spend percentages"
          padding="none"
        >
          <DataTable
            columns={deptColumns}
            data={departmentSpend}
            isLoading={isLoading}
            skeletonRowCount={5}
          />
        </Card>
      </Box>
    </Box>
  );
};
