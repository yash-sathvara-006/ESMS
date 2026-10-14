import React, { useState, useEffect, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { EmployeeDTO, UpdateSalaryInput } from 'shared-types';
import { api } from '../services/api';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { notify } from './ui/ToastProvider';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface SalaryEditModalProps {
  employee: EmployeeDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSalaryUpdated: (employeeId?: string) => void;
}

export const SalaryEditModal: React.FC<SalaryEditModalProps> = ({
  employee,
  isOpen,
  onClose,
  onSalaryUpdated
}) => {
  const [baseSalary, setBaseSalary] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [changeReason, setChangeReason] = useState<string>('');
  const [changedBy, setChangedBy] = useState<string>('HR Manager');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync form state when targeted employee changes
  useEffect(() => {
    if (employee && employee.currentSalary) {
      setBaseSalary(employee.currentSalary.baseSalary);
      setBonus(employee.currentSalary.bonus);
      setDeductions(employee.currentSalary.deductions);
      setChangeReason('');
      setErrorMsg(null);
    }
  }, [employee]);

  if (!employee) return null;

  const currentSal = employee.currentSalary;
  const currency = currentSal?.currency || 'USD';
  const calculatedNet = Math.max(0, Number(baseSalary || 0) + Number(bonus || 0) - Number(deductions || 0));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    if (!changeReason || changeReason.trim().length < 3) {
      setErrorMsg('Please provide a valid audit reason (minimum 3 characters)');
      return;
    }

    if (baseSalary <= 0) {
      setErrorMsg('Base salary must be greater than zero');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const payload: UpdateSalaryInput = {
        baseSalary: Number(baseSalary),
        bonus: Number(bonus || 0),
        deductions: Number(deductions || 0),
        currency,
        changeReason: changeReason.trim(),
        changedBy: changedBy.trim() || 'HR Manager'
      };

      await api.updateSalary(employee.id, payload);

      notify.success(`Successfully updated compensation for ${employee.fullName}`);
      onSalaryUpdated(employee.id);
      onClose();
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred';
      setErrorMsg(msg);
      notify.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Salary"
      subtitle={`${employee.fullName} · ${employee.employeeCode} · ${employee.department?.name}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Current Baseline Overview */}
          <Box
            sx={{
              p: 2,
              borderRadius: '16px',
              backgroundColor: '#fafbfc',
              border: '1px solid #f1f5f9'
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1 }}>
              Current Active Contract ({currency})
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, textAlign: 'center' }}>
              <Box sx={{ p: 1, borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #f1f5f9' }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase' }}>
                  Base
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                  {formatCurrency(currentSal?.baseSalary || 0)}
                </Typography>
              </Box>
              <Box sx={{ p: 1, borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #f1f5f9' }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase' }}>
                  Bonus
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#16a34a' }}>
                  +{formatCurrency(currentSal?.bonus || 0)}
                </Typography>
              </Box>
              <Box sx={{ p: 1, borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #f1f5f9' }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase' }}>
                  Deductions
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#e11d48' }}>
                  -{formatCurrency(currentSal?.deductions || 0)}
                </Typography>
              </Box>
              <Box sx={{ p: 1, borderRadius: '10px', backgroundColor: '#eeeffe', border: '1px solid #e0e2fe' }}>
                <Typography variant="caption" sx={{ color: '#4f46e5', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 600 }}>
                  Net
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#4f46e5' }}>
                  {formatCurrency(currentSal?.netSalary || 0)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* New Inputs */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
            <Input
              label={`Base (${currency})`}
              type="number"
              min="1"
              required
              value={baseSalary || ''}
              onChange={(e) => setBaseSalary(Number(e.target.value))}
            />
            <Input
              label={`Bonus (${currency})`}
              type="number"
              min="0"
              value={bonus || ''}
              onChange={(e) => setBonus(Number(e.target.value))}
            />
            <Input
              label={`Deductions (${currency})`}
              type="number"
              min="0"
              value={deductions || ''}
              onChange={(e) => setDeductions(Number(e.target.value))}
            />
          </Box>

          {/* Live Calculated Net Banner */}
          <Box
            sx={{
              p: 2,
              borderRadius: '16px',
              backgroundColor: '#fafbfc',
              border: '1px solid #e0e7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#4f46e5' }}>
              New Calculated Net Salary:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
              {formatCurrency(calculatedNet)}
            </Typography>
          </Box>

          {/* Reason for Audit Log */}
          <Input
            label="Reason for Adjustment"
            required
            placeholder="e.g. Annual Merit Promotion, Market Adjustment"
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            helperText="Permanently recorded in immutable SalaryAuditLog table"
          />

          <Input
            label="Authorized By"
            required
            value={changedBy}
            onChange={(e) => setChangedBy(e.target.value)}
          />

          {errorMsg && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: '10px', backgroundColor: '#ffe4e6', color: '#e11d48' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {errorMsg}
              </Typography>
            </Box>
          )}

          {/* Modal Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1, borderTop: '1px solid #f1f5f9' }}>
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Update salary
            </Button>
          </Box>
        </Box>
      </form>
    </Modal>
  );
};
