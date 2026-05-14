import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { NavConfig } from './nav.types';
import { colors, radius, motion } from '../tokens';
import { initials } from '../../../utils/userUtils';

interface SidebarProps {
  navConfig: NavConfig;
  collapsed: boolean;
  onToggle: () => void;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export function Sidebar({ navConfig, collapsed, onToggle, userName = '', userRole = '', onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const width = collapsed ? 64 : 240;

  return (
    <Box
      component="nav"
      sx={{
        width,
        minWidth: width,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: colors.surface1,
        borderRight: `1px solid ${colors.hairline}`,
        transition: `width ${motion.base} ${motion.easing}`,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          height: 48,
          px: collapsed ? 1 : 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: colors.ink,
              letterSpacing: '-0.2px',
              whiteSpace: 'nowrap',
            }}
          >
            Autoavalia
          </Typography>
        )}
        <Tooltip title={collapsed ? 'Expandir menu' : 'Recolher menu'} placement="right">
          <IconButton size="small" onClick={onToggle} sx={{ color: colors.inkSubtle }}>
            {collapsed ? <MenuIcon fontSize="small" /> : <MenuOpenIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider />

      {/* Nav */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1 }}>
        {navConfig.sections.map((section, si) => (
          <React.Fragment key={si}>
            {si > 0 && <Divider sx={{ my: 0.5 }} />}
            {section.items.map((item) => {
              const active = item.end
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              const Icon = item.icon;

              const btn = (
                <Box
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    mx: 0.75,
                    my: 0.25,
                    px: collapsed ? 0 : 1.5,
                    py: 1,
                    borderRadius: `${radius.md}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: collapsed ? 0 : 1.25,
                    cursor: 'pointer',
                    background: active ? colors.surface2 : 'transparent',
                    color: active ? colors.ink : colors.inkSubtle,
                    fontWeight: active ? 500 : 400,
                    transition: `background ${motion.fast} ease`,
                    '&:hover': { background: colors.surface2 },
                  }}
                >
                  <Icon fontSize="small" />
                  {!collapsed && (
                    <Typography
                      noWrap
                      sx={{ fontSize: 14, fontWeight: 'inherit', color: 'inherit', lineHeight: 1 }}
                    >
                      {item.label}
                    </Typography>
                  )}
                </Box>
              );

              return collapsed ? (
                <Tooltip key={item.path} title={item.label} placement="right">
                  {btn}
                </Tooltip>
              ) : (
                btn
              );
            })}
          </React.Fragment>
        ))}
      </Box>

      <Divider />

      {/* Footer */}
      <Box
        sx={{
          height: 56,
          px: collapsed ? 1 : 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : 1,
          justifyContent: collapsed ? 'center' : 'flex-start',
          flexShrink: 0,
        }}
      >
        {collapsed ? (
          <Tooltip
            title={
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink }}>{userName}</Typography>
                <Typography sx={{ fontSize: 12, color: colors.inkSubtle }}>{userRole}</Typography>
                <Box
                  onClick={onLogout}
                  sx={{ mt: 0.5, cursor: 'pointer', color: colors.inkSubtle, fontSize: 12, '&:hover': { color: colors.ink } }}
                >
                  Sair
                </Box>
              </Box>
            }
            placement="right"
          >
            <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: colors.accentDim, color: colors.accentHover, cursor: 'pointer' }}>
              {initials(userName)}
            </Avatar>
          </Tooltip>
        ) : (
          <>
            <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: colors.accentDim, color: colors.accentHover, flexShrink: 0 }}>
              {initials(userName)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: 13, color: colors.ink, lineHeight: 1.2 }}>
                {userName}
              </Typography>
              <Typography noWrap sx={{ fontSize: 12, color: colors.inkSubtle }}>
                {userRole}
              </Typography>
            </Box>
            <Tooltip title="Sair">
              <IconButton size="small" onClick={onLogout} sx={{ color: colors.inkSubtle, flexShrink: 0 }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Box>
  );
}
