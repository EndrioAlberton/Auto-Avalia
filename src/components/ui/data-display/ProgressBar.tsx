import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { colors, radius, motion } from '../tokens';

interface ProgressBarProps {
  value: number;
  label?: string;
  showValue?: boolean;
}

export function ProgressBar({ value, label, showValue }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <Box>
      {(label || showValue) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
          {label && (
            <Typography sx={{ fontSize: 14, color: colors.inkMuted }}>{label}</Typography>
          )}
          {showValue && (
            <Typography sx={{ fontSize: 12, color: colors.inkSubtle }}>{clamped}%</Typography>
          )}
        </Box>
      )}
      <Box
        sx={{
          height: 6,
          background: colors.surface2,
          borderRadius: `${radius.pill}px`,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${clamped}%`,
            background: colors.accent,
            borderRadius: `${radius.pill}px`,
            transition: `width ${motion.slow} ease`,
          }}
        />
      </Box>
    </Box>
  );
}
