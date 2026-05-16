import { useMemo, useState } from 'react';
import { Box, Button, CircularProgress, InputBase, Tooltip, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import FluxAvatar from '../../../components/flux-avatar';
import FilterChip from '../../../components/ui/filter-chip';
import { useComments, useCreateComment } from '../../../hooks/useComments';
import { useActivity } from '../../../hooks/useActivity';
import { useWorklogs, useCreateWorklog } from '../../../hooks/useWorklogs';
import { useAuthStore } from '../../../store/auth-store';
import { CommentEditor, CommentItem, timeAgo, exactDate } from './comments';
import type { ActivityItemDto, CommentDto, WorklogDto } from '../../../api/types';

type StreamFilter = 'all' | 'comments' | 'changes' | 'work';

interface TopLevelComment {
  comment: CommentDto;
  replies: CommentDto[];
}

type StreamItem =
  | { kind: 'comment'; at: string; sortAt: string; data: TopLevelComment }
  | { kind: 'event';   at: string; sortAt: string; data: ActivityItemDto }
  | { kind: 'worklog'; at: string; sortAt: string; data: WorklogDto };

function renderEventText(event: ActivityItemDto): React.ReactNode {
  const { action, target, fromValue, toValue } = event;

  const mono = (v: string) => (
    <Box component="code" sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: 'text.primary' }}>
      {v}
    </Box>
  );
  const strong = (v: string) => (
    <Box component="strong" sx={{ color: 'text.primary', fontWeight: 600 }}>{v}</Box>
  );

  if (fromValue && toValue) {
    return <>{action} {target ?? ''} z {mono(fromValue)} na {mono(toValue)}</>;
  }
  if (toValue) {
    return <>{action} {target ? `${target} ` : ''}na {strong(toValue)}</>;
  }
  if (fromValue) {
    return <>{action} {target ? `${target} ` : ''}— bylo {mono(fromValue)}</>;
  }
  return <>{action}{target ? ` ${target}` : ''}</>;
}

function SystemEventItem({ event }: { event: ActivityItemDto }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', py: 0.25 }}>
      <FluxAvatar user={event.user} size={20}/>
      <Box sx={{ flex: 1, fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
        <Box component="strong" sx={{ color: 'text.primary', fontWeight: 600 }}>
          {event.user.name.split(' ')[0]}
        </Box>{' '}
        {renderEventText(event)}{' '}
        <Tooltip title={exactDate(event.createdAt)} placement="top">
          <Box component="span" sx={{ color: 'text.disabled', cursor: 'help', ml: 0.5 }}>
            · {timeAgo(event.createdAt)}
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
}

function WorklogItem({ worklog }: { worklog: WorklogDto }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
      <FluxAvatar user={worklog.user} size={24}/>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.25, flexWrap: 'wrap' }}>
          <Typography component="span" sx={{ fontSize: 13.5, fontWeight: 600 }}>
            {worklog.user.name}
          </Typography>
          <Typography component="span" sx={{ fontSize: 11.5, color: 'text.disabled' }}>
            zalogoval{' '}
            <Box component="strong" sx={{ color: 'primary.main', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {(worklog.minutes / 60).toFixed(1)}h
            </Box>
          </Typography>
          <Tooltip title={worklog.loggedAt} placement="top">
            <Typography component="span" sx={{ fontSize: 11.5, color: 'text.disabled', cursor: 'help' }}>
              · {worklog.loggedAt}
            </Typography>
          </Tooltip>
        </Box>
        {worklog.comment && (
          <Typography sx={{ fontSize: 13.5, color: 'text.primary' }}>
            {worklog.comment}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

interface WorklogComposerProps {
  taskId: string;
  onClose: () => void;
}

function WorklogComposer({ taskId, onClose }: WorklogComposerProps) {
  const { enqueueSnackbar } = useSnackbar();
  const createWorklog = useCreateWorklog(taskId);
  const [hours, setHours] = useState('');
  const [comment, setComment] = useState('');

  const submit = () => {
    const mins = Math.round(parseFloat(hours) * 60);
    if (isNaN(mins) || mins <= 0) return;
    createWorklog.mutate(
      { minutes: mins, loggedAt: new Date().toISOString().slice(0, 10), comment: comment || undefined },
      {
        onSuccess: () => {
          enqueueSnackbar('Worklog uložen', { variant: 'success' });
          onClose();
        },
      },
    );
  };

  return (
    <Box sx={{
      p: 1.5, border: 1, borderColor: 'primary.main', borderRadius: 1.5,
      display: 'flex', flexDirection: 'column', gap: 1, bgcolor: 'background.paper',
    }}>
      <InputBase
        placeholder="Hodiny (např. 1.5)"
        value={hours}
        onChange={e => setHours(e.target.value)}
        autoFocus
        sx={{ border: 1, borderColor: 'divider', borderRadius: 0.5, px: 1, fontSize: 14, width: 160 }}
      />
      <InputBase
        placeholder="Poznámka (volitelné)"
        value={comment}
        onChange={e => setComment(e.target.value)}
        fullWidth
        sx={{ border: 1, borderColor: 'divider', borderRadius: 0.5, px: 1, fontSize: 14 }}
      />
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button size="small" onClick={onClose} disabled={createWorklog.isPending}>Zrušit</Button>
        <Button size="small" variant="contained" onClick={submit} disabled={createWorklog.isPending}>
          Uložit záznam
        </Button>
      </Box>
    </Box>
  );
}

export function ActivityStream({ taskId }: { taskId: string }) {
  const { enqueueSnackbar } = useSnackbar();
  const { data: comments = [], isLoading: commentsLoading } = useComments(taskId);
  const { data: events = [], isLoading: eventsLoading } = useActivity(taskId);
  const { data: worklogs = [], isLoading: worklogsLoading } = useWorklogs(taskId);
  const createComment = useCreateComment(taskId);
  const me = useAuthStore(s => s.user);

  const [filter, setFilter] = useState<StreamFilter>('all');
  const [composingComment, setComposingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [composingWorklog, setComposingWorklog] = useState(false);

  const isLoading = commentsLoading || eventsLoading || worklogsLoading;
  const topLevelComments = comments.filter(c => !c.parentCommentId);

  const stream = useMemo<StreamItem[]>(() => {
    const items: StreamItem[] = [];

    const repliesByParent = new Map<string, CommentDto[]>();
    for (const c of comments) {
      if (!c.parentCommentId) continue;
      const arr = repliesByParent.get(c.parentCommentId) ?? [];
      arr.push(c);
      repliesByParent.set(c.parentCommentId, arr);
    }

    for (const top of comments.filter(c => !c.parentCommentId)) {
      const replies = repliesByParent.get(top.id) ?? [];
      const latestAt = replies.length > 0
        ? replies.reduce((acc, r) => (r.createdAt > acc ? r.createdAt : acc), top.createdAt)
        : top.createdAt;
      items.push({
        kind: 'comment',
        at: top.createdAt,
        sortAt: latestAt,
        data: { comment: top, replies },
      });
    }

    for (const e of events) {
      items.push({ kind: 'event', at: e.createdAt, sortAt: e.createdAt, data: e });
    }

    for (const w of worklogs) {
      items.push({ kind: 'worklog', at: w.loggedAt, sortAt: w.loggedAt, data: w });
    }

    return items.sort((a, b) => new Date(a.sortAt).getTime() - new Date(b.sortAt).getTime());
  }, [comments, events, worklogs]);

  const filtered = useMemo(() => {
    if (filter === 'all')      return stream;
    if (filter === 'comments') return stream.filter(i => i.kind === 'comment');
    if (filter === 'changes')  return stream.filter(i => i.kind === 'event');
    if (filter === 'work')     return stream.filter(i => i.kind === 'worklog');
    return stream;
  }, [stream, filter]);

  const submitComment = (text: string) => {
    createComment.mutate({ text }, {
      onSuccess: () => {
        setComposingComment(false);
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
        <FilterChip label="Vše"
          active={filter === 'all'} onClick={() => setFilter('all')}/>
        <FilterChip label="Komentáře" count={topLevelComments.length}
          active={filter === 'comments'} onClick={() => setFilter('comments')}/>
        <FilterChip label="Změny" count={events.length}
          active={filter === 'changes'} onClick={() => setFilter('changes')}/>
        <FilterChip label="Práce" count={worklogs.length}
          active={filter === 'work'} onClick={() => setFilter('work')}/>
        <Box sx={{ flex: 1 }}/>
        <Button
          size="small"
          variant="outlined"
          onClick={() => setComposingWorklog(true)}
          disabled={composingWorklog}
        >
          + Záznam práce
        </Button>
      </Box>

      {isLoading && <CircularProgress size={16}/>}

      {composingWorklog && (
        <WorklogComposer taskId={taskId} onClose={() => setComposingWorklog(false)}/>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        {filtered.length === 0 && !isLoading && (
          <Typography sx={{ fontSize: 14, color: 'text.disabled', py: 2, textAlign: 'center' }}>
            Žádná aktivita pro tento filtr
          </Typography>
        )}

        {filtered.map(item => {
          if (item.kind === 'event')   return <SystemEventItem key={`e-${item.data.id}`} event={item.data}/>;
          if (item.kind === 'worklog') return <WorklogItem    key={`w-${item.data.id}`} worklog={item.data}/>;

          const { comment, replies } = item.data;
          return (
            <Box key={`c-${comment.id}`} sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <CommentItem
                comment={comment}
                taskId={taskId}
                isReply={false}
                replyingTo={replyingTo}
                onReplyClick={id => setReplyingTo(id)}
                onReplyCancel={() => setReplyingTo(null)}
                onReplySubmit={submitReply}
                showReply={replies.length === 0}
              />
              {replies.length > 0 && (
                <Box sx={{ ml: 3.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {replies.map((r, idx) => (
                    <CommentItem
                      key={r.id}
                      comment={r}
                      taskId={taskId}
                      isReply
                      parentAuthorName={comment.user.name}
                      replyingTo={replyingTo}
                      onReplyClick={id => setReplyingTo(id)}
                      onReplyCancel={() => setReplyingTo(null)}
                      onReplySubmit={(_, text) => submitReply(comment.id, text)}
                      showReply={idx === replies.length - 1}
                    />
                  ))}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', gap: 1.25, mt: 1 }}>
        <FluxAvatar user={me} size={28}/>
        <Box sx={{ flex: 1 }}>
          {composingComment ? (
            <CommentEditor
              taskId={taskId}
              placeholder="Napiš komentář…"
              onSubmit={submitComment}
              onCancel={() => setComposingComment(false)}
            />
          ) : (
            <Box onClick={() => setComposingComment(true)}
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
