import { useState } from 'react';
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
import { EmptyState } from '../../../components/ui/data-display/EmptyState';
import { Skeleton } from '../../../components/ui/feedback/Skeleton';
import TimelineIcon from '@mui/icons-material/Timeline';
import { colors, domainColors } from '../../../components/ui/tokens';

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
  const [hidden, setHidden] = useState<Set<string>>(new Set());

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

  const toggleDomain = (entry: any) => {
    const key: string = entry.value ?? entry.dataKey ?? '';
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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
        <Legend
          wrapperStyle={{ fontSize: 13, color: colors.inkMuted, cursor: 'pointer' }}
          onClick={toggleDomain}
          formatter={(value) => (
            <span style={{ color: hidden.has(value) ? colors.inkTertiary : colors.inkMuted, textDecoration: hidden.has(value) ? 'line-through' : 'none' }}>
              {value}
            </span>
          )}
        />
        {domains.map((d, i) => (
          <Line
            key={d}
            type="monotone"
            dataKey={d}
            hide={hidden.has(d)}
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
