import { Box, Tooltip } from '@mui/material';
import FluxAvatar from '../../../components/flux-avatar';
import type { DevReviewer } from '../../../types/dev-activity';

function ringColorKey(verdict: DevReviewer['verdict']): 'success' | 'warning' | 'error' | null {
  if (verdict === 'approved')  return 'success';
  if (verdict === 'commented') return 'warning';
  if (verdict === 'changes')   return 'error';
  return null;
}

const VERDICT_LABEL: Record<DevReviewer['verdict'], string> = {
  approved:  'schválil',
  commented: 'okomentoval',
  changes:   'požaduje změny',
  awaiting:  'čeká',
};

interface Props {
  reviewer: DevReviewer;
  size?: number;
}

export function ReviewerAvatar({ reviewer, size = 18 }: Props) {
  const key = ringColorKey(reviewer.verdict);
  return (
    <Tooltip title={`${reviewer.user.name} · ${VERDICT_LABEL[reviewer.verdict]}`}>
      <Box sx={theme => ({
        display: 'inline-flex',
        borderRadius: '50%',
        boxShadow: key ? `0 0 0 1.5px ${theme.palette[key].main}` : undefined,
      })}>
        <FluxAvatar user={reviewer.user} size={size}/>
      </Box>
    </Tooltip>
  );
}
