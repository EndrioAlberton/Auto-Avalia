import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { ContentCard } from '../../../components/data-display/ContentCard';
import { EmptyState } from '../../../components/data-display/EmptyState';
import { Skeleton } from '../../../components/feedback/Skeleton';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { colors } from '../../../components/tokens';

export interface DomainScore {
  domain: string;
  label: string;
  score: number;
}

interface DomainRadarChartProps {
  myData: DomainScore[];
  schoolData?: DomainScore[];
  loading?: boolean;
}

const DOMAIN_LABELS: Record<string, string> = {
  planejamento: 'Planejamento',
  ambiente:     'Ambiente',
  instrucao:    'Instrução',
  avaliacao:    'Avaliação',
  tecnologia:   'Tecnologia',
};

export function DomainRadarChart({ myData, schoolData, loading }: DomainRadarChartProps) {
  if (loading) {
    return (
      <ContentCard title="Perfil por Domínio">
        <Skeleton height={280} />
      </ContentCard>
    );
  }

  if (!myData || myData.length === 0) {
    return (
      <ContentCard title="Perfil por Domínio">
        <EmptyState
          icon={<AssessmentIcon />}
          title="Nenhuma avaliação ainda"
          body="Responda o questionário para visualizar seu perfil por domínio."
        />
      </ContentCard>
    );
  }

  const data = myData.map((d) => ({
    subject: d.label || DOMAIN_LABELS[d.domain] || d.domain,
    eu: d.score,
    ...(schoolData
      ? { escola: schoolData.find((s) => s.domain === d.domain)?.score ?? 0 }
      : {}),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid stroke={colors.hairline} />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: colors.inkSubtle, fontSize: 12, fontWeight: 500 }}
        />
        <Tooltip
          contentStyle={{
            background: colors.surface2,
            border: `1px solid ${colors.hairline}`,
            borderRadius: 8,
            color: colors.ink,
            fontSize: 13,
          }}
        />
        <Radar
          name="Você"
          dataKey="eu"
          stroke={colors.accent}
          fill={colors.accent}
          fillOpacity={0.15}
          strokeWidth={2}
        />
        {schoolData && (
          <Radar
            name="Média da escola"
            dataKey="escola"
            stroke={colors.inkSubtle}
            fill="transparent"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        )}
        {schoolData && (
          <Legend
            wrapperStyle={{ fontSize: 13, color: colors.inkMuted }}
          />
        )}
      </RadarChart>
    </ResponsiveContainer>
  );
}
