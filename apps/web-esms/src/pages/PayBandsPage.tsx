import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SalaryBandDTO } from 'shared-types';
import { api } from '../services/api';
import { notify } from '../components/ui/ToastProvider';
import { Card } from '../components/ui/Card';
import { DataTable, type ColumnDef } from '../components/ui/DataTable';
import { ProgressBar } from '../components/ui/ProgressBar';

export const PayBandsPage: React.FC = () => {
  const [salaryBands, setSalaryBands] = useState<SalaryBandDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBands = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getSalaryBands();
      setSalaryBands(res.data || []);
    } catch (err: any) {
      console.error('Failed to load salary bands:', err);
      notify.error(`Failed to load salary bands: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBands();
  }, [loadBands]);

  const columns: ColumnDef<SalaryBandDTO>[] = [
    {
      key: 'band',
      header: 'Compensation Tier',
      render: (row) => (
        <span className="font-semibold text-slate-900">{row.band}</span>
      )
    },
    {
      key: 'count',
      header: 'Staff Count',
      render: (row) => (
        <span className="font-mono text-slate-700">{row.count.toLocaleString()}</span>
      )
    },
    {
      key: 'percentage',
      header: 'Organizational Share',
      render: (row) => (
        <Box sx={{ width: 180, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ProgressBar value={row.percentage} height={6} barColor="#4f46e5" trackColor="#eeeffe" />
          <span className="font-mono text-xs font-semibold text-slate-700">{row.percentage.toFixed(1)}%</span>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, mx: 'auto' }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.875rem' }, color: '#0f172a' }}>
          Pay Bands Intelligence
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem', mt: 0.25 }}>
          Normalized compensation distributions and organizational salary equity benchmarks
        </Typography>
      </Box>

      <Card
        title="Global Salary Bands"
        subtitle="Staff count and organizational payroll share per compensation tier"
        padding="none"
      >
        <DataTable
          columns={columns}
          data={salaryBands}
          isLoading={isLoading}
          skeletonRowCount={6}
        />
      </Card>
    </Box>
  );
};
