import React, { useState, useEffect, useMemo, useCallback, useId, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import type { EmployeeDTO, UpdateSalaryInput, DeductionCategory } from 'shared-types';
import { api } from '../services/api';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { notify } from './ui/ToastProvider';
import { ShieldCheck, AlertCircle, Plus, Trash2, Receipt } from 'lucide-react';

interface SalaryEditModalProps {
  employee: EmployeeDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSalaryUpdated: (employeeId?: string) => void;
}

interface LocalDeductionItem {
  id?: string;
  category: DeductionCategory;
  label: string;
  amount: number | '';
}

const DEDUCTION_CATEGORIES: { value: DeductionCategory; label: string }[] = [
  { value: 'TAX', label: 'Tax (Income / State / Statutory)' },
  { value: 'HEALTH_INSURANCE', label: 'Health / Medical Insurance' },
  { value: 'RETIREMENT', label: 'Retirement / Pension / 401(k)' },
  { value: 'LOAN_RECOVERY', label: 'Loan / Advance Repayment' },
  { value: 'UNPAID_LEAVE', label: 'Unpaid Leave / LOP' },
  { value: 'OTHER', label: 'Other Deduction' },
];

export const SalaryEditModal: React.FC<SalaryEditModalProps> = ({
  employee,
  isOpen,
  onClose,
  onSalaryUpdated
}) => {
  const baseSalaryId = useId();
  const bonusId = useId();
  const changeReasonId = useId();
  const changedById = useId();

  const [baseSalary, setBaseSalary] = useState<number | ''>(0);
  const [bonus, setBonus] = useState<number | ''>(0);
  const [deductionItems, setDeductionItems] = useState<LocalDeductionItem[]>([]);
  const [changeReason, setChangeReason] = useState<string>('');
  const [changedBy, setChangedBy] = useState<string>('HR Manager');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync form state when targeted employee changes
  useEffect(() => {
    if (employee && employee.currentSalary) {
      setBaseSalary(employee.currentSalary.baseSalary);
      setBonus(employee.currentSalary.bonus);

      if (employee.currentSalary.deductionItems && employee.currentSalary.deductionItems.length > 0) {
        setDeductionItems(
          employee.currentSalary.deductionItems.map((item) => ({
            id: item.id,
            category: item.category as DeductionCategory,
            label: item.label,
            amount: item.amount
          }))
        );
      } else if (employee.currentSalary.deductions > 0) {
        setDeductionItems([
          {
            category: 'TAX',
            label: 'Statutory Taxes',
            amount: employee.currentSalary.deductions
          }
        ]);
      } else {
        setDeductionItems([]);
      }

      setChangeReason('');
      setErrorMsg(null);
    }
  }, [employee]);

  const currentSal = employee?.currentSalary;
  const currency = currentSal?.currency || 'USD';

  // Memoized live deduction calculation
  const totalDeductions = useMemo(() => {
    return deductionItems.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
  }, [deductionItems]);

  // Memoized live net take-home calculation
  const calculatedNet = useMemo(() => {
    return Math.max(
      0,
      Number(baseSalary || 0) + Number(bonus || 0) - totalDeductions
    );
  }, [baseSalary, bonus, totalDeductions]);

  const formatCurrency = useCallback((val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(val);
  }, [currency]);

  const handleAddItem = useCallback(() => {
    setDeductionItems((prev) => [
      ...prev,
      { category: 'TAX', label: '', amount: '' }
    ]);
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setDeductionItems((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const handleItemChange = useCallback((index: number, field: keyof LocalDeductionItem, val: any) => {
    setDeductionItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  }, []);

  if (!employee) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    if (baseSalary === '' || Number(baseSalary) <= 0) {
      setErrorMsg('Base salary is required and must be greater than zero');
      return;
    }

    // Validate deduction items: If an item is added, description and amount (> 0) are strictly required
    for (let i = 0; i < deductionItems.length; i++) {
      const item = deductionItems[i];
      if (!item.label || item.label.trim().length === 0) {
        setErrorMsg(`Deduction item #${i + 1} requires a valid description. Please enter one or delete the empty row.`);
        return;
      }
      const numAmt = Number(item.amount);
      if (item.amount === '' || isNaN(numAmt) || numAmt <= 0) {
        setErrorMsg(`Deduction item #${i + 1} ("${item.label}") requires an amount greater than 0.`);
        return;
      }
    }

    if (!changeReason || changeReason.trim().length < 3) {
      setErrorMsg('Please provide a valid audit reason (minimum 3 characters)');
      return;
    }

    if (!changedBy || changedBy.trim().length === 0) {
      setErrorMsg('Authorized by is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const validItems = deductionItems.map((i) => ({
        category: i.category,
        label: i.label.trim(),
        amount: Number(i.amount)
      }));

      const payload: UpdateSalaryInput = {
        baseSalary: Number(baseSalary),
        bonus: Number(bonus || 0),
        deductions: totalDeductions,
        currency,
        changeReason: changeReason.trim(),
        changedBy: changedBy.trim(),
        deductionItems: validItems
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
      title="Update Salary & Deductions"
      subtitle={`${employee.fullName} · ${employee.employeeCode} · ${employee.department?.name}`}
      maxWidth="md"
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
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1, textAlign: 'center' }}>
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

          {/* New Base & Bonus Inputs */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            <Input
              id={baseSalaryId}
              label={`Base Salary (${currency})`}
              type="number"
              min="1"
              required
              value={baseSalary === '' ? '' : baseSalary}
              onChange={(e) => setBaseSalary(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <Input
              id={bonusId}
              label={`Bonus (${currency})`}
              type="number"
              min="0"
              value={bonus === '' ? '' : bonus}
              onChange={(e) => setBonus(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </Box>

          {/* Itemized Deductions Section */}
          <Box
            sx={{
              p: 2,
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Receipt className="w-4 h-4 text-rose-500" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Itemized Deductions
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: '6px',
                    backgroundColor: '#ffe4e6',
                    color: '#e11d48',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '0.75rem'
                  }}
                >
                  Total: -{formatCurrency(totalDeductions)}
                </Typography>
              </Box>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleAddItem}
              >
                Add Deduction
              </Button>
            </Box>

            {deductionItems.length === 0 ? (
              <Box
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px dashed #cbd5e1'
                }}
              >
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  No deductions configured. Click &quot;Add Deduction&quot; to add Taxes, Health Insurance, Pension, or Loan recoveries.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {/* Column Headers for larger screens */}
                <Box
                  sx={{
                    display: { xs: 'none', sm: 'grid' },
                    gridTemplateColumns: '1.2fr 1.8fr 1fr 36px',
                    gap: 1.25,
                    px: 1.5,
                    pt: 0.5
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem' }}>
                    Category <Box component="span" sx={{ color: '#ef4444', fontWeight: 700 }}>*</Box>
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem' }}>
                    Description / Label <Box component="span" sx={{ color: '#ef4444', fontWeight: 700 }}>*</Box>
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem' }}>
                    Amount ({currency}) <Box component="span" sx={{ color: '#ef4444', fontWeight: 700 }}>*</Box>
                  </Typography>
                  <Box />
                </Box>

                {deductionItems.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1.8fr 1fr auto' },
                      gap: 1.25,
                      alignItems: 'center'
                    }}
                  >
                    <Select
                      required
                      label={undefined}
                      value={item.category}
                      onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                      options={DEDUCTION_CATEGORIES}
                    />

                    <Input
                      required
                      label={undefined}
                      placeholder="e.g. Income Tax (55%)"
                      value={item.label}
                      onChange={(e) => handleItemChange(idx, 'label', e.target.value)}
                    />

                    <Input
                      required
                      label={undefined}
                      type="number"
                      min="1"
                      placeholder="Amount"
                      value={item.amount === '' ? '' : item.amount}
                      onChange={(e) => handleItemChange(idx, 'amount', e.target.value === '' ? '' : Number(e.target.value))}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem(idx)}
                        sx={{
                          color: '#94a3b8',
                          '&:hover': { color: '#e11d48', backgroundColor: '#ffe4e6' }
                        }}
                        title="Remove deduction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Live Calculated Net Banner */}
          <Box
            sx={{
              p: 2,
              borderRadius: '16px',
              backgroundColor: '#fafbfc',
              border: '1px solid #e0e7ff',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 1
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#4f46e5' }}>
                New Calculated Net Salary
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Base ({formatCurrency(Number(baseSalary) || 0)}) + Bonus ({formatCurrency(Number(bonus) || 0)}) - Deductions ({formatCurrency(totalDeductions)})
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
              {formatCurrency(calculatedNet)}
            </Typography>
          </Box>

          {/* Reason for Audit Log */}
          <Input
            id={changeReasonId}
            label="Reason for Adjustment"
            required
            placeholder="e.g. Annual Merit Promotion, Tax Bracket Update"
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            helperText="Permanently recorded in immutable SalaryAuditLog table"
          />

          <Input
            id={changedById}
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
              Update salary & deductions
            </Button>
          </Box>
        </Box>
      </form>
    </Modal>
  );
};

