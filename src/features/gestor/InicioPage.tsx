import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import { PageHeader } from '../../components/ui/layout/PageHeader';
import { StatCard } from '../../components/ui/data-display/StatCard';
import { ContentCard } from '../../components/ui/data-display/ContentCard';
import { ActionCard } from '../../components/ui/data-display/ActionCard';
import { ProgressBar } from '../../components/ui/data-display/ProgressBar';
import { DomainBarChart } from '../analytics/charts/DomainBarChart';
import { useGestorData } from './hooks/useGestorData';
import { DOMAINS } from '../../data/questionnaireData';
import { colors } from '../../components/ui/tokens';
import Button from '@mui/material/Button';

export function InicioPage() {
  const navigate = useNavigate();
  const { loading, school, hasSchool, teachers, schoolResponses, schoolScores, responseRate } = useGestorData();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress sx={{ color: colors.accent }} />
      </Box>
    );
  }

  const respondedCount = new Set(schoolResponses.map((r: any) => r.userId)).size;

  const barData = schoolScores
    ? DOMAINS.map((d) => ({
        domain: d.key,
        label: d.label,
        escola: schoolScores.find((s) => s.domain === d.key)?.score ?? 0,
      }))
    : [];

  return (
    <Box>
      <PageHeader eyebrow={school?.name ?? 'Gestor'} title="Início" />

      {!hasSchool && (
        <ActionCard
          title="Configure sua escola para começar"
          body="Adicione as informações da escola para convidar professores e acompanhar os resultados."
          action={{ label: 'Configurar escola', onClick: () => navigate('/app/gestor/escola') }}
        />
      )}

      {hasSchool && (
        <>
          <Grid container spacing={2} mb={3} alignItems="stretch">
            <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex' }}>
              <StatCard label="Professores na equipe" value={teachers.length} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex' }}>
              <StatCard label="Taxa de resposta" value={`${responseRate}%`} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex' }}>
              <StatCard
                label="Pontuação média"
                value={
                  schoolScores
                    ? (schoolScores.reduce((s, d) => s + d.score, 0) / schoolScores.filter((d) => d.score > 0).length || 0).toFixed(1)
                    : '—'
                }
              />
            </Grid>
          </Grid>

          <ContentCard
            title="Progresso de coleta"
            action={
              <Button size="small" onClick={() => navigate('/app/gestor/equipe')} sx={{ fontSize: 13 }}>
                Ver equipe completa →
              </Button>
            }
          >
            <ProgressBar value={responseRate} label={`${respondedCount} de ${teachers.length} professores responderam`} showValue />
          </ContentCard>

          {schoolScores && (
            <Box mt={2}>
              <ContentCard title="Domínios da escola">
                <DomainBarChart data={barData} keys={['escola']} keyLabels={{ escola: 'Média da escola' }} />
              </ContentCard>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
