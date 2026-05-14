import Box from '@mui/material/Box';
import { colors, radius } from '../tokens';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rect' | 'circle';
}

export function Skeleton({ width = '100%', height = 16, variant = 'rect' }: SkeletonProps) {
  return (
    <Box
      sx={{
        width,
        height,
        background: colors.surface2,
        borderRadius: variant === 'circle' ? '50%' : `${radius.xs}px`,
        '@keyframes shimmer': {
          '0%':   { opacity: 0.4 },
          '50%':  { opacity: 0.8 },
          '100%': { opacity: 0.4 },
        },
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
}
