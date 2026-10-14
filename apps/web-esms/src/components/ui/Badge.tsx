import React from 'react';
import Chip, { type ChipProps } from '@mui/material/Chip';

export interface BadgeProps extends Omit<ChipProps, 'color' | 'variant' | 'size' | 'children'> {
  variant?:
    | 'success'
    | 'warning'
    | 'purple'
    | 'neutral'
    | 'rose'
    | 'indigo'
    | 'emerald'
    | 'cyan'
    | 'amber'
    | 'slate';
  size?: 'sm' | 'md';
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  children,
  variant = 'neutral',
  size = 'md',
  sx,
  className = '',
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
      case 'emerald':
        return {
          backgroundColor: '#e6f9ed',
          color: '#16a34a',
          border: '1px solid #bbf7d0'
        };
      case 'warning':
      case 'amber':
        return {
          backgroundColor: '#fef3c7',
          color: '#b45309',
          border: '1px solid #fde68a'
        };
      case 'purple':
      case 'indigo':
        return {
          backgroundColor: '#eeeffe',
          color: '#4f46e5',
          border: '1px solid #e0e2fe'
        };
      case 'rose':
        return {
          backgroundColor: '#ffe4e6',
          color: '#e11d48',
          border: '1px solid #fecdd3'
        };
      case 'cyan':
        return {
          backgroundColor: '#ecfeff',
          color: '#0891b2',
          border: '1px solid #a5f3fc'
        };
      case 'slate':
      case 'neutral':
      default:
        return {
          backgroundColor: '#f1f5f9',
          color: '#475569',
          border: '1px solid #e2e8f0'
        };
    }
  };

  const displayLabel = label || (typeof children === 'string' ? children : undefined);

  return (
    <Chip
      label={displayLabel || children}
      size={size === 'sm' ? 'small' : 'medium'}
      className={className}
      sx={{
        borderRadius: '9999px',
        fontWeight: 600,
        fontSize: size === 'sm' ? '0.75rem' : '0.8125rem',
        height: size === 'sm' ? '22px' : '26px',
        ...getVariantStyles(),
        ...sx
      }}
      {...props}
    />
  );
};
