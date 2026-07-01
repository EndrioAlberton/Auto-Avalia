import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiSkeleton from '@mui/material/Skeleton';
import { colors, radius, motion } from '../tokens';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  loading?: boolean;
  accent?: string;
  scoreMax?: number;
}

export function StatCard({ label, value, sub, loading, accent, scoreMax }: StatCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
  const showBar = accent && scoreMax && !isNaN(numericValue);
  const pct = showBar ? Math.min(100, (numericValue / scoreMax) * 100) : 0;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        background: colors.surface1,
        border: `1px solid ${colors.hairline}`,
        borderTop: accent ? `3px solid ${accent}` : `1px solid ${colors.hairline}`,
        borderRadius: `${radius.lg}px`,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: `background ${motion.fast} ease`,
        '&:hover': { background: colors.surface2 },
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: accent ?? colors.inkSubtle,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          mb: 1.5,
          lineHeight: 1.3,
        }}
      >
        {label}
      </Typography>

      <Box>
        {loading ? (
          <MuiSkeleton variant="text" width={80} height={36} sx={{ bgcolor: colors.surface2 }} />
        ) : (
          <Typography
            sx={{
              fontSize: String(value).length > 10 ? 18 : 32,
              fontWeight: 700,
              color: colors.ink,
              letterSpacing: '-0.8px',
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
        )}

        {showBar && !loading && (
          <Box sx={{ mt: 1.5, height: 3, borderRadius: 9999, background: colors.hairline, overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: `${pct}%`,
                background: accent,
                borderRadius: 9999,
                transition: `width 600ms ${motion.easing}`,
              }}
            />
          </Box>
        )}

        {sub && !loading && (
          <Typography sx={{ fontSize: 12, color: colors.inkSubtle, mt: 0.5 }}>
            {sub}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
