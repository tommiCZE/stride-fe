import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { getUser, timeAgo } from '../../../mocks/data';
import FluxAvatar from '../../../components/flux-avatar';
import RichContent from '../../../components/rich-content';

type Comment = { id: string; user: string; at: string; text: string };

export function Comments({ taskKey: _taskKey }: { taskKey: string }) {
  const [comments, setComments] = useState<Comment[]>([
    { id: 'c1', user: 'u1', at: '2026-04-26T10:15:00', text: '@JN co myslíš na ten upload progress bar? Mělo by se to zobrazovat během paste z clipboardu?' },
    { id: 'c2', user: 'u2', at: '2026-04-26T11:30:00', text: 'Souhlasím, paste by měl mít progress. Ideálně inline pod kurzorem.' },
    { id: 'c3', user: 'u4', at: '2026-04-27T09:20:00', text: 'Designy přidávám do #WEB-148. Backup placeholder pokud upload selže?' },
    { id: 'c4', user: 'u1', at: '2026-04-27T14:30:00', text: 'Skvěle. Pokračujeme.' },
  ]);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');

  const submit = () => {
    if (!draft.trim()) return;
    setComments(cs => [...cs, { id: 'c' + Date.now(), user: 'u1', at: new Date().toISOString(), text: draft }]);
    setDraft('');
    setComposing(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
        Komentáře · {comments.length}
      </Typography>
      {comments.map(c => {
        const u = getUser(c.user)!;
        return (
          <Box key={c.id} sx={{ display: 'flex', gap: 1.25 }}>
            <FluxAvatar user={u} size={28}/>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{u.name}</Typography>
                <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{timeAgo(c.at)}</Typography>
              </Box>
              <Box sx={{ p: 1.25, borderRadius: 1.2, bgcolor: 'action.hover', fontSize: 13, lineHeight: 1.55 }}>
                <RichContent blocks={c.text}/>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, color: 'text.disabled', fontSize: 11.5 }}>
                <Box sx={{ cursor: 'default', '&:hover': { color: 'text.secondary' } }}>Odpovědět</Box>
              </Box>
            </Box>
          </Box>
        );
      })}

      <Box sx={{ display: 'flex', gap: 1.25, mt: 1 }}>
        <FluxAvatar user={getUser('u1')} size={28}/>
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
                <Button size="small" variant="contained" onClick={submit} disabled={!draft.trim()}>Přidat</Button>
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
