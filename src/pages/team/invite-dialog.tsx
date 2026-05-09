import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Select, TextField, Typography,
} from '@mui/material';
import { AVATAR_COLORS } from './role-badge';
import type { WorkspaceRole, TeamUser } from './role-badge';

const inviteSchema = z.object({
  name:          z.string().min(2, 'Zadejte jméno'),
  email:         z.string().email('Neplatný email'),
  role:          z.string().min(1, 'Zadejte pracovní roli'),
  workspaceRole: z.enum(['admin', 'member', 'viewer']),
});
type InviteForm = z.infer<typeof inviteSchema>;

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  onInvite: (u: TeamUser) => void;
}

export function InviteDialog({ open, onClose, onInvite }: InviteDialogProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { name: '', email: '', role: '', workspaceRole: 'member' },
  });

  const onSubmit = (data: InviteForm) => {
    const idx = Math.floor(Math.random() * AVATAR_COLORS.length);
    const initials = data.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const newUser: TeamUser = {
      id: `u${Date.now()}`,
      name: data.name,
      initials,
      color: AVATAR_COLORS[idx],
      role: data.role,
      email: data.email,
      workspaceRole: data.workspaceRole as WorkspaceRole,
      status: 'pending',
    };
    onInvite(newUser);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
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
        <Controller name="role" control={control} render={({ field }) => (
          <TextField {...field} label="Pracovní role (např. Frontend, QA)" size="small" fullWidth
            error={!!errors.role} helperText={errors.role?.message}/>
        )}/>
        <Box>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>Oprávnění</Typography>
          <Controller name="workspaceRole" control={control} render={({ field }) => (
            <Select {...field} size="small" fullWidth sx={{ fontSize: 13 }}>
              <MenuItem value="admin" sx={{ fontSize: 13 }}>Admin — plný přístup</MenuItem>
              <MenuItem value="member" sx={{ fontSize: 13 }}>Member — standard</MenuItem>
              <MenuItem value="viewer" sx={{ fontSize: 13 }}>Viewer — jen čtení</MenuItem>
            </Select>
          )}/>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button size="small" onClick={onClose}>Zrušit</Button>
        <Button size="small" variant="contained" onClick={handleSubmit(onSubmit)}>
          Odeslat pozvánku
        </Button>
      </DialogActions>
    </Dialog>
  );
}
