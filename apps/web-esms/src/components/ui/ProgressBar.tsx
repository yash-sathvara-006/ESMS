import React from 'react';
import Box from '@mui/material/Box';
import LinearProgress, { type LinearProgressProps } from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

export interface ProgressBarProps extends LinearProgressProps {
  value: number; // 0 to 100
  labelLeft?: string;
  labelRight?: string;
  barColor?: string;
  trackColor?: string;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  labelLeft,
  labelRight,
  barColor = '#4f46e5',
  trackColor = '#eeeffe',
  height = 8,
  sx,
  ...props
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, value))}
        sx={{
          height,
          borderRadius: `${height}px`,
          backgroundColor: trackColor,
          '& .MuiLinearProgress-bar': {
            borderRadius: `${height}px`,
            backgroundColor: barColor
          },
          ...sx
        }}
        {...props}
      />

      {(labelLeft || labelRight) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
          {labelLeft && (
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>
              {labelLeft}
            </Typography>
          )}
          {labelRight && (
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>
              {labelRight}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};
