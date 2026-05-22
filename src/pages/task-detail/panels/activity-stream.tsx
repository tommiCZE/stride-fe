import { useMemo, useState } from 'react';
import { Box, Button, CircularProgress, Stack, Tooltip, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import FluxAvatar from '../../../components/flux-avatar';
import FilterChip from '../../../components/ui/filter-chip';
import { WorklogComposer } from '../../../components/worklog-composer';
import { useComments, useCreateComment } from '../../../hooks/useComments';
import { useActivity } from '../../../hooks/useActivity';
import { useWorklogs } from '../../../hooks/useWorklogs';
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
    <Box component="code" sx={{ fontFamily: 'ui-monospace, monospace', fontSize: '12px', color: 'text.primary' }}>
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
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', py: 0.25 }}>
      <FluxAvatar user={event.user} size={20}/>
      <Typography variant="caption" color="text.secondary" sx={{ flex: 1, lineHeight: 1.6 }}>
        <Box component="strong" sx={{ color: 'text.primary', fontWeight: 600 }}>
          {event.user.name.split(' ')[0]}
        </Box>{' '}
        {renderEventText(event)}{' '}
        <Tooltip title={exactDate(event.createdAt)} placement="top">
          <Box component="span" sx={{ color: 'text.disabled', cursor: 'help', ml: 0.5 }}>
            · {timeAgo(event.createdAt)}
          </Box>
        </Tooltip>
      </Typography>
    </Stack>
  );
}

function WorklogItem({ worklog }: { worklog: WorklogDto }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
      <FluxAvatar user={worklog.user} size={24}/>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', mb: 0.25, flexWrap: 'wrap' }}>
          <Typography component="span" sx={{ fontSize: '13.5px', fontWeight: 600 }}>
            {worklog.user.name}
          </Typography>
          <Typography component="span" sx={{ fontSize: '11.5px', color: 'text.disabled' }}>
            zalogoval{' '}
            <Box component="strong" sx={{ color: 'primary.main', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {(worklog.minutes / 60).toFixed(1)}h
            </Box>
          </Typography>
          <Tooltip title={worklog.loggedAt} placement="top">
            <Typography component="span" sx={{ fontSize: '11.5px', color: 'text.disabled', cursor: 'help' }}>
              · {worklog.loggedAt}
            </Typography>
          </Tooltip>
        </Stack>
        {worklog.comment && (
          <Typography sx={{ fontSize: '13.5px', color: 'text.primary' }}>
            {worklog.comment}
          </Typography>
        )}
      </Box>
    </Stack>
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
    <Stack spacing={2}>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
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
      </Stack>

      {isLoading && <CircularProgress size={16}/>}

      {composingWorklog && (
        <WorklogComposer taskId={taskId} onClose={() => setComposingWorklog(false)}/>
      )}

      <Stack spacing={1.75}>
        {filtered.length === 0 && !isLoading && (
          <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
            Žádná aktivita pro tento filtr
          </Typography>
        )}

        {filtered.map(item => {
          if (item.kind === 'event')   return <SystemEventItem key={`e-${item.data.id}`} event={item.data}/>;
          if (item.kind === 'worklog') return <WorklogItem    key={`w-${item.data.id}`} worklog={item.data}/>;

          const { comment, replies } = item.data;
          return (
            <Stack key={`c-${comment.id}`} spacing={1.25}>
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
                <Stack spacing={1.5} sx={{ ml: 3.5 }}>
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
                </Stack>
              )}
            </Stack>
          );
        })}
      </Stack>

      <Stack direction="row" spacing={1.25} sx={{ mt: 1 }}>
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
                bgcolor: 'background.paper', color: 'text.disabled',
                cursor: 'text', '&:hover': { borderColor: 'primary.main' } }}>
              <Typography variant="caption" color="text.disabled">Napiš komentář…</Typography>
            </Box>
          )}
        </Box>
      </Stack>
    </Stack>
  );
}
