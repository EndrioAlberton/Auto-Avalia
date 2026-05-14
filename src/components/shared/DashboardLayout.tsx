import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Drawer,
  List, ListItem, ListItemIcon, ListItemText, ListItemButton,
  Avatar, Menu, MenuItem, useTheme, useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

export interface NavMenuItem {
  text: string;
  icon: React.ReactNode;
  /** Rota completa, ex: '/professor/questionarios' */
  path: string;
  /** Caminho raiz para detecção de item ativo */
  rootPath?: string;
}

interface DashboardLayoutProps {
  /** Título exibido na AppBar */
  title: string;
  /** Itens do menu lateral */
  menuItems: NavMenuItem[];
  /** Cor inicial do gradiente da AppBar */
  gradientFrom?: string;
  /** Cor final do gradiente da AppBar */
  gradientTo?: string;
  /** Cor do item ativo no drawer */
  activeColor?: string;
  /** Conteúdo extra na AppBar (entre o título e o avatar) */
  extraAppBar?: React.ReactNode;
  /** Rota do perfil do usuário (para abrir via menu do avatar) */
  profilePath?: string;
  children: React.ReactNode;
}


/**
 * Layout compartilhado para os dashboards de Professor, Gestor e Secretaria.
 * Encapsula: AppBar, Drawer persistente, menu do usuário e área de conteúdo.
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  menuItems,
  gradientFrom = '#7c3aed',
  gradientTo = '#2563eb',
  activeColor = 'primary.main',
  extraAppBar,
  profilePath,
  children,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down('md'));

  const drawerWidth = 240;
  const showDrawer = isSm ? drawerOpen : true;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch { /* ignore */ }
  };

  /**
   * Um item é "ativo" se:
   * - É exatamente a rota raiz (sem sub-rotas) E a pathname é exatamente ele, OU
   * - A pathname começa com o path (para sub-rotas)
   * O primeiro item (normalmente o painel inicial) só ativa na correspondência exata.
   */
  const isActive = (item: NavMenuItem) => {
    const root = item.rootPath ?? item.path;
    const isRoot = menuItems[0].path === item.path;
    if (isRoot) return location.pathname === item.path;
    return location.pathname.startsWith(root);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* ── AppBar ─────────────────────────────────────────────────────────── */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: t => t.zIndex.drawer + 1,
          background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(o => !o)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            {title}
          </Typography>

          {extraAppBar}

          <IconButton onClick={e => setAnchorEl(e.currentTarget)} color="inherit">
            <Avatar
              src={currentUser?.photoURL || undefined}
              sx={{ width: 34, height: 34, bgcolor: 'rgba(255,255,255,0.25)', fontSize: 15 }}
            >
              {currentUser?.displayName?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem disabled sx={{ opacity: '1 !important' }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {currentUser?.displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentUser?.email}
                </Typography>
              </Box>
            </MenuItem>
            {profilePath && (
              <MenuItem onClick={() => { navigate(profilePath); setAnchorEl(null); }}>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                Meu Perfil
              </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* ── Drawer ─────────────────────────────────────────────────────────── */}
      <Drawer
        variant={isSm ? 'temporary' : 'persistent'}
        open={showDrawer}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          display: { xs: showDrawer ? 'block' : 'none', md: 'block' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 1 }}>
          <List dense>
            {menuItems.map(item => {
              const active = isActive(item);
              return (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    selected={active}
                    sx={{ borderRadius: 2, mx: 1, mb: 0.5 }}
                  >
                    <ListItemIcon sx={{ color: active ? activeColor : 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ fontWeight: active ? 700 : 400 }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>

      {/* ── Conteúdo principal ─────────────────────────────────────────────── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: !isSm ? `${drawerWidth}px` : 0,
          transition: 'all 0.3s',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: isSm ? 1 : 2 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
