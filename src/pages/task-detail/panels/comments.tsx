import { useMemo, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useComments, useCreateComment } from '../../../hooks/useComments';
import { useAuthStore } from '../../../store/auth-store';
import FluxAvatar from '../../../components/flux-avatar';
import RichContent from '../../../components/rich-content';
import { useSubmitShortcut } from '../../../hooks/use-submit-shortcut';
import type { CommentDto } from '../../../api/types';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'právě teď';
  if (m < 60) return `před ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `před ${h} h`;
  return `před ${Math.floor(h / 24)} d`;
}

interface ReplyComposerProps {
  onSubmit: (text: string) => void;
  onCancel: () => void;
  pending: boolean;
  placeholder?: string;
}

function ReplyComposer({ onSubmit, onCancel, pending, placeholder = 'Napiš odpověď…' }: ReplyComposerProps) {
  const [draft, setDraft] = useState('');
  const submit = () => {
    if (!draft.trim()) return;
    onSubmit(draft);
  };
  const handleSubmitShortcut = useSubmitShortcut(submit, !!draft.trim());

  return (
    <Box sx={{ mt: 1 }}>
      <Box
        contentEditable
        suppressContentEditableWarning
        onInput={e => setDraft(e.currentTarget.textContent ?? '')}
        onKeyDown={handleSubmitShortcut}
        data-placeholder={placeholder}
        sx={{
          p: 1.25, border: 1, borderColor: 'primary.main', borderRadius: 1.5,
          bgcolor: 'background.paper', fontSize: 13, minHeight: 50, outline: 'none',
          color: 'text.primary',
          '&:empty:before': { content: 'attr(data-placeholder)', color: 'text.disabled' },
        }}
      />
      <Box sx={{ display: 'flex', gap: 1, mt: 0.75, justifyContent: 'flex-end' }}>
        <Button size="small" onClick={onCancel}>Zrušit</Button>
        <Button size="small" variant="contained" onClick={submit} disabled={!draft.trim() || pending}>
          Odpovědět
        </Button>
      </Box>
    </Box>
  );
}

interface CommentItemProps {
  comment: CommentDto;
  isReply: boolean;
  replyingTo: string | null;
  onReplyClick: (id: string) => void;
  onReplyCancel: () => void;
  onReplySubmit: (parentId: string, text: string) => void;
  pending: boolean;
}

function CommentItem({ comment, isReply, replyingTo, onReplyClick, onReplyCancel, onReplySubmit, pending }: CommentItemProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1.25 }}>
      <FluxAvatar user={comment.user} size={isReply ? 24 : 28}/>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{comment.user.name}</Typography>
          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{timeAgo(comment.createdAt)}</Typography>
        </Box>
        <Box sx={{ p: 1.25, borderRadius: 1.2, bgcolor: 'action.hover', fontSize: 13, lineHeight: 1.55 }}>
          <RichContent blocks={comment.text}/>
        </Box>
        {!isReply && (
          <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, color: 'text.disabled', fontSize: 11.5 }}>
            <Box
              onClick={() => onReplyClick(comment.id)}
              sx={{ cursor: 'pointer', '&:hover': { color: 'text.secondary' } }}
            >
              Odpovědět
            </Box>
          </Box>
        )}
        {replyingTo === comment.id && (
          <ReplyComposer
            onSubmit={text => onReplySubmit(comment.id, text)}
            onCancel={onReplyCancel}
            pending={pending}
          />
        )}
      </Box>
    </Box>
  );
}

export function Comments({ taskId }: { taskId: string }) {
  const { enqueueSnackbar } = useSnackbar();
  const { data: comments = [], isLoading } = useComments(taskId);
  const createComment = useCreateComment(taskId);
  const me = useAuthStore(s => s.user);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

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

  const submitReply = (parentId: string, text: string) => {
    createComment.mutate({ text, parentCommentId: parentId }, {
      onSuccess: () => {
        setReplyingTo(null);
        enqueueSnackbar('Odpověď přidána', { variant: 'success' });
      },
    });
  };

  const handleSubmitShortcut = useSubmitShortcut(submit, composing && !!draft.trim());

  // Group: top-level + replies by parentId
  const { topLevel, repliesByParent } = useMemo(() => {
    const top: CommentDto[] = [];
    const byParent = new Map<string, CommentDto[]>();
    for (const c of comments) {
      if (c.parentCommentId) {
        const arr = byParent.get(c.parentCommentId) ?? [];
        arr.push(c);
        byParent.set(c.parentCommentId, arr);
      } else {
        top.push(c);
      }
    }
    return { topLevel: top, repliesByParent: byParent };
  }, [comments]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
        Komentáře · {comments.length}
      </Typography>

      {isLoading && <CircularProgress size={16}/>}

      {topLevel.map(c => {
        const replies = repliesByParent.get(c.id) ?? [];
        return (
          <Box key={c.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <CommentItem
              comment={c}
              isReply={false}
              replyingTo={replyingTo}
              onReplyClick={id => setReplyingTo(id)}
              onReplyCancel={() => setReplyingTo(null)}
              onReplySubmit={submitReply}
              pending={createComment.isPending}
            />
            {replies.length > 0 && (
              <Box
                sx={{
                  ml: 5,
                  pl: 2,
                  borderLeft: 2,
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.25,
                }}
              >
                {replies.map(r => (
                  <CommentItem
                    key={r.id}
                    comment={r}
                    isReply
                    replyingTo={replyingTo}
                    onReplyClick={() => {}}
                    onReplyCancel={() => setReplyingTo(null)}
                    onReplySubmit={submitReply}
                    pending={createComment.isPending}
                  />
                ))}
              </Box>
            )}
          </Box>
        );
      })}

      <Box sx={{ display: 'flex', gap: 1.25, mt: 1 }}>
        <FluxAvatar user={me} size={28}/>
        <Box sx={{ flex: 1 }}>
          {composing ? (
            <Box>
              <Box
                contentEditable suppressContentEditableWarning
                onInput={e => setDraft(e.currentTarget.textContent ?? '')}
                onKeyDown={handleSubmitShortcut}
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
