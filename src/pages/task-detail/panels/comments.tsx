import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import type { JSONContent } from '@tiptap/core';
import { useComments, useCreateComment } from '../../../hooks/useComments';
import { useAuthStore } from '../../../store/auth-store';
import FluxAvatar from '../../../components/flux-avatar';
import RichContent from '../../../components/rich-content';
import EditorBody from '../../../components/editor/editor-body';
import { attachmentsApi } from '../../../api/attachments';
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

const EMPTY_DOC: JSONContent = { type: 'doc', content: [] };

function isEmptyDoc(json: JSONContent): boolean {
  const content = json.content ?? [];
  if (content.length === 0) return true;
  return content.every(node => {
    if (!node.content || node.content.length === 0) return true;
    return node.content.every(c => !c.text?.trim());
  });
}

interface CommentEditorProps {
  taskId: string;
  placeholder: string;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

function CommentEditor({ taskId, placeholder, onSubmit, onCancel }: CommentEditorProps) {
  return (
    <Box sx={{ mt: 1 }}>
      <EditorBody
        initialContent={EMPTY_DOC}
        placeholder={placeholder}
        compact
        onSave={json => {
          if (isEmptyDoc(json)) return;
          onSubmit(JSON.stringify(json));
        }}
        onCancel={onCancel}
        onUploadImage={file => attachmentsApi.uploadImage(taskId, file)}
      />
    </Box>
  );
}

interface CommentItemProps {
  comment: CommentDto;
  taskId: string;
  isReply: boolean;
  replyingTo: string | null;
  onReplyClick: (id: string) => void;
  onReplyCancel: () => void;
  onReplySubmit: (parentId: string, text: string) => void;
  showReply: boolean;
}

function CommentItem({ comment, taskId, isReply, replyingTo, onReplyClick, onReplyCancel, onReplySubmit, showReply, highlighted }: CommentItemProps & { highlighted?: boolean }) {
  return (
    <Box
      id={`comment-${comment.sequence}`}
      sx={{
        display: 'flex',
        gap: 1.25,
        scrollMarginTop: 80,
        borderRadius: 1.2,
        transition: 'background-color 0.6s ease-out',
        bgcolor: highlighted ? 'action.selected' : 'transparent',
      }}
    >
      <FluxAvatar user={comment.user} size={isReply ? 24 : 28}/>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{comment.user.name}</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>{timeAgo(comment.createdAt)}</Typography>
        </Box>
        <Box sx={{ p: 1.25, borderRadius: 1.2, bgcolor: 'action.hover', fontSize: 13, lineHeight: 1.55 }}>
          <RichContent blocks={comment.text}/>
        </Box>
        {showReply && (
          <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, color: 'text.disabled', fontSize: 13 }}>
            <Box
              onClick={() => onReplyClick(comment.id)}
              sx={{ cursor: 'pointer', '&:hover': { color: 'text.secondary' } }}
            >
              Odpovědět
            </Box>
          </Box>
        )}
        {replyingTo === comment.id && (
          <CommentEditor
            taskId={taskId}
            placeholder="Napiš odpověď…"
            onSubmit={text => onReplySubmit(comment.id, text)}
            onCancel={onReplyCancel}
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const location = useLocation();
  const [highlightedSequence, setHighlightedSequence] = useState<number | null>(null);

  useEffect(() => {
    const match = location.hash.match(/^#comment-(\d+)$/);
    if (!match || comments.length === 0) return;
    const sequence = Number(match[1]);
    if (!comments.some(c => c.sequence === sequence)) return;
    const el = document.getElementById(`comment-${sequence}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedSequence(sequence);
    const timeout = window.setTimeout(() => setHighlightedSequence(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [location.hash, comments]);

  const submit = (text: string) => {
    createComment.mutate({ text }, {
      onSuccess: () => {
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
      <Typography sx={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
        Komentáře · {comments.length}
      </Typography>

      {isLoading && <CircularProgress size={16}/>}

      {topLevel.map(c => {
        const replies = repliesByParent.get(c.id) ?? [];
        return (
          <Box key={c.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <CommentItem
              comment={c}
              taskId={taskId}
              isReply={false}
              replyingTo={replyingTo}
              onReplyClick={id => setReplyingTo(id)}
              onReplyCancel={() => setReplyingTo(null)}
              onReplySubmit={submitReply}
              showReply={replies.length === 0}
              highlighted={highlightedSequence === c.sequence}
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
                {replies.map((r, idx) => (
                  <CommentItem
                    key={r.id}
                    comment={r}
                    taskId={taskId}
                    isReply
                    replyingTo={replyingTo}
                    onReplyClick={id => setReplyingTo(id)}
                    onReplyCancel={() => setReplyingTo(null)}
                    onReplySubmit={(_, text) => submitReply(c.id, text)}
                    showReply={idx === replies.length - 1}
                    highlighted={highlightedSequence === r.sequence}
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
            <CommentEditor
              taskId={taskId}
              placeholder="Napiš komentář…"
              onSubmit={submit}
              onCancel={() => setComposing(false)}
            />
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
