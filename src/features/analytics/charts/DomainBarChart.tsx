import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import Box from '@mui/material/Box';
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

const KEY_COLORS = [
  colors.accent,
  '#64b5f6',
  '#81c784',
  '#ffb74d',
  '#ba68c8',
  '#4db6ac',
  '#f06292',
  domainColors.domain2,
];

export function DomainBarChart({ data, keys, keyLabels, tooltipLabelMap, loading }: DomainBarChartProps) {
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());
  const [activeKey, setActiveKey] = useState<string | null>(null);

  if (loading) return <Skeleton height={260} />;

  const toggleKey = (key: string) => {
    setHiddenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const items = activeKey
      ? payload.filter((p: any) => p.dataKey === activeKey)
      : payload;
    if (!items.length) return null;
    return (
      <Box
        sx={{
          background: colors.surface2,
          border: `1px solid ${colors.hairline}`,
          borderRadius: 1,
          p: 1.5,
          fontSize: 13,
          color: colors.ink,
          maxWidth: 300,
          whiteSpace: 'normal',
        }}
      >
        <Box sx={{ color: colors.inkSubtle, mb: 0.5, fontSize: 12 }}>
          {tooltipLabelMap?.[label as string] ?? label}
        </Box>
        {items.map((item: any) => (
          <Box key={item.dataKey} sx={{ color: item.fill, fontWeight: 500 }}>
            {keyLabels?.[item.dataKey] ?? item.dataKey}:{' '}
            {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box>
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
          <Tooltip content={<CustomTooltip />} />
          {keys.map((k, i) => (
            <Bar
              key={k}
              dataKey={k}
              name={keyLabels?.[k] ?? k}
              fill={KEY_COLORS[i % KEY_COLORS.length]}
              radius={[4, 4, 0, 0]}
              hide={hiddenKeys.has(k)}
              onMouseEnter={() => setActiveKey(k)}
              onMouseLeave={() => setActiveKey(null)}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {keys.length > 1 && (
        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={1.5} mt={1.5}>
          {keys.map((k, i) => {
            const hidden = hiddenKeys.has(k);
            return (
              <Box
                key={k}
                onClick={() => toggleKey(k)}
                display="flex"
                alignItems="center"
                gap={0.75}
                sx={{
                  cursor: 'pointer',
                  opacity: hidden ? 0.35 : 1,
                  transition: 'opacity 150ms ease',
                  fontSize: 13,
                  color: colors.inkMuted,
                  userSelect: 'none',
                  '&:hover': { color: colors.ink },
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    background: KEY_COLORS[i % KEY_COLORS.length],
                    flexShrink: 0,
                    ...(hidden && { border: `1.5px solid ${KEY_COLORS[i % KEY_COLORS.length]}`, background: 'transparent' }),
                  }}
                />
                {keyLabels?.[k] ?? k}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
