import React from 'react';
import { Grid2 as Grid, Skeleton } from '@mui/material';

interface LoadingSkeletonGridProps {
  /** Número de cartões skeleton a exibir */
  count?: number;
  /** Altura de cada skeleton em px */
  height?: number;
  /** Colunas por breakpoint (padrão: xs=12 sm=6 md=3) */
  xs?: number;
  sm?: number;
  md?: number;
}

/**
 * Grade de skeletons para estados de carregamento.
 * Substitui padrões repetidos de Grid + Skeleton nos painéis.
 */
const LoadingSkeletonGrid: React.FC<LoadingSkeletonGridProps> = ({
  count = 4,
  height = 110,
  xs = 12,
  sm = 6,
  md = 3,
}) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, i) => (
      <Grid size={{ xs, sm, md }} key={i}>
        <Skeleton variant="rounded" height={height} />
      </Grid>
    ))}
  </Grid>
);

export default LoadingSkeletonGrid;
