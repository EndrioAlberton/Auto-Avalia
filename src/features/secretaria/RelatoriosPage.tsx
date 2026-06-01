import { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import BarChartIcon from '@mui/icons-material/BarChart';
import { PageHeader } from '../../components/ui/layout/PageHeader';
import { ContentCard } from '../../components/ui/data-display/ContentCard';
import { EmptyState } from '../../components/ui/data-display/EmptyState';
import { DataTable } from '../../components/ui/data-display/DataTable';
import { Badge } from '../../components/ui/primitives/Badge';
import { DomainBarChart } from '../analytics/charts/DomainBarChart';
import { useSecretariaData } from './hooks/useSecretariaData';
import { DOMAINS } from '../../data/questionnaireData';
import { formatFirestoreDate } from '../../services/analyticsService';
import { colors } from '../../components/ui/tokens';

export function RelatoriosPage() {
  const [tab, setTab] = useState(0);
  const { loading, schoolsWithStats, teachersWithScores } = useSecretariaData();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress sx={{ color: colors.accent }} />
      </Box>
    );
  }

  const totalRespondidos = teachersWithScores.filter((t) => t.hasResponded).length;
  const totalProfessores = teachersWithScores.length;
  const totalEscolas = schoolsWithStats.length;
  const taxaGeral =
    totalProfessores > 0 ? Math.round((totalRespondidos / totalProfessores) * 100) : 0;

  // Dados para o gráfico de escolas
  const schoolBarData = schoolsWithStats.map((s) => ({
    domain: s.id,
    label: s.name.length > 20 ? s.name.slice(0, 20) + '…' : s.name,
    taxa: s.responseRate,
    score: s.avgScore,
  }));

  return (
    <Box>
      <PageHeader eyebrow="Secretaria" title="Relatórios da Rede" />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: `1px solid ${colors.hairline}` }}>
        <Tab label="Rede" />
        <Tab label="Por Escola" />
        <Tab label="Por Professor" />
      </Tabs>

      {/* ── Rede ── */}
      {tab === 0 && (
        <Box>
          {totalProfessores === 0 ? (
            <EmptyState
              icon={<BarChartIcon />}
              title="Dados insuficientes"
              body="Os relatórios da rede aparecerão quando professores responderem o questionário."
            />
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {/* KPIs da rede */}
              <Box display="flex" gap={2} flexWrap="wrap">
                {[
                  { label: 'Escolas', value: totalEscolas },
                  { label: 'Professores', value: totalProfessores },
                  { label: 'Responderam', value: totalRespondidos },
                  { label: 'Taxa de resposta', value: `${taxaGeral}%` },
                ].map((kpi) => (
                  <Box
                    key={kpi.label}
                    sx={{
                      flex: '1 1 140px',
                      background: colors.surface2,
                      border: `1px solid ${colors.hairline}`,
                      borderRadius: 2,
                      p: 2,
                      textAlign: 'center',
                    }}
                  >
                    <Box sx={{ fontSize: 28, fontWeight: 700, color: colors.ink }}>{kpi.value}</Box>
                    <Box sx={{ fontSize: 13, color: colors.inkSubtle, mt: 0.5 }}>{kpi.label}</Box>
                  </Box>
                ))}
              </Box>

              {/* Escolas por taxa de resposta */}
              {schoolsWithStats.length > 0 && (
                <ContentCard title="Taxa de resposta por escola">
                  <DomainBarChart
                    data={schoolBarData}
                    keys={['taxa']}
                    keyLabels={{ taxa: 'Taxa de resposta (%)' }}
                  />
                </ContentCard>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* ── Por Escola ── */}
      {tab === 1 && (
        <ContentCard title="Pontuação por escola" noPadding>
          <DataTable
            columns={[
              { key: 'name', header: 'Escola', render: (r: any) => r.name },
              {
                key: 'teachers',
                header: 'Professores',
                align: 'center' as const,
                render: (r: any) => `${r.respondedCount}/${r.teachersCount}`,
              },
              {
                key: 'responseRate',
                header: 'Taxa',
                align: 'center' as const,
                render: (r: any) => (
                  <Badge
                    label={`${r.responseRate}%`}
                    variant={r.responseRate >= 70 ? 'success' : r.responseRate >= 40 ? 'warning' : 'neutral'}
                  />
                ),
              },
              ...DOMAINS.map((d) => ({
                key: d.key,
                header: d.label,
                align: 'center' as const,
                render: (r: any) => {
                  const score = r.avgScores?.find((s: any) => s.domain === d.key)?.score;
                  return score > 0 ? score.toFixed(1) : '—';
                },
              })),
              {
                key: 'avgScore',
                header: 'Geral',
                align: 'center' as const,
                render: (r: any) =>
                  r.avgScore > 0 ? (
                    <strong style={{ color: colors.accent }}>{r.avgScore.toFixed(1)}</strong>
                  ) : (
                    '—'
                  ),
              },
            ]}
            rows={schoolsWithStats}
            loading={loading}
          />
        </ContentCard>
      )}

      {/* ── Por Professor ── */}
      {tab === 2 && (
        <ContentCard title="Avaliação individual — toda a rede" noPadding>
          {teachersWithScores.length === 0 ? (
            <EmptyState
              icon={<BarChartIcon />}
              title="Nenhum professor encontrado"
              body="Adicione professores às escolas para visualizar as avaliações."
            />
          ) : (
            <DataTable
              columns={[
                { key: 'name', header: 'Professor', render: (r: any) => r.displayName },
                { key: 'school', header: 'Escola', render: (r: any) => r.schoolName },
                ...DOMAINS.map((d) => ({
                  key: d.key,
                  header: d.label,
                  align: 'center' as const,
                  render: (r: any) => {
                    if (!r.hasResponded) return <span style={{ color: colors.inkSubtle }}>—</span>;
                    const score = r.scores?.find((s: any) => s.domain === d.key)?.score ?? 0;
                    return score > 0 ? score.toFixed(1) : '—';
                  },
                })),
                {
                  key: 'overall',
                  header: 'Geral',
                  align: 'center' as const,
                  render: (r: any) =>
                    r.hasResponded ? (
                      <strong style={{ color: colors.accent }}>{r.overall.toFixed(1)}</strong>
                    ) : (
                      <span style={{ color: colors.inkSubtle }}>—</span>
                    ),
                },
                {
                  key: 'data',
                  header: 'Data',
                  align: 'center' as const,
                  render: (r: any) =>
                    r.completedAt ? formatFirestoreDate(r.completedAt) : '—',
                },
                {
                  key: 'status',
                  header: 'Status',
                  align: 'center' as const,
                  render: (r: any) => (
                    <Badge
                      label={r.hasResponded ? 'Respondeu' : 'Pendente'}
                      variant={r.hasResponded ? 'success' : 'neutral'}
                    />
                  ),
                },
              ]}
              rows={teachersWithScores}
            />
          )}
        </ContentCard>
      )}

    </Box>
  );
}
