import React from 'react';
import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  sx,
  ...props
}) => {
  const sizeStyles = {
    sm: { py: '6px', px: '14px', fontSize: '0.8125rem' },
    md: { py: '9px', px: '18px', fontSize: '0.875rem' },
    lg: { py: '12px', px: '24px', fontSize: '1rem' }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#4f46e5',
          color: '#ffffff',
          border: 'none',
          '&:hover': {
            backgroundColor: '#4338ca',
            boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)'
          }
        };
      case 'secondary':
        return {
          backgroundColor: '#ffffff',
          color: '#334155',
          border: '1px solid #e2e8f0',
          '&:hover': {
            backgroundColor: '#f8fafc',
            borderColor: '#cbd5e1'
          }
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: '#475569',
          border: '1px solid #e2e8f0',
          '&:hover': {
            backgroundColor: '#f1f5f9'
          }
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: '#64748b',
          border: 'none',
          '&:hover': {
            backgroundColor: '#f1f5f9',
            color: '#0f172a'
          }
        };
      case 'danger':
        return {
          backgroundColor: '#e11d48',
          color: '#ffffff',
          border: 'none',
          '&:hover': {
            backgroundColor: '#be123c'
          }
        };
      default:
        return {};
    }
  };

  return (
    <MuiButton
      disabled={disabled || isLoading}
      className={className}
      sx={{
        borderRadius: '12px',
        fontWeight: 600,
        textTransform: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        transition: 'all 0.15s ease',
        ...sizeStyles[size],
        ...getVariantStyles(),
        ...sx
      }}
      {...props}
    >
      {isLoading ? (
        <CircularProgress size={16} sx={{ color: 'inherit' }} />
      ) : (
        leftIcon && <span className="inline-flex items-center">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="inline-flex items-center">{rightIcon}</span>
      )}
    </MuiButton>
  );
};
