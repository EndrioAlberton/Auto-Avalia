import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Skeleton } from '../../../components/ui/feedback/Skeleton';
import { colors, domainColors } from '../../../components/ui/tokens';

export interface DomainBarData {
  domain: string;
  label: string;
  [key: string]: number | string;
}

interface DomainBarChartProps {
  data: DomainBarData[];
  keys: string[];
  keyLabels?: Record<string, string>;
  tooltipLabelMap?: Record<string, string>;
  loading?: boolean;
}

const KEY_COLORS = [colors.accent, colors.inkSubtle, domainColors.domain2];

export function DomainBarChart({ data, keys, keyLabels, tooltipLabelMap, loading }: DomainBarChartProps) {
  if (loading) return <Skeleton height={260} />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke={colors.hairline} />
        <XAxis
          dataKey="label"
          tick={{ fill: colors.inkSubtle, fontSize: 12, fontWeight: 500 }}
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
          labelFormatter={(label) => tooltipLabelMap?.[label as string] ?? label}
          contentStyle={{
            background: colors.surface2,
            border: `1px solid ${colors.hairline}`,
            borderRadius: 8,
            color: colors.ink,
            fontSize: 13,
            maxWidth: 280,
            whiteSpace: 'normal',
          }}
        />
        {keys.length > 1 && (
          <Legend wrapperStyle={{ fontSize: 13, color: colors.inkMuted }} />
        )}
        {keys.map((k, i) => (
          <Bar
            key={k}
            dataKey={k}
            name={keyLabels?.[k] ?? k}
            fill={KEY_COLORS[i % KEY_COLORS.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
