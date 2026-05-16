import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Select, Typography,
} from '@mui/material';
import { TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useInviteMember } from '../../hooks/useTeam';
import { useSubmitShortcut } from '../../hooks/use-submit-shortcut';

const inviteSchema = z.object({
  name:          z.string().min(2, 'Zadejte jméno'),
  email:         z.string().email('Neplatný email'),
  workspaceRole: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});
type InviteForm = z.infer<typeof inviteSchema>;

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
}

export function InviteDialog({ open, onClose }: InviteDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const inviteMember = useInviteMember();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { name: '', email: '', workspaceRole: 'MEMBER' },
  });

  const onSubmit = (data: InviteForm) => {
    inviteMember.mutate(
      { name: data.name, email: data.email, workspaceRole: data.workspaceRole },
      {
        onSuccess: () => {
          enqueueSnackbar(`Pozvánka odeslána na ${data.email}`, { variant: 'success' });
          reset();
          onClose();
        },
      },
    );
  };

  const handleSubmitShortcut = useSubmitShortcut(handleSubmit(onSubmit));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth onKeyDown={handleSubmitShortcut}>
      <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>Pozvat člena</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
        <Controller name="name" control={control} render={({ field }) => (
          <TextField {...field} label="Jméno" size="small" fullWidth
            error={!!errors.name} helperText={errors.name?.message}/>
        )}/>
        <Controller name="email" control={control} render={({ field }) => (
          <TextField {...field} label="Email" size="small" fullWidth type="email"
            error={!!errors.email} helperText={errors.email?.message}/>
        )}/>
        <Box>
          <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 0.5 }}>Oprávnění</Typography>
          <Controller name="workspaceRole" control={control} render={({ field }) => (
            <Select {...field} size="small" fullWidth sx={{ fontSize: 13 }}>
              <MenuItem value="ADMIN" sx={{ fontSize: 13 }}>Admin — plný přístup</MenuItem>
              <MenuItem value="MEMBER" sx={{ fontSize: 13 }}>Member — standard</MenuItem>
              <MenuItem value="VIEWER" sx={{ fontSize: 13 }}>Viewer — jen čtení</MenuItem>
            </Select>
          )}/>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button size="small" onClick={onClose}>Zrušit</Button>
        <Button size="small" variant="contained"
          disabled={inviteMember.isPending}
          onClick={handleSubmit(onSubmit)}>
          Odeslat pozvánku
        </Button>
      </DialogActions>
    </Dialog>
  );
}
