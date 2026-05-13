import { Box, Skeleton, Typography, useTheme, alpha } from '@mui/material';
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { useSprintVelocity } from '../../hooks/useSprintVelocity';

interface Props {
  projectId: string | undefined;
  lastN?: number;
  height?: number;
}

export default function SprintVelocityChart({ projectId, lastN = 6, height = 260 }: Props) {
  const theme = useTheme();
  const { data, isLoading, isError } = useSprintVelocity(projectId, lastN);

  if (!projectId) {
    return (
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Vyber projekt pro zobrazení velocity.
        </Typography>
      </Box>
    );
  }

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
          Velocity data nejsou k dispozici — žádné dokončené sprinty.
        </Typography>
      </Box>
    );
  }

  const chartData = data.map(p => ({
    label: p.sprintName,
    planned: p.planned,
    completed: p.completed,
  }));

  const axisColor = theme.palette.text.secondary;
  const gridColor = theme.palette.divider;
  const completedColor = theme.palette.primary.main;
  const plannedColor = alpha(completedColor, 0.35);

  return (
    <Box sx={{ px: 1.5, pt: 1, pb: 1.5 }}>
      <Box sx={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 28 }}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: axisColor, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              angle={-30}
              textAnchor="end"
              interval={0}
              height={50}
            />
            <YAxis
              tick={{ fill: axisColor, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              width={36}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: alpha(theme.palette.text.primary, 0.04) }}
              contentStyle={{
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
                fontSize: 12,
                color: theme.palette.text.primary,
              }}
              labelStyle={{ color: theme.palette.text.secondary, fontSize: 11 }}
              formatter={(value, name) => {
                const label = name === 'planned' ? 'Planned' : 'Completed';
                return [`${value} SP`, label] as [string, string];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: axisColor, paddingTop: 8 }}
              formatter={(value: string) => (value === 'planned' ? 'Planned' : 'Completed')}
            />
            <Bar
              dataKey="planned"
              fill={plannedColor}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
              maxBarSize={36}
            />
            <Bar
              dataKey="completed"
              fill={completedColor}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
