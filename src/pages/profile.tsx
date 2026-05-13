import { useState, useEffect } from 'react';
import { Box, Button, Card, TextField, Typography } from '@mui/material';
import { useMe, useUpdateMe } from '../hooks/useProfile';
import FluxAvatar from '../components/flux-avatar';
import { CardTitle } from '../components/ui/ui';

const COLORS = ['#6366f1','#0ea5e9','#ec4899','#10b981','#f59e0b','#a855f7','#ef4444','#3b82f6','#14b8a6','#f97316'];

export default function Profile() {
  const { data: me } = useMe();
  const updateMe = useUpdateMe();

  const [name, setName]         = useState('');
  const [initials, setInitials] = useState('');
  const [color, setColor]       = useState('');

  useEffect(() => {
    if (!me) return;
    setName(me.name);
    setInitials(me.initials);
    setColor(me.color);
  }, [me]);

  const hasChanges = me && (name !== me.name || initials !== me.initials || color !== me.color);

  const handleSave = () => {
    updateMe.mutate({ name: name.trim() || undefined, initials: initials.trim() || undefined, color });
  };

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: 'background.default', height: '100%', maxWidth: 580 }}>
      <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', mb: 2 }}>
        Můj profil
      </Typography>

      <Card sx={{ borderRadius: 1.5, p: 2.5, mb: 2 }}>
        <CardTitle sx={{ mb: 2 }}>Základní informace</CardTitle>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
          <FluxAvatar user={{ color, initials }} size={52}/>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{me?.name}</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{me?.email}</Typography>
            <Typography sx={{ fontSize: 11, color: 'text.disabled', textTransform: 'capitalize', mt: 0.25 }}>
              {me?.workspaceRole?.toLowerCase()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2.5 }}>
          <TextField label="Jméno" size="small" fullWidth value={name}
            onChange={e => setName(e.target.value)}/>
          <TextField label="Iniciály" size="small" fullWidth value={initials}
            onChange={e => setInitials(e.target.value.toUpperCase().slice(0, 3))}
            slotProps={{ htmlInput: { maxLength: 3 } }}
            helperText="Zobrazí se v avataru (2–3 znaky)"/>
        </Box>

        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>Barva avataru</Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <Box key={c} onClick={() => setColor(c)}
                sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: c, cursor: 'pointer',
                  outline: c === color ? '2px solid' : '2px solid transparent',
                  outlineColor: c === color ? 'text.primary' : 'transparent',
                  outlineOffset: 2, transition: 'outline-color 0.1s' }}/>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" size="small"
            disabled={!hasChanges || updateMe.isPending}
            onClick={handleSave}>
            {updateMe.isPending ? 'Ukládám…' : 'Uložit změny'}
          </Button>
        </Box>
      </Card>

      <Card sx={{ borderRadius: 1.5, p: 2.5 }}>
        <CardTitle sx={{ mb: 1.5 }}>Účet</CardTitle>
        <Box sx={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 1.5, alignItems: 'center',
          fontSize: 13 }}>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Email</Typography>
          <Typography sx={{ fontSize: 13 }}>{me?.email}</Typography>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Role</Typography>
          <Typography sx={{ fontSize: 13, textTransform: 'capitalize' }}>{me?.workspaceRole?.toLowerCase()}</Typography>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Status</Typography>
          <Typography sx={{ fontSize: 13, textTransform: 'capitalize' }}>{me?.status?.toLowerCase()}</Typography>
        </Box>
      </Card>
    </Box>
  );
}
