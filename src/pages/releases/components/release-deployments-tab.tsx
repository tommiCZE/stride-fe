import { Box, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../../components/empty-state/EmptyState';
import { SettingsIcon } from '../../../components/icons/icons';

export default function ReleaseDeploymentsTab() {
  const navigate = useNavigate();
  return (
    <Stack direction="row" sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', py: 8 }}>
      <Box>
        <EmptyState
          icon={<SettingsIcon/>}
          title="Žádné deployments"
          description="Připoj GitHub Actions webhook v Settings → Integrations a uvidíš tu CI build + deploy historii pro tuto verzi."
          action={
            <Button variant="outlined" size="small" onClick={() => navigate('/settings/integrations')}>
              Otevřít integrace
            </Button>
          }
        />
      </Box>
    </Stack>
  );
}
