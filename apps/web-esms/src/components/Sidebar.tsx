import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { LayoutDashboard, Users, BadgeDollarSign, BarChart3, X } from 'lucide-react';

export interface SidebarProps {
  onItemClick?: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick, onClose, isMobile = false }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/employees', label: 'Employees', icon: Users },
    { path: '/pay-bands', label: 'Pay bands', icon: BadgeDollarSign },
    { path: '/reports', label: 'Reports', icon: BarChart3 }
  ];

  const isItemActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === '/' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <Box
      sx={{
        width: 260,
        height: '100vh',
        position: isMobile ? 'static' : 'sticky',
        top: 0,
        backgroundColor: '#fafafa',
        borderRight: isMobile ? 'none' : '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        p: 3,
        flexShrink: 0,
        overflowY: 'auto'
      }}
    >
      {/* Brand Logo & Close button on mobile */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, px: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.125rem',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)',
              flexShrink: 0
            }}
          >
            E
          </Box>
          <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: '1.0625rem',
                color: '#0f172a',
                letterSpacing: '-0.02em',
                lineHeight: 1.15
              }}
            >
              ESMS
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                fontWeight: 500,
                fontSize: '0.6875rem',
                color: '#64748b',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              Salary Management
            </Typography>
          </Box>
        </Box>
        {isMobile && onClose && (
          <IconButton onClick={onClose} size="small" aria-label="close navigation" sx={{ color: '#64748b' }}>
            <X className="w-5 h-5" />
          </IconButton>
        )}
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {navItems.map((item) => {
          const isActive = isItemActive(item.path, item.exact);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 no-underline ${isActive
                ? 'bg-[#eeeffe] text-[#4f46e5] font-semibold'
                : 'text-slate-600 hover:text-[#4f46e5] hover:bg-[#eeeffe]'
                }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-[#4f46e5]' : 'text-slate-400'
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
