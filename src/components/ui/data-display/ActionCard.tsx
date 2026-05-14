import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { colors, radius } from '../tokens';

interface ActionCardProps {
  eyebrow?: string;
  title: string;
  body?: string;
  action: { label: string; onClick: () => void };
  onDismiss?: () => void;
}

export function ActionCard({ eyebrow, title, body, action, onDismiss }: ActionCardProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        background: colors.surface2,
        border: `1px solid ${colors.hairlineStrong}`,
        borderRadius: `${radius.lg}px`,
        p: 2.5,
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
      }}
    >
      {onDismiss && (
        <IconButton
          size="small"
          onClick={onDismiss}
          sx={{ position: 'absolute', top: 8, right: 8, color: colors.inkSubtle }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}

      <Box sx={{ flex: 1, pr: onDismiss ? 3 : 0 }}>
        {eyebrow && (
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.inkSubtle, textTransform: 'uppercase', letterSpacing: '0.4px', mb: 0.5 }}>
            {eyebrow}
          </Typography>
        )}
        <Typography sx={{ fontSize: 18, fontWeight: 500, color: colors.ink, lineHeight: 1.3 }}>
          {title}
        </Typography>
        {body && (
          <Typography sx={{ fontSize: 14, color: colors.inkMuted, mt: 0.5 }}>
            {body}
          </Typography>
        )}
      </Box>

      <Button
        variant="contained"
        onClick={action.onClick}
        sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
      >
        {action.label}
      </Button>
    </Box>
  );
}
