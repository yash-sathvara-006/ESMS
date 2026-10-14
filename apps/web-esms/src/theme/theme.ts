import { createTheme } from '@mui/material/styles';

export const payscapeTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4f46e5',
      light: '#eeeffe',
      dark: '#4338ca',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#64748b',
      light: '#f1f5f9',
      dark: '#334155',
      contrastText: '#ffffff'
    },
    success: {
      main: '#16a34a',
      light: '#e6f9ed',
      contrastText: '#16a34a'
    },
    warning: {
      main: '#d97706',
      light: '#fef3c7',
      contrastText: '#b45309'
    },
    error: {
      main: '#e11d48',
      light: '#ffe4e6',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b'
    },
    divider: '#f1f5f9'
  },
  shape: {
    borderRadius: 16
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif'
    ].join(','),
    h1: { fontWeight: 800, color: '#0f172a' },
    h2: { fontWeight: 700, color: '#0f172a' },
    h3: { fontWeight: 700, color: '#0f172a' },
    h4: { fontWeight: 700, color: '#0f172a' },
    h5: { fontWeight: 600, color: '#0f172a' },
    h6: { fontWeight: 600, color: '#0f172a' },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: 'none',
          padding: '8px 18px',
          fontSize: '0.875rem',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)'
          }
        },
        contained: {
          backgroundColor: '#4f46e5',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#4338ca'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
          backgroundImage: 'none'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          backgroundImage: 'none'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #f1f5f9',
          padding: '14px 18px',
          color: '#0f172a',
          fontSize: '0.875rem'
        },
        head: {
          fontWeight: 600,
          color: '#64748b',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          backgroundColor: '#fafbfc'
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          fontSize: '0.875rem',
          '& fieldset': {
            borderColor: '#e2e8f0'
          },
          '&:hover fieldset': {
            borderColor: '#cbd5e1'
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
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.75rem'
        }
      }
    }
  }
});
