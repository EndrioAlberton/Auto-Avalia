import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { PageHeader } from '../../components/ui/layout/PageHeader';
import { StatCard } from '../../components/ui/data-display/StatCard';
import { ContentCard } from '../../components/ui/data-display/ContentCard';
import { ProgressBar } from '../../components/ui/data-display/ProgressBar';
import { Badge } from '../../components/ui/primitives/Badge';
import { useSecretariaData } from './hooks/useSecretariaData';
import { DomainBarChart } from '../analytics/charts/DomainBarChart';
import { DOMAINS } from '../../data/questionnaireData';
import { colors } from '../../components/ui/tokens';

export function InicioPage() {
  const navigate = useNavigate();
  const { loading, schools, allUsers, schoolsWithStats, totalTeachers, totalResponded } = useSecretariaData();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress sx={{ color: colors.accent }} />
      </Box>
    );
  }

  const schoolsWithScore = schoolsWithStats.filter((s) => s.avgScore > 0);
  const avgScoreGeral =
    schoolsWithScore.length > 0
      ? (schoolsWithScore.reduce((sum, s) => sum + s.avgScore, 0) / schoolsWithScore.length).toFixed(1)
      : '—';

  const domainBarData = DOMAINS.map((d) => {
    const vals = schoolsWithScore
      .map((s) => s.avgScores.find((a) => a.domain === d.key)?.score)
      .filter((v): v is number => !!v && v > 0);
    return {
      domain: d.key,
      label: d.label,
      score: vals.length > 0 ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : 0,
    };
  });

  const menorColeta = [...schoolsWithStats]
    .sort((a, b) => a.responseRate - b.responseRate)
    .slice(0, 5);

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
          <StatCard label="Respostas coletadas" value={totalResponded} sub={`de ${totalTeachers} professores`} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Pontuação média" value={avgScoreGeral} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ContentCard title="Domínios da rede">
            {schoolsWithScore.length === 0 ? (
              <Box sx={{ color: colors.inkSubtle, fontSize: 14, textAlign: 'center', py: 4 }}>
                Dados insuficientes para exibir gráfico.
              </Box>
            ) : (
              <DomainBarChart data={domainBarData} keys={['score']} keyLabels={{ score: 'Pontuação média' }} />
            )}
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
            {menorColeta.length === 0 ? (
              <Box sx={{ color: colors.inkSubtle, fontSize: 14 }}>Nenhuma escola cadastrada.</Box>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {menorColeta.map((s) => (
                  <Box key={s.id}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography sx={{ fontSize: 13, color: colors.inkMuted }}>{s.name}</Typography>
                      <Badge label={`${s.responseRate}%`} variant="neutral" />
                    </Box>
                    <ProgressBar value={s.responseRate} />
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
