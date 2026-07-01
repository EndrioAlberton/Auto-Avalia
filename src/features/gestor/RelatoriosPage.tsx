import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import { PageHeader } from '../../components/ui/layout/PageHeader';
import { ContentCard } from '../../components/ui/data-display/ContentCard';
import { EmptyState } from '../../components/ui/data-display/EmptyState';
import { DataTable } from '../../components/ui/data-display/DataTable';
import { MultiSelectFilter } from '../../components/ui/primitives/MultiSelectFilter';
import { DomainRadarChart } from '../analytics/charts/DomainRadarChart';
import { DomainBarChart } from '../analytics/charts/DomainBarChart';
import { useGestorData } from './hooks/useGestorData';
import { DOMAINS, KNOWLEDGE_AREAS, SUBJECT_OPTIONS } from '../../data/questionnaireData';
import { groupBySegment, formatSegment, responsesToAvgScores } from '../../services/analyticsService';
import { colors, radius } from '../../components/ui/tokens';

export function RelatoriosPage() {
  const [tab, setTab] = useState(0);
  const { loading, school, teachers, schoolResponses, schoolScores } = useGestorData();

  const etapaOptions = useMemo(
    () => Array.from(new Set(schoolResponses.map((r) => r.segment ?? 'Não informado')))
      .map((seg) => ({ value: seg, label: formatSegment(seg) })),
    [schoolResponses],
  );
  const [selectedEtapas, setSelectedEtapas] = useState<string[] | null>(null);
  const activeEtapas = selectedEtapas ?? etapaOptions.map((o) => o.value);

  const areaOptions = useMemo(
    () => KNOWLEDGE_AREAS.filter((ka) =>
      teachers.some((t) => ((t as any).subjects ?? []).some((s: string) => SUBJECT_OPTIONS.find((o) => o.value === s)?.area === ka.value)),
    ),
    [teachers],
  );
  const [selectedAreas, setSelectedAreas] = useState<string[] | null>(null);
  const activeAreas = selectedAreas ?? areaOptions.map((o) => o.value);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress sx={{ color: colors.accent }} />
      </Box>
    );
  }

  // ── Panorama de participação ───────────────────────────────────────────────
  const respondedUids = new Set(schoolResponses.map((r) => r.userId));
  const respondedCount = teachers.filter((t) => respondedUids.has(t.uid)).length;
  const totalCount = teachers.length;
  const pct = totalCount > 0 ? Math.round((respondedCount / totalCount) * 100) : 0;

  // ── Dados por etapa de ensino (filtrados) ─────────────────────────────────
  const hasData = schoolResponses.length > 0;

  const barData = DOMAINS.map((d) => ({
    domain: d.key,
    label: d.label,
    escola: schoolScores?.find((s) => s.domain === d.key)?.score ?? 0,
  }));

  const segmentResponses = schoolResponses.filter((r) => activeEtapas.includes(r.segment ?? 'Não informado'));

  const segmentData = groupBySegment(segmentResponses).map((sg) => ({
    domain: sg.segment,
    label: formatSegment(sg.segment),
    ...Object.fromEntries(DOMAINS.map((d) => [d.key, sg[d.key] ?? 0])),
  }));

  // ── Dados por área do conhecimento (filtrados) ────────────────────────────
  const teacherSubjectsMap = new Map<string, string[]>();
  for (const t of teachers) {
    teacherSubjectsMap.set(t.uid, (t as any).subjects ?? []);
  }

  const areaResponsesMap = new Map<string, any[]>();
  for (const r of schoolResponses) {
    const subjects = teacherSubjectsMap.get(r.userId) ?? [];
    const areas = [...new Set(
      subjects
        .map((s) => SUBJECT_OPTIONS.find((o) => o.value === s)?.area)
        .filter(Boolean) as string[],
    )];
    for (const area of areas) {
      if (!areaResponsesMap.has(area)) areaResponsesMap.set(area, []);
      areaResponsesMap.get(area)!.push(r);
    }
  }

  const areaRows = KNOWLEDGE_AREAS
    .filter((ka) => areaResponsesMap.has(ka.value) && activeAreas.includes(ka.value))
    .map((ka) => {
      const list = areaResponsesMap.get(ka.value)!;
      const avg = responsesToAvgScores(list);
      const entry: Record<string, any> = { area: ka.value, label: ka.label, total: list.length };
      if (avg) for (const { domain, score } of avg) entry[domain] = score;
      return entry;
    });

  const areaBarData = areaRows.map((r) => ({
    domain: r.area,
    label: r.label,
    ...Object.fromEntries(DOMAINS.map((d) => [d.key, r[d.key] ?? 0])),
  }));

  return (
    <Box>
      <PageHeader eyebrow={school?.name ?? 'Gestor'} title="Relatórios da Escola" />

      {/* ── Panorama de participação ── */}
      <Box
        sx={{
          background: colors.surface2,
          border: `1px solid ${colors.hairline}`,
          borderRadius: `${radius.lg}px`,
          p: 2.5,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <PeopleIcon sx={{ color: colors.accent, fontSize: 28 }} />
        <Box flex={1} minWidth={180}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink }}>
            {respondedCount} de {totalCount} professor{totalCount !== 1 ? 'es' : ''} responderam
          </Typography>
          <Box sx={{ mt: 1, height: 6, borderRadius: 9999, background: colors.hairline, overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: `${pct}%`,
                background: pct >= 70 ? colors.success : pct >= 40 ? colors.warning : colors.accent,
                borderRadius: 9999,
                transition: 'width 600ms ease',
              }}
            />
          </Box>
        </Box>
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: colors.ink, minWidth: 52, textAlign: 'right' }}>
          {pct}%
        </Typography>
      </Box>

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
            <Tab label="Por Etapa" />
            <Tab label="Por Área" />
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
              <ContentCard
                title="Pontuação por etapa de ensino"
                action={
                  <MultiSelectFilter
                    label="Etapa de Ensino"
                    options={etapaOptions}
                    value={activeEtapas}
                    onChange={setSelectedEtapas}
                  />
                }
              >
                <DomainBarChart
                  data={segmentData}
                  keys={DOMAINS.map((d) => d.key)}
                  keyLabels={Object.fromEntries(DOMAINS.map((d) => [d.key, d.label]))}
                />
              </ContentCard>
              <Box mt={2}>
                <ContentCard title="Detalhamento por etapa de ensino" noPadding>
                  <DataTable
                    columns={[
                      { key: 'segment', header: 'Etapa de Ensino', render: (r: any) => formatSegment(r.segment) },
                      { key: 'total', header: 'Respostas', render: (r: any) => r.total, align: 'center' },
                      ...DOMAINS.map((d) => ({
                        key: d.key,
                        header: d.label,
                        align: 'center' as const,
                        render: (r: any) => r[d.key] ? Number(r[d.key]).toFixed(1) : '—',
                      })),
                    ]}
                    rows={groupBySegment(segmentResponses)}
                  />
                </ContentCard>
              </Box>
            </Box>
          )}

          {tab === 2 && (
            <Box>
              {areaRows.length === 0 ? (
                <EmptyState
                  icon={<BarChartIcon />}
                  title="Sem dados por área"
                  body="Os professores precisam preencher suas áreas de atuação no perfil para que este relatório seja gerado."
                />
              ) : (
                <>
                  <ContentCard
                    title="Pontuação por área do conhecimento"
                    action={
                      <MultiSelectFilter
                        label="Área"
                        options={areaOptions.map((o) => ({ value: o.value, label: o.label }))}
                        value={activeAreas}
                        onChange={setSelectedAreas}
                      />
                    }
                  >
                    <DomainBarChart
                      data={areaBarData}
                      keys={DOMAINS.map((d) => d.key)}
                      keyLabels={Object.fromEntries(DOMAINS.map((d) => [d.key, d.label]))}
                    />
                  </ContentCard>
                  <Box mt={2}>
                    <ContentCard title="Detalhamento por área" noPadding>
                      <DataTable
                        columns={[
                          { key: 'label', header: 'Área do conhecimento', render: (r: any) => r.label },
                          { key: 'total', header: 'Respostas', render: (r: any) => r.total, align: 'center' },
                          ...DOMAINS.map((d) => ({
                            key: d.key,
                            header: d.label,
                            align: 'center' as const,
                            render: (r: any) => r[d.key] ? Number(r[d.key]).toFixed(1) : '—',
                          })),
                        ]}
                        rows={areaRows}
                      />
                    </ContentCard>
                  </Box>
                </>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
