import React from 'react';
import { Box, Typography, Button, SvgIcon } from '@mui/material';
import { Assignment as DefaultIcon } from '@mui/icons-material';

interface EmptyStateProps {
  title?: string;
  message: string;
  /** Ícone MUI (componente) */
  icon?: React.ElementType;
  /** Texto do botão de ação (opcional) */
  actionLabel?: string;
  onAction?: () => void;
  severity?: 'info' | 'warning' | 'success';
}

const COLOR_MAP = {
  info: '#2563eb',
  warning: '#d97706',
  success: '#059669',
};

/**
 * Estado vazio padronizado.
 * Substitui os múltiplos <Alert severity="info"> usados como empty-state.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon: Icon = DefaultIcon,
  actionLabel,
  onAction,
  severity = 'info',
}) => {
  const color = COLOR_MAP[severity];

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      py={6}
      px={3}
    >
      <SvgIcon
        component={Icon}
        sx={{ fontSize: 64, color, opacity: 0.4, mb: 2 }}
        inheritViewBox
      />
      {title && (
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {title}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" maxWidth={400}>
        {message}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" sx={{ mt: 3 }} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
