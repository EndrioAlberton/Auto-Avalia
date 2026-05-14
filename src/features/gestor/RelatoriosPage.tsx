import { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import BarChartIcon from '@mui/icons-material/BarChart';
import { PageHeader } from '../../components/layout/PageHeader';
import { ContentCard } from '../../components/data-display/ContentCard';
import { EmptyState } from '../../components/data-display/EmptyState';
import { DataTable } from '../../components/data-display/DataTable';
import { DomainRadarChart } from '../analytics/charts/DomainRadarChart';
import { DomainBarChart } from '../analytics/charts/DomainBarChart';
import { useGestorData } from './hooks/useGestorData';
import { DOMAINS } from '../../data/questionnaireData';
import { groupBySegment } from '../../services/analyticsService';
import { colors } from '../../components/tokens';

export function RelatoriosPage() {
  const [tab, setTab] = useState(0);
  const { loading, school, schoolResponses, schoolScores } = useGestorData();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress sx={{ color: colors.accent }} />
      </Box>
    );
  }

  const hasData = schoolResponses.length > 0;

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

  const segmentTableRows = groupBySegment(schoolResponses);

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
                    rows={segmentTableRows}
                  />
                </ContentCard>
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
