import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { EmptyState } from '../../../components/data-display/EmptyState';
import { Skeleton } from '../../../components/feedback/Skeleton';
import TimelineIcon from '@mui/icons-material/Timeline';
import { colors, domainColors } from '../../../components/tokens';

export interface EvolutionPoint {
  period: string;
  [domain: string]: string | number;
}

interface EvolutionLineChartProps {
  data: EvolutionPoint[];
  domains: string[];
  loading?: boolean;
}

const DOMAIN_COLOR_LIST = Object.values(domainColors);

export function EvolutionLineChart({ data, domains, loading }: EvolutionLineChartProps) {
  if (loading) return <Skeleton height={260} />;

  if (!data || data.length < 2) {
    return (
      <EmptyState
        icon={<TimelineIcon />}
        title="Dados insuficientes"
        body="Responda novamente para ver sua evolução ao longo do tempo."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid horizontal stroke={colors.hairline} vertical={false} />
        <XAxis
          dataKey="period"
          tick={{ fill: colors.inkSubtle, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 5]}
          ticks={[0, 1, 2, 3, 4, 5]}
          tick={{ fill: colors.inkSubtle, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
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
        <Legend wrapperStyle={{ fontSize: 13, color: colors.inkMuted }} />
        {domains.map((d, i) => (
          <Line
            key={d}
            type="monotone"
            dataKey={d}
            stroke={DOMAIN_COLOR_LIST[i % DOMAIN_COLOR_LIST.length]}
            strokeWidth={2}
            dot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
