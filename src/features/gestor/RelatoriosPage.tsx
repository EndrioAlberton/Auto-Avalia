import { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import { PageHeader } from '../../components/ui/layout/PageHeader';
import { ContentCard } from '../../components/ui/data-display/ContentCard';
import { StatCard } from '../../components/ui/data-display/StatCard';
import { EmptyState } from '../../components/ui/data-display/EmptyState';
import { DataTable } from '../../components/ui/data-display/DataTable';
import { Badge } from '../../components/ui/primitives/Badge';
import { DomainRadarChart } from '../analytics/charts/DomainRadarChart';
import { DomainBarChart } from '../analytics/charts/DomainBarChart';
import { useGestorData } from './hooks/useGestorData';
import { DOMAINS } from '../../data/questionnaireData';
import { answersToScores, overallScore, groupBySegment, formatFirestoreDate, studentResponsesToAvgScores, studentOverallAvg } from '../../services/analyticsService';
import { colors } from '../../components/ui/tokens';
import Grid from '@mui/material/Grid2';

export function RelatoriosPage() {
  const [tab, setTab] = useState(0);
  const { loading, school, teachers, schoolResponses, schoolScores, studentResponses } = useGestorData();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress sx={{ color: colors.accent }} />
      </Box>
    );
  }

  const hasData = schoolResponses.length > 0;

  const studentAvgs = studentResponsesToAvgScores(studentResponses);
  const studentAvgOverall = studentOverallAvg(studentAvgs);
  const studentBarData = studentAvgs.map((q) => ({
    domain: q.questionId,
    label: `${q.emoji} ${q.questionId.toUpperCase()}`,
    nota: q.avg,
  }));
  const studentTooltipMap = Object.fromEntries(
    studentAvgs.map((q) => [`${q.emoji} ${q.questionId.toUpperCase()}`, `${q.emoji} ${q.text}`])
  );

  const barData = DOMAINS.map((d) => ({
    domain: d.key,
    label: d.label,
    escola: schoolScores?.find((s) => s.domain === d.key)?.score ?? 0,
  }));

  const segmentData = groupBySegment(schoolResponses).map((sg) => ({
    domain: sg.segment,
    label: sg.segment,
    ...Object.fromEntries(DOMAINS.map((d) => [d.key, sg[d.key] ?? 0])),
  }));

  // Dados por professor
  const byTeacher = new Map<string, any[]>();
  for (const r of schoolResponses) {
    if (!r.userId) continue;
    if (!byTeacher.has(r.userId)) byTeacher.set(r.userId, []);
    byTeacher.get(r.userId)!.push(r);
  }

  const teacherRows = teachers.map((teacher) => {
    const responses = byTeacher.get(teacher.uid) ?? [];
    const latest = responses.sort((a: any, b: any) => {
      return ((b.completedAt as any)?.seconds ?? 0) - ((a.completedAt as any)?.seconds ?? 0);
    })[0];

    if (!latest) return { teacher, hasResponded: false, scores: null, overall: 0, completedAt: null };

    const map: Record<string, number> = {};
    for (const a of latest.answers) map[a.questionId] = Number(a.value);
    const scores = answersToScores(map);
    return { teacher, hasResponded: true, scores, overall: overallScore(scores), completedAt: latest.completedAt };
  });

  return (
    <Box>
      <PageHeader eyebrow={school?.name ?? 'Gestor'} title="Relatórios da Escola" />

      {!hasData ? (
        <EmptyState
          icon={<BarChartIcon />}
          title="Aguardando respostas"
          body="Os relatórios aparecerão quando professores responderem o questionário."
        />
      ) : (
        <>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: `1px solid ${colors.hairline}` }}>
            <Tab label="Coletivo" />
            <Tab label="Por Segmento" />
            <Tab label="Por Professor" />
            <Tab label="Por Estudante" />
          </Tabs>

          {tab === 0 && (
            <Box display="flex" flexDirection="column" gap={2}>
              <ContentCard title="Perfil coletivo da escola">
                <DomainRadarChart myData={schoolScores ?? []} />
              </ContentCard>
              <ContentCard title="Pontuação por domínio">
                <DomainBarChart data={barData} keys={['escola']} keyLabels={{ escola: 'Média da escola' }} />
              </ContentCard>
            </Box>
          )}

          {tab === 1 && (
            <Box>
              <ContentCard title="Pontuação por segmento">
                <DomainBarChart
                  data={segmentData}
                  keys={DOMAINS.map((d) => d.key)}
                  keyLabels={Object.fromEntries(DOMAINS.map((d) => [d.key, d.label]))}
                />
              </ContentCard>
              <Box mt={2}>
                <ContentCard title="Detalhamento por segmento" noPadding>
                  <DataTable
                    columns={[
                      { key: 'segment', header: 'Segmento', render: (r: any) => r.segment },
                      { key: 'total', header: 'Respostas', render: (r: any) => r.total, align: 'center' },
                      ...DOMAINS.map((d) => ({
                        key: d.key,
                        header: d.label,
                        align: 'center' as const,
                        render: (r: any) => r[d.key] ? Number(r[d.key]).toFixed(1) : '—',
                      })),
                    ]}
                    rows={groupBySegment(schoolResponses)}
                  />
                </ContentCard>
              </Box>
            </Box>
          )}

          {tab === 3 && (
            <Box>
              {studentResponses.length === 0 ? (
                <EmptyState
                  icon={<PeopleIcon />}
                  title="Sem respostas de estudantes"
                  body="Os dados aparecerão quando estudantes responderem o questionário desta escola."
                />
              ) : (
                <Box display="flex" flexDirection="column" gap={2}>
                  <Grid container spacing={2} alignItems="stretch">
                    <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex' }}>
                      <StatCard label="Respostas coletadas" value={studentResponses.length} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex' }}>
                      <StatCard label="Média geral de satisfação" value={`${studentAvgOverall}/5`} sub="de 1 a 5" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex' }}>
                      <StatCard
                        label="Questão mais bem avaliada"
                        value={studentAvgs.filter((a) => a.count > 0).sort((a, b) => b.avg - a.avg)[0]?.emoji ?? '—'}
                        sub={studentAvgs.filter((a) => a.count > 0).sort((a, b) => b.avg - a.avg)[0]?.questionId.toUpperCase()}
                      />
                    </Grid>
                  </Grid>

                  <ContentCard title="Média por questão">
                    <DomainBarChart
                      data={studentBarData}
                      keys={['nota']}
                      keyLabels={{ nota: 'Média (1–5)' }}
                      tooltipLabelMap={studentTooltipMap}
                    />
                  </ContentCard>

                  <ContentCard title="Detalhamento por questão" noPadding>
                    <DataTable
                      columns={[
                        { key: 'q', header: 'Questão', render: (r: any) => `${r.emoji} ${r.text}` },
                        {
                          key: 'avg',
                          header: 'Média',
                          align: 'center' as const,
                          render: (r: any) => r.count > 0 ? (
                            <Badge
                              label={r.avg.toFixed(1)}
                              variant={r.avg >= 4 ? 'success' : r.avg >= 3 ? 'warning' : 'error'}
                            />
                          ) : '—',
                        },
                        {
                          key: 'count',
                          header: 'Respostas',
                          align: 'center' as const,
                          render: (r: any) => r.count,
                        },
                      ]}
                      rows={studentAvgs}
                    />
                  </ContentCard>
                </Box>
              )}
            </Box>
          )}

          {tab === 2 && (
            <ContentCard title="Avaliação individual dos professores" noPadding>
              <DataTable
                columns={[
                  {
                    key: 'nome',
                    header: 'Professor',
                    render: (r: any) => r.teacher.displayName,
                  },
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
                    header: 'Última resposta',
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
                rows={teacherRows}
              />
            </ContentCard>
          )}
        </>
      )}
    </Box>
  );
}
