import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Menu } from 'lucide-react';
import { payscapeTheme } from './theme/theme';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { PayBandsPage } from './pages/PayBandsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ToastProvider } from './components/ui/ToastProvider';

export function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  return (
    <ThemeProvider theme={payscapeTheme}>
      <CssBaseline />
      {/* Toast lives outside router — always mounted */}
      <ToastProvider />
      <BrowserRouter>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: '#f8fafc'
          }}
        >
          {/* Mobile Top Navbar (visible only on mobile/tablet < md) */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2.5,
              py: 1.5,
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e2e8f0',
              flexShrink: 0,
              zIndex: 10
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '9px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1rem',
                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.35)'
                }}
              >
                E
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a', lineHeight: 1.2 }}>
                  ESMS
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.6875rem' }}>
                  Salary Management
                </Typography>
              </Box>
            </Box>

            <IconButton
              onClick={handleDrawerToggle}
              aria-label="open navigation menu"
              sx={{ color: '#334155' }}
            >
              <Menu className="w-6 h-6" />
            </IconButton>
          </Box>

          {/* Desktop Permanent Sidebar (hidden on mobile, visible on md+) */}
          <Box
            component="nav"
            sx={{
              display: { xs: 'none', md: 'block' },
              width: 260,
              flexShrink: 0
            }}
          >
            <Sidebar />
          </Box>

          {/* Mobile Slide-over Drawer (visible on < md when mobileOpen is true) */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerClose}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                width: 260,
                boxSizing: 'border-box',
                backgroundColor: '#fafafa',
                boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)'
              }
            }}
          >
            <Sidebar isMobile onItemClick={handleDrawerClose} onClose={handleDrawerClose} />
          </Drawer>

          {/* Main content: scrollable column */}
          <Box
            component="main"
            sx={{
              flex: 1,
              minWidth: 0,
              height: { xs: 'calc(100vh - 57px)', md: '100vh' },
              overflowY: 'auto',
              backgroundColor: '#f8fafc'
            }}
          >
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/pay-bands" element={<PayBandsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
