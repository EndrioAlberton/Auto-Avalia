import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { PageHeader } from '../../components/ui/layout/PageHeader';
import { ContentCard } from '../../components/ui/data-display/ContentCard';
import { StatCard } from '../../components/ui/data-display/StatCard';
import { EmptyState } from '../../components/ui/data-display/EmptyState';
import { DataTable } from '../../components/ui/data-display/DataTable';
import { Badge } from '../../components/ui/primitives/Badge';
import { DomainRadarChart } from '../analytics/charts/DomainRadarChart';
import { DomainBarChart } from '../analytics/charts/DomainBarChart';
import { EvolutionLineChart } from '../analytics/charts/EvolutionLineChart';
import { useProfessorData } from './hooks/useProfessorData';
import { DOMAINS } from '../../data/questionnaireData';
import { formatFirestoreDate } from '../../services/analyticsService';
import { colors } from '../../components/ui/tokens';

export function RelatoriosPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const { loading, myResponses, hasResponded, myScores, schoolScores, evolutionData, strengths, improvements } =
    useProfessorData();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress sx={{ color: colors.accent }} />
      </Box>
    );
  }

  if (!hasResponded) {
    return (
      <Box>
        <PageHeader eyebrow="Professor" title="Relatórios" />
        <EmptyState
          icon={<AssessmentIcon />}
          title="Nenhuma avaliação encontrada"
          body="Responda o questionário para visualizar seus resultados."
          action={{ label: 'Ir para questionário', onClick: () => navigate('/app/professor/questionario') }}
        />
      </Box>
    );
  }

  const comparisonData = DOMAINS.map((d) => ({
    domain: d.key,
    label: d.label,
    minha: myScores.find((s) => s.domain === d.key)?.score ?? 0,
    ...(schoolScores ? { escola: schoolScores.find((s) => s.domain === d.key)?.score ?? 0 } : {}),
  }));

  const evolutionDomains = DOMAINS.map((d) => d.label);

  return (
    <Box>
      <PageHeader eyebrow="Professor" title="Relatórios" />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: `1px solid ${colors.hairline}` }}>
        <Tab label="Perfil" />
        <Tab label="Comparação" />
        <Tab label="Evolução" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Grid container spacing={2} mb={3} alignItems="stretch">
            {myScores.map((d) => (
              <Grid key={d.domain} size={{ xs: 6, sm: 4, md: 'auto' }} sx={{ display: 'flex' }}>
                <StatCard label={d.label} value={d.score.toFixed(1)} />
              </Grid>
            ))}
          </Grid>

          <ContentCard title="Meu Perfil por Domínio">
            <DomainRadarChart myData={myScores} schoolData={schoolScores ?? undefined} />
          </ContentCard>

          <Grid container spacing={2} mt={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ContentCard title="Pontos Fortes">
                {strengths.length > 0 ? (
                  <Box display="flex" flexDirection="column" gap={1}>
                    {strengths.map((s) => (
                      <Box key={s} display="flex" alignItems="center" gap={1}>
                        <Badge label={s} variant="success" />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ color: colors.inkSubtle, fontSize: 14 }}>Nenhum ponto forte identificado ainda.</Box>
                )}
              </ContentCard>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ContentCard title="A Desenvolver">
                {improvements.length > 0 ? (
                  <Box display="flex" flexDirection="column" gap={1}>
                    {improvements.map((s) => (
                      <Box key={s} display="flex" alignItems="center" gap={1}>
                        <Badge label={s} variant="warning" />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ color: colors.inkSubtle, fontSize: 14 }}>Sem áreas críticas identificadas.</Box>
                )}
              </ContentCard>
            </Grid>
          </Grid>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          {!schoolScores ? (
            <EmptyState
              icon={<AssessmentIcon />}
              title="Aguardando mais respostas da escola"
              body="A comparação ficará disponível quando outros professores responderem o questionário."
            />
          ) : (
            <>
              <ContentCard title="Minha pontuação vs Escola">
                <DomainBarChart
                  data={comparisonData}
                  keys={['minha', 'escola']}
                  keyLabels={{ minha: 'Minha avaliação', escola: 'Média da escola' }}
                />
              </ContentCard>
              <Box mt={2}>
                <ContentCard title="Detalhamento por domínio" noPadding>
                  <DataTable
                    columns={[
                      { key: 'domain', header: 'Domínio', render: (r: typeof comparisonData[0]) => r.label },
                      { key: 'minha', header: 'Minha pontuação', render: (r) => (r.minha as number).toFixed(1), align: 'center' },
                      { key: 'escola', header: 'Média escola', render: (r) => ((r as any).escola as number)?.toFixed(1) ?? '—', align: 'center' },
                      {
                        key: 'diff',
                        header: 'Diferença',
                        align: 'center',
                        render: (r) => {
                          const diff = r.minha - ((r as any).escola ?? r.minha);
                          const label = diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
                          return <Badge label={label} variant={diff >= 0 ? 'success' : 'warning'} />;
                        },
                      },
                    ]}
                    rows={comparisonData}
                  />
                </ContentCard>
              </Box>
            </>
          )}
        </Box>
      )}

      {tab === 2 && (
        <Box>
          <ContentCard title="Evolução ao longo do tempo">
            <EvolutionLineChart data={evolutionData} domains={evolutionDomains} />
          </ContentCard>
          {myResponses.length >= 2 && (
            <Box mt={2}>
              <ContentCard title="Histórico de avaliações" noPadding>
                <DataTable
                  columns={[
                    { key: 'date', header: 'Data', render: (r: any) => formatFirestoreDate(r.completedAt) },
                    {
                      key: 'score',
                      header: 'Pontuação geral',
                      align: 'center',
                      render: (r: any) => {
                        const map: Record<string, number> = {};
                        for (const a of r.answers) map[a.questionId] = Number(a.value);
                        const s = map;
                        const vals = Object.values(s).filter((v) => v > 0);
                        const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
                        return avg;
                      },
                    },
                  ]}
                  rows={myResponses}
                />
              </ContentCard>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
