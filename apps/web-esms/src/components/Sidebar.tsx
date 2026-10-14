import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', exact: true },
    { path: '/employees', label: 'Employees' },
    { path: '/pay-bands', label: 'Pay bands' },
    { path: '/reports', label: 'Reports' }
  ];

  const isItemActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === '/' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <Box
      sx={{
        width: 240,
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: '#fafafa',
        borderRight: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        p: 3,
        flexShrink: 0,
        overflowY: 'auto'
      }}
    >
      {/* Brand Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4, px: 0.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '10px',
            backgroundColor: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.125rem',
            boxShadow: '0 2px 4px rgba(79, 70, 229, 0.3)',
            flexShrink: 0
          }}
        >
          P
        </Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: 800, fontSize: '1.1875rem', color: '#0f172a', letterSpacing: '-0.02em' }}
        >
          Payscape
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {navItems.map((item) => {
          const isActive = isItemActive(item.path, item.exact);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 no-underline ${
                isActive
                  ? 'bg-[#eeeffe] text-[#4f46e5] font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${
                  isActive ? 'bg-[#4f46e5]' : 'bg-slate-300'
                }`}
              />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </Box>
    </Box>
  );
};
