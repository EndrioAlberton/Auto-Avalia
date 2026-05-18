import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiSkeleton from '@mui/material/Skeleton';
import { colors, radius, motion } from '../tokens';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  loading?: boolean;
}

export function StatCard({ label, value, sub, loading }: StatCardProps) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        background: colors.surface1,
        border: `1px solid ${colors.hairline}`,
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
          fontSize: 13,
          fontWeight: 500,
          color: colors.inkSubtle,
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
          mb: 1,
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
              fontSize: String(value).length > 10 ? 18 : 28,
              fontWeight: 600,
              color: colors.ink,
              letterSpacing: '-0.4px',
              lineHeight: 1.2,
              wordBreak: 'break-word',
            }}
          >
            {value}
          </Typography>
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
