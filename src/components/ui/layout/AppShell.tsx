import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import { NavConfig } from './nav.types';
import { Sidebar } from './Sidebar';
import { colors, motion } from '../tokens';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { initials } from '../../utils/userUtils';

const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 64;
const STORAGE_KEY = 'sidebar_collapsed';

interface AppShellProps {
  navConfig: NavConfig;
  children: React.ReactNode;
  hideSidebar?: boolean;
}

function roleLabel(role?: string): string {
  const labels: Record<string, string> = {
    professor: 'Professor',
    gestor: 'Gestor',
    secretaria: 'Secretaria',
    admin: 'Admin',
    estudante: 'Estudante',
  };
  return role ? (labels[role] ?? role) : '';
}

export function AppShell({ navConfig, children, hideSidebar = false }: AppShellProps) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      const next = !v;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarWidth = hideSidebar ? 0 : collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  const sidebar = !hideSidebar ? (
    <Sidebar
      navConfig={navConfig}
      collapsed={collapsed}
      onToggle={toggleCollapsed}
      userName={currentUser?.displayName ?? ''}
      userRole={roleLabel(currentUser?.role)}
      onLogout={handleLogout}
    />
  ) : null;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: colors.canvas }}>
      {/* Desktop sidebar */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'none', md: 'flex' },
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1200,
          height: '100vh',
        }}
      >
        {sidebar}
      </Box>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            background: colors.surface1,
            border: 'none',
            width: SIDEBAR_EXPANDED,
          },
        }}
      >
        <Sidebar
          navConfig={navConfig}
          collapsed={false}
          onToggle={() => setMobileOpen(false)}
          userName={currentUser?.displayName ?? ''}
          userRole={roleLabel(currentUser?.role)}
          onLogout={handleLogout}
        />
      </Drawer>

      {/* Mobile topbar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { xs: 'flex', md: 'none' },
          background: colors.surface1,
          borderBottom: `1px solid ${colors.hairline}`,
          height: 56,
        }}
      >
        <Toolbar sx={{ height: 56, minHeight: '56px !important', px: 2 }}>
          <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ color: colors.inkSubtle, mr: 1 }}>
            <MenuIcon />
          </IconButton>
          <Typography sx={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 600, color: colors.ink }}>
            Autoavalia
          </Typography>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: colors.accentDim, color: colors.accentHover }}>
              {initials(currentUser?.displayName ?? '')}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{ sx: { background: colors.surface2, border: `1px solid ${colors.hairline}`, mt: 1 } }}
          >
            <MenuItem onClick={() => { setAnchorEl(null); navigate(navConfig.profilePath); }} sx={{ color: colors.ink, fontSize: 14 }}>
              Perfil
            </MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); handleLogout(); }} sx={{ color: colors.inkSubtle, fontSize: 14 }}>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: { xs: 0, md: hideSidebar ? 0 : `${sidebarWidth}px` },
          transition: `margin-left ${motion.base} ${motion.easing}`,
          pt: { xs: '56px', md: 0 },
          minHeight: '100vh',
        }}
      >
        <Box
          sx={{
            maxWidth: 1024,
            mx: 'auto',
            px: { xs: 2, md: 3 },
            py: { xs: 3, md: 4 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
