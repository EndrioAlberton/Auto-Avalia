import Box from '@mui/material/Box';
import { colors, radius } from '../tokens';

type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'accent';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { bg: string; color: string }> = {
  success: { bg: 'rgba(39,166,68,0.12)',  color: colors.success },
  warning: { bg: 'rgba(217,119,6,0.12)',  color: colors.warning },
  error:   { bg: 'rgba(220,38,38,0.12)',  color: colors.error },
  neutral: { bg: colors.surface2,         color: colors.inkMuted },
  accent:  { bg: colors.accentDim,        color: colors.accentHover },
};

export function Badge({ label, variant }: BadgeProps) {
  const { bg, color } = variantStyles[variant];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        borderRadius: `${radius.pill}px`,
        px: 1,
        py: '2px',
        fontSize: 12,
        fontWeight: 500,
        background: bg,
        color,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Box>
  );
}
