import { Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import { WorklogComposer } from './worklog-composer';

interface WorklogDialogProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  taskKey: string;
  defaultMinutes: number;
}

export function WorklogDialog({ open, onClose, taskId, taskKey, defaultMinutes }: WorklogDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        Zalogovat čas
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {taskKey}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <WorklogComposer taskId={taskId} defaultMinutes={defaultMinutes} onClose={onClose}/>
      </DialogContent>
    </Dialog>
  );
}
