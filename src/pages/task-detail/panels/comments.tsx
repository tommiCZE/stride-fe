import { useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useComments, useCreateComment } from '../../../hooks/useComments';
import { useAuthStore } from '../../../store/auth-store';
import FluxAvatar from '../../../components/flux-avatar';
import RichContent from '../../../components/rich-content';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'právě teď';
  if (m < 60) return `před ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `před ${h} h`;
  return `před ${Math.floor(h / 24)} d`;
}

export function Comments({ taskId }: { taskId: string }) {
  const { enqueueSnackbar } = useSnackbar();
  const { data: comments = [], isLoading } = useComments(taskId);
  const createComment = useCreateComment(taskId);
  const me = useAuthStore(s => s.user);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');

  const submit = () => {
    if (!draft.trim()) return;
    createComment.mutate({ text: draft }, {
      onSuccess: () => {
        setDraft('');
        setComposing(false);
        enqueueSnackbar('Komentář přidán', { variant: 'success' });
      },
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
        Komentáře · {comments.length}
      </Typography>

      {isLoading && <CircularProgress size={16}/>}

      {comments.map(c => (
        <Box key={c.id} sx={{ display: 'flex', gap: 1.25 }}>
          <FluxAvatar user={c.user} size={28}/>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{c.user.name}</Typography>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{timeAgo(c.createdAt)}</Typography>
            </Box>
            <Box sx={{ p: 1.25, borderRadius: 1.2, bgcolor: 'action.hover', fontSize: 13, lineHeight: 1.55 }}>
              <RichContent blocks={c.text}/>
            </Box>
          </Box>
        </Box>
      ))}

      <Box sx={{ display: 'flex', gap: 1.25, mt: 1 }}>
        <FluxAvatar user={me} size={28}/>
        <Box sx={{ flex: 1 }}>
          {composing ? (
            <Box>
              <Box
                contentEditable suppressContentEditableWarning
                onInput={e => setDraft(e.currentTarget.textContent ?? '')}
                sx={{ p: 1.25, border: 1, borderColor: 'primary.main', borderRadius: 1.5,
                  bgcolor: 'background.paper', fontSize: 13, minHeight: 60, outline: 'none',
                  color: 'text.primary', '&:empty:before': { content: '"Napiš komentář…"', color: 'text.disabled' } }}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 0.75, justifyContent: 'flex-end' }}>
                <Button size="small" onClick={() => { setComposing(false); setDraft(''); }}>Zrušit</Button>
                <Button size="small" variant="contained" onClick={submit}
                  disabled={!draft.trim() || createComment.isPending}>Přidat</Button>
              </Box>
            </Box>
          ) : (
            <Box onClick={() => setComposing(true)}
              sx={{ p: 1.25, border: 1, borderColor: 'divider', borderRadius: 1.5,
                bgcolor: 'background.paper', fontSize: 13, color: 'text.disabled',
                cursor: 'text', '&:hover': { borderColor: 'primary.main' } }}>
              Napiš komentář…
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
