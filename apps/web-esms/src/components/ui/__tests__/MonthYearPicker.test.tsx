import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MonthYearPicker } from '../MonthYearPicker';

describe('MonthYearPicker', () => {
  const defaultProps = {
    selectedMonth: 10,
    selectedYear: 2026,
    availableYears: [2026, 2025, 2024],
    onChange: vi.fn(),
    disabled: false
  };

  it('renders selected month and year buttons', () => {
    render(<MonthYearPicker {...defaultProps} />);

    expect(screen.getByRole('button', { name: /Select month: October/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select year: 2026/i })).toBeInTheDocument();
  });

  it('opens month dropdown and selects a new month', () => {
    const handleChange = vi.fn();
    render(<MonthYearPicker {...defaultProps} onChange={handleChange} />);

    const monthButton = screen.getByRole('button', { name: /Select month: October/i });
    fireEvent.click(monthButton);

    // Dropdown is open, click January
    const janOption = screen.getByRole('option', { name: 'January' });
    expect(janOption).toBeInTheDocument();
    fireEvent.click(janOption);

    expect(handleChange).toHaveBeenCalledWith(1, 2026);
  });

  it('opens year dropdown and selects a new year', () => {
    const handleChange = vi.fn();
    render(<MonthYearPicker {...defaultProps} onChange={handleChange} />);

    const yearButton = screen.getByRole('button', { name: /Select year: 2026/i });
    fireEvent.click(yearButton);

    const yearOption = screen.getByRole('option', { name: '2024' });
    expect(yearOption).toBeInTheDocument();
    fireEvent.click(yearOption);

    expect(handleChange).toHaveBeenCalledWith(10, 2024);
  });

  it('disables buttons when disabled prop is true', () => {
    render(<MonthYearPicker {...defaultProps} disabled={true} />);

    const monthButton = screen.getByRole('button', { name: /Select month: October/i });
    const yearButton = screen.getByRole('button', { name: /Select year: 2026/i });

    expect(monthButton).toBeDisabled();
    expect(yearButton).toBeDisabled();
  });
});
