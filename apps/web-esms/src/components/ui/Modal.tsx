import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'sm'
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(6px)'
          }
        },
        paper: {
          sx: {
            borderRadius: { xs: '18px', sm: '24px' },
            m: { xs: 2, sm: 3 },
            width: { xs: 'calc(100% - 32px)', sm: 'auto' },
            p: { xs: 0.5, sm: 1 },
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            border: '1px solid #f1f5f9',
            backgroundColor: '#ffffff'
          }
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2.5, pb: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#0f172a' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8125rem', mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{
            color: '#94a3b8',
            '&:hover': {
              backgroundColor: '#f1f5f9',
              color: '#0f172a'
            }
          }}
        >
          <X className="w-5 h-5" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, pt: 1.5 }}>
        {children}
      </DialogContent>
    </Dialog>
  );
};
