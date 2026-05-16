import { Box, Skeleton, Typography, useTheme, alpha } from '@mui/material';
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { useSprintBurndown } from '../../hooks/useSprintBurndown';

interface Props {
  sprintId: string;
  sprintName?: string;
  height?: number;
}

function formatDayLabel(iso: string): string {
  // 'D. M.' Czech-style short label, e.g. "14. 4."
  const d = new Date(iso);
  return `${d.getDate()}. ${d.getMonth() + 1}.`;
}

export default function SprintBurndownChart({ sprintId, sprintName, height = 220 }: Props) {
  const theme = useTheme();
  const { data, isLoading, isError } = useSprintBurndown(sprintId);

  if (isLoading) {
    return (
      <Box sx={{ px: 1.5, py: 1.5 }}>
        <Skeleton variant="rounded" height={height} />
      </Box>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Burndown data nejsou k dispozici.
        </Typography>
      </Box>
    );
  }

  const chartData = data.map(p => ({
    label: formatDayLabel(p.date),
    actual: p.remainingPoints,
    ideal: p.idealRemaining,
  }));

  const axisColor = theme.palette.text.secondary;
  const gridColor = theme.palette.divider;
  const actualColor = theme.palette.primary.main;
  const idealColor = theme.palette.text.disabled;

  return (
    <Box sx={{ px: 1.5, pt: 1, pb: 1.5 }}>
      {sprintName && (
        <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', pl: 0.5, pb: 0.5 }}>
          Burndown — {sprintName}
        </Typography>
      )}
      <Box sx={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: axisColor, fontSize: 13 }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              minTickGap={12}
            />
            <YAxis
              tick={{ fill: axisColor, fontSize: 13 }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              width={36}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
                fontSize: 14,
                color: theme.palette.text.primary,
              }}
              labelStyle={{ color: theme.palette.text.secondary, fontSize: 13 }}
              formatter={(value, name) => {
                const label = name === 'actual' ? 'Aktuální' : 'Ideální';
                return [`${value} h`, label] as [string, string];
              }}
            />
            <Legend
              iconType="plainline"
              wrapperStyle={{ fontSize: 13, color: axisColor }}
              formatter={(value: string) => (value === 'actual' ? 'Aktuální' : 'Ideální')}
            />
            <Line
              type="monotone"
              dataKey="ideal"
              stroke={idealColor}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke={actualColor}
              strokeWidth={2}
              dot={{ r: 3, fill: actualColor, stroke: alpha(actualColor, 0.2), strokeWidth: 4 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
