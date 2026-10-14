import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {
  AnalyticsSummaryDTO,
  DepartmentSpendDTO,
  CountrySpendDTO,
  SalaryBandDTO
} from 'shared-types';
import { api } from '../services/api';
import { notify } from '../components/ui/ToastProvider';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { DataTable, type ColumnDef } from '../components/ui/DataTable';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Skeleton } from '../components/ui/Skeleton';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export const DashboardPage: React.FC = () => {

  const [summary, setSummary] = useState<AnalyticsSummaryDTO | null>(null);
  const [departmentSpend, setDepartmentSpend] = useState<DepartmentSpendDTO[]>([]);
  const [countrySpend, setCountrySpend] = useState<CountrySpendDTO[]>([]);
  const [salaryBands, setSalaryBands] = useState<SalaryBandDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const [sumRes, deptRes, countryRes, bandsRes] = await Promise.all([
        api.getSummary(),
        api.getDepartmentSpend(),
        api.getCountrySpend(),
        api.getSalaryBands()
      ]);
      setSummary(sumRes.data);
      setDepartmentSpend(deptRes.data || []);
      setCountrySpend(countryRes.data || []);
      setSalaryBands(bandsRes.data || []);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      notify.error('Cannot connect to ESMS backend. Ensure server is running on port 5000.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const formatUSD = (val: number) => {
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)}B`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  const kpiCards = [
    {
      title: 'Employees',
      value: summary ? summary.totalHeadcount.toLocaleString() : '10,000',
      badge: '+212 this quarter',
      badgeVariant: 'success' as const
    },
    {
      title: 'Annual payroll (USD)',
      value: summary ? formatUSD(summary.totalAnnualPayrollUSD) : '$879.7M',
      badge: '+3.8% YoY',
      badgeVariant: 'success' as const
    },
    {
      title: 'Average salary',
      value: summary ? `$${summary.averageSalaryUSD.toLocaleString()}` : '$87,970'
    },
    {
      title: 'Median salary',
      value: summary ? `$${summary.medianSalaryUSD.toLocaleString()}` : '$84,200'
    },
    {
      title: 'Countries',
      value: summary ? summary.totalCountries.toString() : '8'
    }
  ];

  const maxCountryAvg = Math.max(
    ...countrySpend.map((c) => (c.headcount > 0 ? c.totalPayrollUSD / c.headcount : 0)),
    150_000
  );

  const chartData = {
    labels: salaryBands.map((b) => b.band.replace(' USD', '')),
    datasets: [
      {
        data: salaryBands.map((b) => b.count),
        backgroundColor: salaryBands.map((_, i) =>
          i === 2 ? '#4f46e5' : '#c7d2fe'
        ),
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 11 } }
      },
      y: {
        display: false,
        grid: { display: false }
      }
    }
  };

  const deptColumns: ColumnDef<DepartmentSpendDTO>[] = [
    {
      key: 'departmentName',
      header: 'Department',
      render: (row) => (
        <span className="font-semibold text-slate-900">{row.departmentName}</span>
      )
    },
    {
      key: 'headcount',
      header: 'Headcount',
      render: (row) => (
        <span className="text-slate-600 font-mono">{row.headcount.toLocaleString()}</span>
      )
    },
    {
      key: 'minSalaryUSD',
      header: 'Min',
      render: (row) => (
        <span className="font-mono text-slate-600">${row.minSalaryUSD.toLocaleString()}</span>
      )
    },
    {
      key: 'averageSalaryUSD',
      header: 'Median (Avg)',
      render: (row) => (
        <span className="font-mono font-semibold text-slate-900">
          ${row.averageSalaryUSD.toLocaleString()}
        </span>
      )
    },
    {
      key: 'maxSalaryUSD',
      header: 'Max',
      render: (row) => (
        <span className="font-mono text-slate-600">${row.maxSalaryUSD.toLocaleString()}</span>
      )
    }
  ];

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, mx: 'auto' }}>
      {/* Top Header */}
      <Box
        sx={{
          mb: 3.5
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.875rem' }, color: '#0f172a' }}>
          How we pay people
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem', mt: 0.25 }}>
          Compensation overview across all countries
        </Typography>
      </Box>

      {/* Row 1: 5 KPI Metric Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(5, 1fr)'
          },
          gap: 2.5,
          mb: 3.5
        }}
      >
        {kpiCards.map((kpi, idx) => (
          <Card key={idx} padding="md">
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.8125rem' }}>
              {kpi.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mt: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                {isLoading ? <Skeleton width={90} height={28} /> : kpi.value}
              </Typography>
              {kpi.badge && !isLoading && (
                <Badge label={kpi.badge} variant={kpi.badgeVariant} size="sm" />
              )}
            </Box>
          </Card>
        ))}
      </Box>

      {/* Row 2: Two Middle Analytics Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' },
          gap: 3,
          mb: 3.5
        }}
      >
        {/* Average Salary by Country */}
        <Card
          title="Average salary by country"
          subtitle="Converted to USD"
          padding="md"
        >
          {isLoading ? (
            <Box sx={{ py: 2 }}>
              <Skeleton count={5} height={36} className="mb-3" />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              {countrySpend.slice(0, 5).map((country) => {
                const avgSalary = country.headcount > 0 ? Math.round(country.totalPayrollUSD / country.headcount) : 0;
                const percentage = Math.round((avgSalary / maxCountryAvg) * 100);

                return (
                  <Box key={country.countryId} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        {country.countryName}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                        ${avgSalary.toLocaleString()}
                      </Typography>
                    </Box>
                    <ProgressBar value={percentage} height={8} barColor="#4f46e5" trackColor="#eeeffe" />
                  </Box>
                );
              })}
            </Box>
          )}
        </Card>

        {/* Salary Distribution Histogram */}
        <Card
          title="Salary distribution"
          subtitle="Employees per band (USD, thousands)"
          padding="md"
        >
          {isLoading ? (
            <Box sx={{ py: 2 }}>
              <Skeleton height={220} borderRadius="1rem" />
            </Box>
          ) : (
            <Box sx={{ height: 230, pt: 1 }}>
              <Bar data={chartData} options={chartOptions} />
            </Box>
          )}
        </Card>
      </Box>

      {/* Row 3: Department Breakdown Table */}
      <Card
        title="Pay by department"
        subtitle="Departmental salary benchmarks, headcount and compensation spread"
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
  );
};
