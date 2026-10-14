import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { payscapeTheme } from './theme/theme';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { PayBandsPage } from './pages/PayBandsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ToastProvider } from './components/ui/ToastProvider';

export function App() {
  return (
    <ThemeProvider theme={payscapeTheme}>
      <CssBaseline />
      {/* Toast lives outside router — always mounted */}
      <ToastProvider />
      <BrowserRouter>
        {/*
          Outer shell: full viewport height, no overflow so the page itself
          never scrolls. Only the right content column scrolls.
        */}
        <Box
          sx={{
            display: 'flex',
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: '#f8fafc'
          }}
        >
          {/* Sidebar: sticky, fixed height — does not scroll with content */}
          <Sidebar />

          {/* Main content: scrollable column */}
          <Box
            component="main"
            sx={{
              flex: 1,
              minWidth: 0,
              height: '100vh',
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
