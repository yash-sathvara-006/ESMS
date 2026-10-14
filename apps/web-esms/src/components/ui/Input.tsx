import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import OutlinedInput, { type OutlinedInputProps } from '@mui/material/OutlinedInput';
import { Skeleton } from './Skeleton';

export interface InputProps extends Omit<OutlinedInputProps, 'error'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  isLoading?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  min,
  max,
  step,
  isLoading = false,
  inputProps,
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

  const mergedInputProps = {
    min,
    max,
    step,
    ...inputProps
  };

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

      <OutlinedInput
        error={!!error}
        fullWidth
        inputProps={mergedInputProps}
        startAdornment={
          leftIcon ? (
            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
              {leftIcon}
            </Box>
          ) : undefined
        }
        endAdornment={
          rightIcon ? (
            <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
              {rightIcon}
            </Box>
          ) : undefined
        }
        sx={{
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          fontSize: '0.875rem',
          color: '#0f172a',
          '& .MuiOutlinedInput-input': {
            py: '10px',
            px: leftIcon ? '4px' : '14px'
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
          '& input[type=number]': {
            MozAppearance: 'textfield'
          },
          '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
            margin: 0
          },
          ...sx
        }}
        {...props}
      />

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
