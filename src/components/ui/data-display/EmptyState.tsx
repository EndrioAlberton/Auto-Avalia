import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { colors } from '../tokens';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 2,
        gap: 1.5,
      }}
    >
      <Box sx={{ color: colors.inkSubtle, '& svg': { fontSize: 32 } }}>{icon}</Box>
      <Typography sx={{ fontSize: 16, fontWeight: 500, color: colors.inkMuted }}>
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: 14,
          color: colors.inkSubtle,
          maxWidth: 280,
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        {body}
      </Typography>
      {action && (
        <Button variant="outlined" onClick={action.onClick} sx={{ mt: 0.5 }}>
          {action.label}
        </Button>
      )}
    </Box>
  );
}
