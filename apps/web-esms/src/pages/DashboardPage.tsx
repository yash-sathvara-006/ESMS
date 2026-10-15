import React, { useState, useReducer, useEffect, useCallback, useMemo, useRef, useTransition, useId } from 'react';
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
import { Button } from '../components/ui/Button';
import { DataTable, type ColumnDef } from '../components/ui/DataTable';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Skeleton } from '../components/ui/Skeleton';
import { MonthYearPicker } from '../components/ui/MonthYearPicker';
import { RotateCcw } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

// ── State Reducer for Atomic Concurrent API Hydration ─────────────────────────
interface DashboardState {
  summary: AnalyticsSummaryDTO | null;
  departmentSpend: DepartmentSpendDTO[];
  countrySpend: CountrySpendDTO[];
  salaryBands: SalaryBandDTO[];
  isLoading: boolean;
  isCountryLoading: boolean;
  isBandsLoading: boolean;
  error: string | null;
}

type DashboardAction =
  | { type: 'FETCH_START' }
  | {
    type: 'FETCH_SUCCESS';
    payload: {
      summary: AnalyticsSummaryDTO;
      departmentSpend: DepartmentSpendDTO[];
      countrySpend: CountrySpendDTO[];
      salaryBands: SalaryBandDTO[];
    };
  }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'FETCH_COUNTRY_START' }
  | { type: 'FETCH_COUNTRY_SUCCESS'; payload: CountrySpendDTO[] }
  | { type: 'FETCH_COUNTRY_ERROR'; payload: string }
  | { type: 'FETCH_BANDS_START' }
  | { type: 'FETCH_BANDS_SUCCESS'; payload: SalaryBandDTO[] }
  | { type: 'FETCH_BANDS_ERROR'; payload: string };

const initialState: DashboardState = {
  summary: null,
  departmentSpend: [],
  countrySpend: [],
  salaryBands: [],
  isLoading: true,
  isCountryLoading: false,
  isBandsLoading: false,
  error: null
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, isCountryLoading: false, isBandsLoading: false, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isCountryLoading: false,
        isBandsLoading: false,
        summary: action.payload.summary,
        departmentSpend: action.payload.departmentSpend,
        countrySpend: action.payload.countrySpend,
        salaryBands: action.payload.salaryBands,
        error: null
      };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, isCountryLoading: false, isBandsLoading: false, error: action.payload };
    case 'FETCH_COUNTRY_START':
      return { ...state, isCountryLoading: true };
    case 'FETCH_COUNTRY_SUCCESS':
      return { ...state, isCountryLoading: false, countrySpend: action.payload };
    case 'FETCH_COUNTRY_ERROR':
      return { ...state, isCountryLoading: false };
    case 'FETCH_BANDS_START':
      return { ...state, isBandsLoading: true };
    case 'FETCH_BANDS_SUCCESS':
      return { ...state, isBandsLoading: false, salaryBands: action.payload };
    case 'FETCH_BANDS_ERROR':
      return { ...state, isBandsLoading: false };
    default:
      return state;
  }
}

export const DashboardPage: React.FC = () => {
  // ── Unique Accessible IDs ──────────────────────────────────────────────────
  const kpiSectionId = useId();
  const chartCardId = useId();

  // ── Independent Timeframe State for Each Section ────────────────────────────
  const [countryMonth, setCountryMonth] = useState<number>(new Date().getMonth() + 1);
  const [countryYear, setCountryYear] = useState<number>(new Date().getFullYear());

  const [bandsMonth, setBandsMonth] = useState<number>(new Date().getMonth() + 1);
  const [bandsYear, setBandsYear] = useState<number>(new Date().getFullYear());

  const [availableYears, setAvailableYears] = useState<number[]>([2026, 2025, 2024, 2023, 2022, 2021]);

  // ── Reducer for Consolidated Multi-API State ───────────────────────────────
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { summary, departmentSpend, countrySpend, salaryBands, isLoading, isCountryLoading, isBandsLoading } = state;

  // ── Ref for In-Flight Abort Controller & Memory Leak Prevention ─────────────
  const abortControllerRef = useRef<AbortController | null>(null);

  // ── Non-blocking Transition for Manual Dashboard Refresh ───────────────────
  const [isRefreshing, startTransition] = useTransition();

  // ── Memoized USD Currency Formatter ─────────────────────────────────────────
  const formatUSD = useCallback((val: number) => {
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)}B`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  }, []);

  // ── Consolidated 4-API Fetcher with Period Filter & AbortSignal Guard ──────
  const loadAnalytics = useCallback(async (
    signal?: AbortSignal,
    cMonth = countryMonth,
    cYear = countryYear,
    bMonth = bandsMonth,
    bYear = bandsYear
  ) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const [sumRes, deptRes, countryRes, bandsRes] = await Promise.all([
        api.getSummary(),
        api.getDepartmentSpend(),
        api.getCountrySpend({ year: cYear, month: cMonth }),
        api.getSalaryBands({ year: bYear, month: bMonth })
      ]);

      if (signal?.aborted) return;

      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          summary: sumRes.data,
          departmentSpend: deptRes.data || [],
          countrySpend: countryRes.data || [],
          salaryBands: bandsRes.data || []
        }
      });
    } catch (err: any) {
      if (signal?.aborted) return;
      console.error('Failed to load analytics:', err);
      dispatch({ type: 'FETCH_ERROR', payload: 'Cannot connect to ESMS backend.' });
      notify.error('Cannot connect to ESMS backend. Ensure server is running on port 5000.');
    }
  }, [countryMonth, countryYear, bandsMonth, bandsYear]);

  // ── Load Dynamic Timeframe from Backend on Mount ───────────────────────────
  useEffect(() => {
    api.getTimeframe().then((res) => {
      if (res.data) {
        if (res.data.years && res.data.years.length > 0) {
          setAvailableYears(res.data.years);
        }
        if (res.data.currentYear) {
          setCountryYear(res.data.currentYear);
          setBandsYear(res.data.currentYear);
        }
        if (res.data.currentMonth) {
          setCountryMonth(res.data.currentMonth);
          setBandsMonth(res.data.currentMonth);
        }
      }
    }).catch(() => {
      // Fallback gracefully to default dates
    });
  }, []);

  // ── Initial Mount Effect with Automatic Request Aborting ───────────────────
  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    loadAnalytics(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadAnalytics]);

  // ── Manual Non-Blocking Refresh Handler ────────────────────────────────────
  const handleManualRefresh = useCallback(() => {
    startTransition(() => {
      loadAnalytics(undefined, countryMonth, countryYear, bandsMonth, bandsYear);
    });
  }, [loadAnalytics, countryMonth, countryYear, bandsMonth, bandsYear]);

  // ── Handlers for Independent Section Timeframe Changes ─────────────────────
  const handleCountryPeriodChange = useCallback((newMonth: number, newYear: number) => {
    setCountryMonth(newMonth);
    setCountryYear(newYear);
    startTransition(async () => {
      dispatch({ type: 'FETCH_COUNTRY_START' });
      try {
        const res = await api.getCountrySpend({ month: newMonth, year: newYear });
        dispatch({ type: 'FETCH_COUNTRY_SUCCESS', payload: res.data || [] });
      } catch (err) {
        console.error('Failed to load country spend:', err);
        dispatch({ type: 'FETCH_COUNTRY_ERROR', payload: 'Failed to update country spend' });
        notify.error('Could not update country spend for selected timeframe.');
      }
    });
  }, []);

  const handleBandsPeriodChange = useCallback((newMonth: number, newYear: number) => {
    setBandsMonth(newMonth);
    setBandsYear(newYear);
    startTransition(async () => {
      dispatch({ type: 'FETCH_BANDS_START' });
      try {
        const res = await api.getSalaryBands({ month: newMonth, year: newYear });
        dispatch({ type: 'FETCH_BANDS_SUCCESS', payload: res.data || [] });
      } catch (err) {
        console.error('Failed to load salary bands:', err);
        dispatch({ type: 'FETCH_BANDS_ERROR', payload: 'Failed to update salary bands' });
        notify.error('Could not update salary distribution for selected timeframe.');
      }
    });
  }, []);

  // const countryMonthName = useMemo(() => {
  //   return MONTHS.find((m) => m.value === countryMonth)?.label || 'Month';
  // }, [countryMonth]);

  // const bandsMonthName = useMemo(() => {
  //   return MONTHS.find((m) => m.value === bandsMonth)?.label || 'Month';
  // }, [bandsMonth]);

  // ── Memoized KPI Cards Calculation ─────────────────────────────────────────
  const kpiCards = useMemo(() => [
    {
      title: 'Employees',
      value: summary ? summary.totalHeadcount.toLocaleString() : '10,000',
      badgeVariant: 'success' as const
    },
    {
      title: 'Annual payroll (USD)',
      value: summary ? formatUSD(summary.totalAnnualPayrollUSD) : '$879.7M',
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
  ], [summary, formatUSD]);

  // ── Memoized Max Country Benchmark Calculation ─────────────────────────────
  const maxCountryAvg = useMemo(() => {
    if (!countrySpend.length) return 150_000;
    return Math.max(
      ...countrySpend.map((c) => (c.headcount > 0 ? c.totalPayrollUSD / c.headcount : 0)),
      150_000
    );
  }, [countrySpend]);

  // ── Memoized Chart.js Data Configuration (Prevents Canvas Jitter) ───────────
  const chartData = useMemo(() => ({
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
  }), [salaryBands]);

  // ── Memoized Chart.js Options ──────────────────────────────────────────────
  const chartOptions = useMemo(() => ({
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
  }), []);

  // ── Memoized Department Table Columns ──────────────────────────────────────
  const deptColumns = useMemo<ColumnDef<DepartmentSpendDTO>[]>(() => [
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
  ], []);

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, mx: 'auto' }}>
      {/* Top Header with Responsive Refresh Action */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 3.5
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.875rem' }, color: '#0f172a' }}>
            How we pay people
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem', mt: 0.25 }}>
            Executive compensation intelligence across all global jurisdictions
          </Typography>
        </Box>
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualRefresh}
          isLoading={isRefreshing}
          leftIcon={<RotateCcw size={14} className={isRefreshing ? 'animate-spin' : ''} />}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Row 1: 5 KPI Metric Cards */}
      <Box
        id={kpiSectionId}
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
            </Box>
          </Card>
        ))}
      </Box>

      {/* Row 2: Two Middle Analytics Cards with Independent Month & Year Filters */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' },
          gap: 3,
          mb: 3.5
        }}
      >
        {/* Average Salary by Country with Dedicated Month & Year Filter */}
        <Card
          title="Average salary by country"
          // subtitle={`Converted to USD · ${countryMonthName} ${countryYear}`}
          padding="md"
          headerRight={
            <MonthYearPicker
              selectedMonth={countryMonth}
              selectedYear={countryYear}
              availableYears={availableYears}
              onChange={handleCountryPeriodChange}
              disabled={isLoading || isCountryLoading || isRefreshing}
            />
          }
        >
          {isLoading || isCountryLoading ? (
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

        {/* Salary Distribution Histogram with Dedicated Month & Year Filter */}
        <Card
          id={chartCardId}
          title="Salary distribution"
          // subtitle={`Employees per band (USD, thousands) · ${bandsMonthName} ${bandsYear}`}
          padding="md"
          headerRight={
            <MonthYearPicker
              selectedMonth={bandsMonth}
              selectedYear={bandsYear}
              availableYears={availableYears}
              onChange={handleBandsPeriodChange}
              disabled={isLoading || isBandsLoading || isRefreshing}
            />
          }
        >
          {isLoading || isBandsLoading ? (
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
