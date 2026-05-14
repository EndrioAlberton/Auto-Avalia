import React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { colors, radius } from '../tokens';

interface ContentCardProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
}

export function ContentCard({ title, action, children, noPadding }: ContentCardProps) {
  return (
    <Box
      sx={{
        background: colors.surface1,
        border: `1px solid ${colors.hairline}`,
        borderRadius: `${radius.lg}px`,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontSize: 15, fontWeight: 500, color: colors.ink }}>
          {title}
        </Typography>
        {action && <Box>{action}</Box>}
      </Box>

      <Divider />

      <Box sx={{ p: noPadding ? 0 : 3 }}>{children}</Box>
    </Box>
  );
}
