import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { colors, radius } from '../../../components/tokens';

export function CompletionPage() {
  const navigate = useNavigate();

  const handleRestart = () => {
    sessionStorage.removeItem('student_school_id');
    navigate('/estudante/escola');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: colors.canvas,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          background: colors.surface1,
          border: `1px solid ${colors.hairline}`,
          borderRadius: `${radius.xl}px`,
          p: 4,
          textAlign: 'center',
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 56, color: colors.success, mb: 2 }} />
        <Typography sx={{ fontSize: 24, fontWeight: 600, color: colors.ink, mb: 1, letterSpacing: '-0.4px' }}>
          Obrigado pela sua participação!
        </Typography>
        <Typography sx={{ fontSize: 15, color: colors.inkMuted, mb: 3, lineHeight: 1.5 }}>
          Suas respostas ajudam a melhorar a qualidade do ensino.
        </Typography>
        <Button variant="outlined" onClick={handleRestart} sx={{ color: colors.inkMuted, borderColor: colors.hairline }}>
          Responder novamente
        </Button>
      </Box>
    </Box>
  );
}
