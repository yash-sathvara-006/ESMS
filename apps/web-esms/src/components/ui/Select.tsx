import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiSelect, { type SelectProps as MuiSelectProps } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Skeleton } from './Skeleton';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<MuiSelectProps<string>, 'error' | 'variant'> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  placeholder?: string;
  variant?: 'outlined' | 'filled' | 'standard';
  isLoading?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  placeholder,
  variant = 'outlined',
  isLoading = false,
  children,
  className = '',
  sx,
  ...props
}) => {
  if (isLoading) {
    return (
      <Box className={`w-full ${className}`}>
        {label && (
          <Skeleton height={14} width="40%" className="mb-2" />
        )}
        <Skeleton height={42} borderRadius="12px" />
      </Box>
    );
  }

  return (
    <Box className={`w-full ${className}`}>
      {label && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontWeight: 600,
            fontSize: '0.8125rem',
            color: '#334155',
            mb: 0.75
          }}
        >
          {label}
        </Typography>
      )}

      <MuiSelect
        variant={variant}
        error={!!error}
        fullWidth
        displayEmpty
        renderValue={(selected: any) => {
          if (!selected || selected === '') {
            return <span style={{ color: '#94a3b8' }}>{placeholder || 'Select'}</span>;
          }
          const found = options?.find((o) => o.value === selected);
          return found ? found.label : (selected as string);
        }}
        MenuProps={{
          disableScrollLock: true,
          transitionDuration: 100,
          slotProps: {
            paper: {
              sx: {
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                maxHeight: 280
              }
            }
          }
        }}
        sx={{
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          fontSize: '0.875rem',
          '& .MuiSelect-select': {
            py: '9.5px',
            px: '14px',
            color: props.value === '' || props.value === undefined ? '#94a3b8' : '#0f172a'
          },
          '& fieldset': {
            borderColor: '#e2e8f0'
          },
          '&:hover fieldset': {
            borderColor: '#e2e8f0'
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e2e8f0'
          },
          '&.Mui-focused fieldset': {
            borderColor: '#4f46e5',
            borderWidth: '1.5px'
          },
          ...sx
        }}
        {...props}
      >

        {/* Options array mode */}
        {options
          ? options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.875rem' }}>
              {opt.label}
            </MenuItem>
          ))
          : // Children mode (for backward compat — wrap <option> tags as MenuItems)
          React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return null;
            const { value, children: optLabel, disabled } = child.props as any;
            // Skip <option value=""> which is the old placeholder
            if (value === '' || value === undefined) return null;
            return (
              <MenuItem key={value} value={value} disabled={disabled} sx={{ fontSize: '0.875rem' }}>
                {optLabel}
              </MenuItem>
            );
          })}
      </MuiSelect>

      {(error || helperText) && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            fontSize: '0.75rem',
            color: error ? '#e11d48' : '#64748b'
          }}
        >
          {error || helperText}
        </Typography>
      )}
    </Box>
  );
};
