import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { getAllSchools } from '../../../services/firestoreService';
import { School } from '../../../types';
import { colors, radius } from '../../../components/tokens';

export function SchoolSelectPage() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    getAllSchools()
      .then(setSchools)
      .catch(() => setSchools([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStart = () => {
    if (!selected) return;
    sessionStorage.setItem('student_school_id', selected);
    navigate('/estudante/quiz');
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
      <Box sx={{ width: '100%', maxWidth: 480 }}>
        <Typography
          sx={{
            fontSize: 28,
            fontWeight: 700,
            color: colors.accent,
            textAlign: 'center',
            mb: 3,
            letterSpacing: '-0.6px',
          }}
        >
          Autoavalia
        </Typography>

        <Box
          sx={{
            background: colors.surface1,
            border: `1px solid ${colors.hairline}`,
            borderRadius: `${radius.xl}px`,
            p: 4,
          }}
        >
          <Typography sx={{ fontSize: 24, fontWeight: 600, color: colors.ink, mb: 1 }}>
            Bem-vindo(a)!
          </Typography>
          <Typography sx={{ fontSize: 16, color: colors.inkMuted, mb: 3 }}>
            Antes de começar, nos diga em qual escola você estuda.
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress sx={{ color: colors.accent }} />
            </Box>
          ) : (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Selecione sua escola</InputLabel>
              <Select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                label="Selecione sua escola"
              >
                {schools.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={!selected}
            onClick={handleStart}
            sx={{ mb: 2 }}
          >
            Começar
          </Button>

          <Typography sx={{ fontSize: 12, color: colors.inkSubtle, textAlign: 'center' }}>
            Suas respostas são anônimas.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
