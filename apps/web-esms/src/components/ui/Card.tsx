import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface CardProps {
  id?: string;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

export const Card: React.FC<CardProps> = ({
  id,
  title,
  subtitle,
  headerRight,
  children,
  className = '',
  padding = 'md',
  border = true
}) => {
  const paddingMap = {
    none: 0,
    sm: '16px',
    md: '24px',
    lg: '32px'
  };

  const headerPx = padding === 'none' ? '24px' : paddingMap[padding];
  const headerPt = padding === 'none' ? '20px' : paddingMap[padding];
  const headerPb = padding === 'none' ? '18px' : 2;

  return (
    <Paper
      id={id}
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: border ? '1px solid #f1f5f9' : 'none',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)'
        }
      }}
      className={className}
    >
      {(title || subtitle || headerRight) && (
        <Box
          sx={{
            px: headerPx,
            pt: headerPt,
            pb: headerPb,
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            rowGap: 1.5,
            borderBottom: padding === 'none' ? '1px solid #f1f5f9' : 'none',
            gap: 2
          }}
        >
          <Box>
            {title && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: '#0f172a',
                  lineHeight: 1.3
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: '#64748b',
                  fontSize: '0.8125rem',
                  mt: 0.5
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {headerRight && <Box>{headerRight}</Box>}
        </Box>
      )}

      <Box sx={{ p: paddingMap[padding], pt: title || subtitle || headerRight ? 0 : paddingMap[padding] }}>
        {children}
      </Box>
    </Paper>
  );
};
