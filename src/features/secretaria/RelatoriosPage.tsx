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
import { useSecretariaData } from './hooks/useSecretariaData';
import { DOMAINS } from '../../data/questionnaireData';
import { colors } from '../../components/tokens';

export function RelatoriosPage() {
  const [tab, setTab] = useState(0);
  const { loading, schools } = useSecretariaData();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress sx={{ color: colors.accent }} />
      </Box>
    );
  }

  const schoolTableRows = schools.map((s) => ({
    name: s.name,
    state: (s as any).state || '—',
    responseRate: '0%',
    ...Object.fromEntries(DOMAINS.map((d) => [d.key, '—'])),
  }));

  return (
    <Box>
      <PageHeader eyebrow="Secretaria" title="Relatórios da Rede" />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: `1px solid ${colors.hairline}` }}>
        <Tab label="Rede" />
        <Tab label="Por Escola" />
        <Tab label="Regional" />
        <Tab label="Por Segmento" />
      </Tabs>

      {tab === 0 && (
        <EmptyState
          icon={<BarChartIcon />}
          title="Dados insuficientes"
          body="Os relatórios da rede aparecerão quando professores responderem o questionário."
        />
      )}

      {tab === 1 && (
        <ContentCard title="Pontuação por escola" noPadding>
          <DataTable
            columns={[
              { key: 'name', header: 'Escola', render: (r: any) => r.name },
              { key: 'state', header: 'Estado', render: (r: any) => r.state },
              { key: 'responseRate', header: 'Taxa de resposta', render: (r: any) => r.responseRate, align: 'center' },
              ...DOMAINS.map((d) => ({
                key: d.key,
                header: d.label,
                align: 'center' as const,
                render: (r: any) => r[d.key],
              })),
            ]}
            rows={schoolTableRows}
            loading={loading}
          />
        </ContentCard>
      )}

      {tab === 2 && (
        <EmptyState
          icon={<BarChartIcon />}
          title="Visão regional"
          body="Agrupamento por estado disponível quando houver mais dados coletados."
        />
      )}

      {tab === 3 && (
        <EmptyState
          icon={<BarChartIcon />}
          title="Visão por segmento"
          body="Dados por segmento de ensino disponíveis em breve."
        />
      )}
    </Box>
  );
}
