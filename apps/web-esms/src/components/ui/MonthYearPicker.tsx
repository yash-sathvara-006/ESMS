import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import Box from '@mui/material/Box';
import { ChevronDown } from 'lucide-react';

export const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

export interface MonthYearPickerProps {
  selectedMonth: number; // 1 - 12
  selectedYear: number;
  availableYears: number[];
  onChange: (month: number, year: number) => void;
  disabled?: boolean;
}

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  selectedMonth,
  selectedYear,
  availableYears,
  onChange,
  disabled = false
}) => {
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const monthRef = useRef<HTMLDivElement | null>(null);
  const yearRef = useRef<HTMLDivElement | null>(null);

  const monthId = useId();
  const yearId = useId();

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (monthRef.current && !monthRef.current.contains(e.target as Node)) {
        setIsMonthOpen(false);
      }
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) {
        setIsYearOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleSelectMonth = useCallback((month: number) => {
    onChange(month, selectedYear);
    setIsMonthOpen(false);
  }, [onChange, selectedYear]);

  const handleSelectYear = useCallback((year: number) => {
    onChange(selectedMonth, year);
    setIsYearOpen(false);
  }, [onChange, selectedMonth]);

  const currentMonthLabel = MONTHS.find((m) => m.value === selectedMonth)?.label || 'Month';

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      {/* Month Dropdown */}
      <Box ref={monthRef} sx={{ position: 'relative' }}>
        <button
          id={monthId}
          type="button"
          aria-label={`Select month: ${currentMonthLabel}`}
          disabled={disabled}
          onClick={() => {
            setIsYearOpen(false);
            setIsMonthOpen((prev) => !prev);
          }}
          aria-haspopup="listbox"
          aria-expanded={isMonthOpen}
          className="flex items-center justify-between gap-2.5 px-3.5 py-1.5 text-sm font-semibold rounded-lg bg-white border border-slate-300 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer min-w-[130px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            borderColor: isMonthOpen ? '#4f46e5' : '#cbd5e1',
            boxShadow: isMonthOpen ? '0 0 0 2px rgba(79, 70, 229, 0.2)' : undefined
          }}
        >
          <span className="text-slate-800">{currentMonthLabel}</span>
          <ChevronDown
            size={16}
            className={`text-slate-500 transition-transform duration-200 ${isMonthOpen ? 'rotate-180 text-indigo-600' : ''}`}
          />
        </button>

        {isMonthOpen && (
          <div
            role="listbox"
            tabIndex={-1}
            className="absolute left-0 top-[calc(100%+4px)] z-50 w-full min-w-[140px] bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
            style={{
              scrollbarWidth: 'thin',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            }}
          >
            {MONTHS.map((m) => {
              const isSelected = m.value === selectedMonth;
              return (
                <div
                  key={m.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectMonth(m.value)}
                  className={`px-3.5 py-2 text-sm cursor-pointer select-none transition-colors ${isSelected
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                >
                  {m.label}
                </div>
              );
            })}
          </div>
        )}
      </Box>

      {/* Year Dropdown */}
      <Box ref={yearRef} sx={{ position: 'relative' }}>
        <button
          id={yearId}
          type="button"
          aria-label={`Select year: ${selectedYear}`}
          disabled={disabled}
          onClick={() => {
            setIsMonthOpen(false);
            setIsYearOpen((prev) => !prev);
          }}
          aria-haspopup="listbox"
          aria-expanded={isYearOpen}
          className="flex items-center justify-between gap-2.5 px-3.5 py-1.5 text-sm font-semibold rounded-lg bg-white border border-slate-300 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer min-w-[95px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            borderColor: isYearOpen ? '#4f46e5' : '#cbd5e1',
            boxShadow: isYearOpen ? '0 0 0 2px rgba(79, 70, 229, 0.2)' : undefined
          }}
        >
          <span className="text-slate-800">{selectedYear}</span>
          <ChevronDown
            size={16}
            className={`text-slate-500 transition-transform duration-200 ${isYearOpen ? 'rotate-180 text-indigo-600' : ''}`}
          />
        </button>

        {isYearOpen && (
          <div
            role="listbox"
            tabIndex={-1}
            className="absolute left-0 top-[calc(100%+4px)] z-50 w-full min-w-[100px] bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
            style={{
              scrollbarWidth: 'thin',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            }}
          >
            {availableYears.map((year) => {
              const isSelected = year === selectedYear;
              return (
                <div
                  key={year}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectYear(year)}
                  className={`px-3.5 py-2 text-sm cursor-pointer select-none transition-colors ${isSelected
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                >
                  {year}
                </div>
              );
            })}
          </div>
        )}
      </Box>
    </Box>
  );
};
