import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatCard } from '../../components/data-display/StatCard';
import { ContentCard } from '../../components/data-display/ContentCard';
import { ProgressBar } from '../../components/data-display/ProgressBar';
import { Badge } from '../../components/primitives/Badge';
import { useSecretariaData } from './hooks/useSecretariaData';
import { colors } from '../../components/tokens';

export function InicioPage() {
  const navigate = useNavigate();
  const { loading, schools, allUsers } = useSecretariaData();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress sx={{ color: colors.accent }} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader eyebrow="Secretaria" title="Visão da Rede" />

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Escolas ativas" value={schools.length} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Usuários totais" value={allUsers.length} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Respostas coletadas" value="—" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Pontuação média" value="—" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ContentCard title="Domínios da rede">
            <Box sx={{ color: colors.inkSubtle, fontSize: 14, textAlign: 'center', py: 4 }}>
              Dados insuficientes para exibir gráfico.
            </Box>
          </ContentCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <ContentCard
            title="Escolas com menor coleta"
            action={
              <Button size="small" onClick={() => navigate('/app/secretaria/escolas')} sx={{ fontSize: 12 }}>
                Ver todas →
              </Button>
            }
          >
            {schools.slice(0, 5).length === 0 ? (
              <Box sx={{ color: colors.inkSubtle, fontSize: 14 }}>Nenhuma escola cadastrada.</Box>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {schools.slice(0, 5).map((s) => (
                  <Box key={s.id}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography sx={{ fontSize: 13, color: colors.inkMuted }}>{s.name}</Typography>
                      <Badge label="0%" variant="neutral" />
                    </Box>
                    <ProgressBar value={0} />
                  </Box>
                ))}
              </Box>
            )}
          </ContentCard>
        </Grid>
      </Grid>
    </Box>
  );
}
