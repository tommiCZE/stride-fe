import { useState } from 'react';
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import WeekView from './components/week-view';
import MonthView from './components/month-view';
import DailyDetailDrawer from './components/daily-detail-drawer';

type ViewTab = 'week' | 'month';

export default function MyTime() {
  const [tab, setTab] = useState<ViewTab>('week');

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: 'background.default', height: '100%' }}>
      <Stack direction="row" sx={{ alignItems: 'baseline', mb: 0.25 }}>
        <Typography variant="h3">Můj výkaz práce</Typography>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
        Týdenní a měsíční přehled vlastních záznamů
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v as ViewTab)}
        sx={{ mb: 2, minHeight: 36, '.MuiTab-root': { minHeight: 36 } }}
      >
        <Tab value="week" label="Můj výkaz" />
        <Tab value="month" label="Měsíc" />
      </Tabs>

      {tab === 'week' && <WeekView />}
      {tab === 'month' && <MonthView />}

      <DailyDetailDrawer />
    </Box>
  );
}
