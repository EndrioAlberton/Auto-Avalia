import { useMemo, useState } from 'react';
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
import { MultiSelectFilter } from '../../components/ui/primitives/MultiSelectFilter';
import { DomainBarChart } from '../analytics/charts/DomainBarChart';
import { useSecretariaData } from './hooks/useSecretariaData';
import { DOMAINS } from '../../data/questionnaireData';
import { colors } from '../../components/ui/tokens';

export function RelatoriosPage() {
  const [tab, setTab] = useState(0);
  const { loading, schoolsWithStats, disciplineStats, totalTeachers, totalResponded } = useSecretariaData();

  const disciplineOptions = useMemo(
    () => disciplineStats.map((d) => ({ value: d.subject, label: d.label })),
    [disciplineStats],
  );
  const [selectedSubjects, setSelectedSubjects] = useState<string[] | null>(null);
  const activeSubjects = selectedSubjects ?? disciplineOptions.map((o) => o.value);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress sx={{ color: colors.accent }} />
      </Box>
    );
  }

  const totalEscolas = schoolsWithStats.length;
  const taxaGeral =
    totalTeachers > 0 ? Math.round((totalResponded / totalTeachers) * 100) : 0;

  const schoolBarData = schoolsWithStats.map((s) => ({
    domain: s.id,
    label: s.name.length > 20 ? s.name.slice(0, 20) + '…' : s.name,
    taxa: s.responseRate,
    score: s.avgScore,
  }));

  // ── Dados por disciplina (filtrados) ──────────────────────────────────────
  const disciplineRows = disciplineStats
    .filter((d) => activeSubjects.includes(d.subject))
    .map((d) => {
      const entry: Record<string, any> = { subject: d.subject, label: d.label, total: d.total };
      for (const { domain, score } of d.domainScores) entry[domain] = score;
      return entry;
    });

  const disciplineBarData = disciplineRows.map((r) => ({
    domain: r.subject,
    label: r.label.length > 22 ? r.label.slice(0, 22) + '…' : r.label,
    ...Object.fromEntries(DOMAINS.map((d) => [d.key, r[d.key] ?? 0])),
  }));

  return (
    <Box>
      <PageHeader eyebrow="Secretaria" title="Relatórios da Rede" />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: `1px solid ${colors.hairline}` }}>
        <Tab label="Rede" />
        <Tab label="Por Escola" />
        <Tab label="Por Disciplina" />
      </Tabs>

      {/* ── Rede ── */}
      {tab === 0 && (
        <Box>
          {totalTeachers === 0 ? (
            <EmptyState
              icon={<BarChartIcon />}
              title="Dados insuficientes"
              body="Os relatórios da rede aparecerão quando professores responderem o questionário."
            />
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" gap={2} flexWrap="wrap">
                {[
                  { label: 'Escolas', value: totalEscolas },
                  { label: 'Professores', value: totalTeachers },
                  { label: 'Responderam', value: totalResponded },
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
                header: 'Responderam',
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

      {/* ── Por Disciplina ── */}
      {tab === 2 && (
        <Box>
          {disciplineStats.length === 0 ? (
            <EmptyState
              icon={<BarChartIcon />}
              title="Sem dados por disciplina"
              body="Os professores precisam preencher suas disciplinas de atuação no perfil para que este relatório seja gerado."
            />
          ) : (
            <>
              <ContentCard
                title="Pontuação por disciplina"
                action={
                  <MultiSelectFilter
                    label="Disciplinas"
                    options={disciplineOptions}
                    value={activeSubjects}
                    onChange={setSelectedSubjects}
                  />
                }
              >
                <DomainBarChart
                  data={disciplineBarData}
                  keys={DOMAINS.map((d) => d.key)}
                  keyLabels={Object.fromEntries(DOMAINS.map((d) => [d.key, d.label]))}
                />
              </ContentCard>
              <Box mt={2}>
                <ContentCard title="Detalhamento por disciplina" noPadding>
                  <DataTable
                    columns={[
                      { key: 'label', header: 'Disciplina', render: (r: any) => r.label },
                      { key: 'total', header: 'Professores', render: (r: any) => r.total, align: 'center' },
                      ...DOMAINS.map((d) => ({
                        key: d.key,
                        header: d.label,
                        align: 'center' as const,
                        render: (r: any) => r[d.key] ? Number(r[d.key]).toFixed(1) : '—',
                      })),
                    ]}
                    rows={disciplineRows}
                  />
                </ContentCard>
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
