import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import GroupsIcon from '@mui/icons-material/Groups';
import { colors } from '../../components/ui/tokens';
import { Footer } from '../../components/ui/layout/Footer';

interface AuthLayoutProps {
  children: React.ReactNode;
  leftTitle: string;
  leftSubtitle: string;
}

export function AuthLayout({ children, leftTitle, leftSubtitle }: AuthLayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', background: colors.canvas }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 4,
          py: 1.5,
          background: colors.accent,
        }}
      >
        <Box
          component="img"
          src="/logoif.png"
          alt="Logo IFRS"
          sx={{ height: 44, width: 'auto', filter: 'brightness(0) invert(1)' }}
        />
        <Box
          component="img"
          src="/logoMPIE.png"
          alt="Logo MPIE"
          sx={{ height: 44, width: 'auto', filter: 'brightness(0) invert(1)' }}
        />
      </Box>

      {/* Body */}
      <Box sx={{ minHeight: 'calc(100vh - 148px)', display: 'flex' }}>
        {/* Left panel */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            width: '40%',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            px: 7,
            gap: 3,
            borderRight: `1px solid ${colors.hairline}`,
          }}
        >
          {/* Illustration */}
          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
            {[AssessmentIcon, ChecklistRtlIcon, GroupsIcon].map((Icon, i) => (
              <Box
                key={i}
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '14px',
                  background: colors.accentDim,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon sx={{ color: colors.accent, fontSize: 26 }} />
              </Box>
            ))}
          </Box>

          <Box>
            <Typography sx={{ fontSize: 26, fontWeight: 700, color: colors.accent, mb: 1 }}>
              {leftTitle}
            </Typography>
            <Typography sx={{ fontSize: 15, color: colors.inkMuted, lineHeight: 1.7 }}>
              {leftSubtitle}
            </Typography>
          </Box>
        </Box>

        {/* Right panel */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: { xs: 3, md: 8 },
            background: colors.surface1,
          }}
        >
          <Box sx={{ maxWidth: 400, width: '100%', mx: 'auto' }}>
            {/* Mobile title */}
            <Typography sx={{ display: { xs: 'block', md: 'none' }, fontSize: 22, fontWeight: 700, color: colors.accent, mb: 3 }}>
              Autoavalia
            </Typography>
            {children}
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
