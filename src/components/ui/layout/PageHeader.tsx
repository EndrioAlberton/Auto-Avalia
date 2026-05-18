import React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { colors } from '../tokens';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, action }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          {eyebrow && (
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 500,
                color: colors.inkSubtle,
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                mb: 0.5,
              }}
            >
              {eyebrow}
            </Typography>
          )}
          <Typography
            sx={{
              fontSize: 28,
              fontWeight: 600,
              color: colors.ink,
              letterSpacing: '-0.6px',
              lineHeight: 1.15,
            }}
          >
            {title}
          </Typography>
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Box>
      <Divider sx={{ mt: 3 }} />
    </Box>
  );
}
