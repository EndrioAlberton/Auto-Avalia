import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

/**
 * Cartão de indicador (KPI) com borda colorida à esquerda.
 * Usado nos painéis de Gestor e Secretaria.
 */
const KpiCard: React.FC<KpiCardProps> = ({
  label, value, sub, color = '#7c3aed', icon, loading = false,
}) => {
  if (loading) return <Skeleton variant="rounded" height={110} />;

  return (
    <Card elevation={2} sx={{ borderLeft: `4px solid ${color}`, height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {label}
            </Typography>
            <Typography variant="h3" fontWeight={700} sx={{ color }}>
              {value}
            </Typography>
            {sub && (
              <Typography variant="caption" color="text.secondary">
                {sub}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box sx={{ color, opacity: 0.3, fontSize: 40 }}>
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
