import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import FluxAvatar from '../../../components/flux-avatar';
import FilterChip from '../../../components/ui/filter-chip';
import { AttachIcon, BranchIcon, CheckIcon, CloseIcon } from '../../../components/icons/icons';
import { useComments, useCreateComment } from '../../../hooks/useComments';
import { useActivity } from '../../../hooks/useActivity';
import { useAttachments, useUploadAttachment } from '../../../hooks/useAttachments';
import { useDevActivity } from '../../../hooks/useDevActivity';
import { useAuthStore } from '../../../store/auth-store';
import { CommentEditor, CommentItem, timeAgo, exactDate } from './comments';
import type { ActivityItemDto, CommentDto } from '../../../api/types';
import type { Attachment } from '../../../api/attachments';
import type {
  DevBranch, DevBuild, DevCommit, DevMergeRequest, DevReviewEvent,
} from '../../../types/dev-activity';

type StreamFilter = 'all' | 'comments' | 'changes' | 'dev' | 'attachments';

const FILTER_STORAGE_KEY = 'flux.activity.defaultFilter';

interface TopLevelComment {
  comment: CommentDto;
  replies: CommentDto[];
}

type StreamItem =
  | { kind: 'comment';     at: string; sortAt: string; data: TopLevelComment }
  | { kind: 'event';       at: string; sortAt: string; data: ActivityItemDto }
  | { kind: 'attachment';  at: string; sortAt: string; data: Attachment }
  | { kind: 'branch';      at: string; sortAt: string; data: { branch: DevBranch } }
  | { kind: 'push';        at: string; sortAt: string; data: { branch: DevBranch; commits: DevCommit[] } }
  | { kind: 'mr-open';     at: string; sortAt: string; data: { mr: DevMergeRequest } }
  | { kind: 'mr-merge';    at: string; sortAt: string; data: { mr: DevMergeRequest } }
  | { kind: 'ci';          at: string; sortAt: string; data: { build: DevBuild } }
  | { kind: 'review';      at: string; sortAt: string; data: DevReviewEvent };

function classifyEvent(kind: StreamItem['kind']): 'comments' | 'changes' | 'dev' | 'attachments' {
  if (kind === 'comment') return 'comments';
  if (kind === 'event') return 'changes';
  if (kind === 'attachment') return 'attachments';
  return 'dev';
}

function loadDefaultFilter(): StreamFilter {
  try {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY) as StreamFilter | null;
    if (saved && ['all', 'comments', 'changes', 'dev', 'attachments'].includes(saved)) return saved;
  } catch { /* localStorage may be unavailable */ }
  return 'all';
}

function renderEventText(event: ActivityItemDto): React.ReactNode {
  const { action, target, fromValue, toValue } = event;
  const mono = (v: string) => (
    <Box component="code" sx={{ fontFamily: 'ui-monospace, monospace', fontSize: '12px', color: 'text.primary' }}>{v}</Box>
  );
  const strong = (v: string) => (
    <Box component="strong" sx={{ color: 'text.primary', fontWeight: 600 }}>{v}</Box>
  );
  if (fromValue && toValue) return <>{action} {target ?? ''} z {mono(fromValue)} na {mono(toValue)}</>;
  if (toValue) return <>{action} {target ? `${target} ` : ''}na {strong(toValue)}</>;
  if (fromValue) return <>{action} {target ? `${target} ` : ''}— bylo {mono(fromValue)}</>;
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentEventItem({ attachment, currentUserId, onDelete }: {
  attachment: Attachment;
  currentUserId: string | null | undefined;
  onDelete: (a: Attachment) => void;
}) {
  const isImage = attachment.contentType.startsWith('image/');
  const canDelete = !attachment.createdBy || attachment.createdBy === currentUserId;
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Box sx={{ display: 'inline-flex', width: 24, height: 24, alignItems: 'center', justifyContent: 'center', color: 'text.disabled' }}>
        <AttachIcon/>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          Příloha nahrána{' '}
          <Tooltip title={exactDate(attachment.createdAt)} placement="top">
            <Box component="span" sx={{ color: 'text.disabled', cursor: 'help' }}>
              · {timeAgo(attachment.createdAt)}
            </Box>
          </Tooltip>
        </Typography>
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 1.25,
          p: 1, border: 1, borderColor: 'divider', borderRadius: 1.25,
          bgcolor: 'background.paper', maxWidth: '100%',
        }}>
          {isImage ? (
            <Box
              component="img"
              src={attachment.url}
              alt={attachment.fileName}
              sx={{ width: 40, height: 40, borderRadius: 0.75, objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <Box sx={{
              width: 40, height: 40, borderRadius: 0.75, bgcolor: 'action.hover',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: 'text.secondary', flexShrink: 0,
            }}>
              {attachment.contentType.split('/')[1]?.slice(0, 3).toUpperCase() ?? 'FILE'}
            </Box>
          )}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box
              component="a"
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontSize: '13.5px', fontWeight: 600, color: 'text.primary',
                textDecoration: 'none', display: 'block',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                '&:hover': { color: 'primary.main' },
              }}
            >
              {attachment.fileName}
            </Box>
            <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>
              {formatBytes(attachment.sizeBytes)}
            </Typography>
          </Box>
          {canDelete && (
            <Tooltip title="Smazat">
              <IconButton size="small" onClick={() => onDelete(attachment)} sx={{ p: 0.5 }} aria-label="Smazat přílohu">
                <CloseIcon/>
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Stack>
  );
}

function DevHeaderLine({ user, children, at }: { user: { name: string }; children: React.ReactNode; at: string }) {
  return (
    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
      <Box component="strong" sx={{ color: 'text.primary', fontWeight: 600 }}>{user.name.split(' ')[0]}</Box>{' '}
      {children}{' '}
      <Tooltip title={exactDate(at)} placement="top">
        <Box component="span" sx={{ color: 'text.disabled', cursor: 'help', ml: 0.5 }}>· {timeAgo(at)}</Box>
      </Tooltip>
    </Typography>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <Box component="code" sx={{ fontFamily: 'ui-monospace, monospace', fontSize: '12px', color: 'text.primary' }}>
      {children}
    </Box>
  );
}

function BranchEventItem({ branch, at }: { branch: DevBranch; at: string }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', py: 0.25 }}>
      <FluxAvatar user={branch.createdBy} size={20}/>
      <DevHeaderLine user={branch.createdBy} at={at}>
        vytvořil branch <Mono>{branch.name}</Mono> v <Mono>{branch.repo}</Mono>
      </DevHeaderLine>
    </Stack>
  );
}

function PushEventItem({ branch, commits, at }: { branch: DevBranch; commits: DevCommit[]; at: string }) {
  const author = commits[0]?.author ?? branch.createdBy;
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <FluxAvatar user={author} size={20}/>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <DevHeaderLine user={author} at={at}>
          pushnul {commits.length} {commits.length === 1 ? 'commit' : commits.length < 5 ? 'commity' : 'commitů'} do <Mono>{branch.name}</Mono>
        </DevHeaderLine>
        <Box sx={theme => ({
          mt: 0.5, border: 1, borderColor: 'divider', borderRadius: 1.25,
          bgcolor: alpha(theme.palette.info.main, 0.04),
        })}>
          <Stack direction="row" spacing={0.75} sx={{
            alignItems: 'center', px: 1.25, py: 0.75,
            borderBottom: 1, borderColor: 'divider',
          }}>
            <BranchIcon/>
            <Mono>{branch.name}</Mono>
          </Stack>
          <Stack>
            {commits.map(c => (
              <Stack key={c.sha} direction="row" spacing={1.25} sx={{ alignItems: 'baseline', px: 1.5, py: 0.6 }}>
                <Mono>{c.sha}</Mono>
                <Typography sx={{ fontSize: '13px', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.message}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: 'text.disabled', flexShrink: 0 }}>
                  {c.author.initials}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
}

function MrCard({ mr, label }: { mr: DevMergeRequest; label: string }) {
  return (
    <Box sx={theme => ({
      mt: 0.5, border: 1, borderColor: 'divider', borderRadius: 1.25,
      bgcolor: alpha(theme.palette.warning.main, 0.04), p: 1.25,
    })}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
        <Box component="span" sx={{
          fontFamily: 'ui-monospace, monospace', fontSize: '13px', fontWeight: 700, color: 'info.main',
        }}>!{mr.id}</Box>
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.15,
          borderRadius: 1, fontSize: '12px', fontWeight: 600,
          color: 'success.main', bgcolor: 'success.main' + '22', border: 1, borderColor: 'success.main' + '55',
        }}>{label}</Box>
        <Box sx={{ flex: 1 }}/>
        <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>→ {mr.base}</Typography>
      </Stack>
      <Box
        component="a"
        href={mr.url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
      >
        {mr.title}
      </Box>
      <Typography sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.25 }}>
        <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>+{mr.plus}</Box>{' '}
        <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>−{mr.minus}</Box>{' '}
        · {mr.files} {mr.files === 1 ? 'soubor' : mr.files < 5 ? 'soubory' : 'souborů'}
      </Typography>
    </Box>
  );
}

function MrOpenEventItem({ mr, at }: { mr: DevMergeRequest; at: string }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <FluxAvatar user={mr.openedBy} size={20}/>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <DevHeaderLine user={mr.openedBy} at={at}>
          otevřel MR <Mono>!{mr.id}</Mono>
        </DevHeaderLine>
        <MrCard mr={mr} label="Open"/>
      </Box>
    </Stack>
  );
}

function MrMergeEventItem({ mr, at }: { mr: DevMergeRequest; at: string }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <FluxAvatar user={mr.openedBy} size={20}/>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <DevHeaderLine user={mr.openedBy} at={at}>
          smergoval MR <Mono>!{mr.id}</Mono> do <Mono>{mr.base}</Mono>
        </DevHeaderLine>
        <MrCard mr={mr} label="Merged"/>
      </Box>
    </Stack>
  );
}

function CiEventItem({ build, at }: { build: DevBuild; at: string }) {
  const failed = build.state === 'failed';
  const running = build.state === 'running';
  const tone = failed ? 'error.main' : running ? 'warning.main' : 'success.main';
  const label = failed
    ? `${build.passed}/${build.total} checks${build.failedJob ? ` · ${build.failedJob}` : ''}`
    : running
      ? `běží · ${build.passed}/${build.total}`
      : `${build.passed}/${build.total} checks prošlo`;
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Box sx={theme => ({
        width: 20, height: 20, borderRadius: '50%', bgcolor: alpha(theme.palette.action.hover, 1),
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: tone, flexShrink: 0,
      })}>
        {failed ? <CloseIcon/> : <CheckIcon/>}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          <Box component="strong" sx={{ color: 'text.primary', fontWeight: 600 }}>CI</Box>{' '}
          {failed ? 'spadlo' : running ? 'běží' : 'prošlo'}
          {build.mrId && <> na MR <Mono>!{build.mrId}</Mono></>}{' '}
          <Tooltip title={exactDate(at)} placement="top">
            <Box component="span" sx={{ color: 'text.disabled', cursor: 'help', ml: 0.5 }}>· {timeAgo(at)}</Box>
          </Tooltip>
        </Typography>
        <Box sx={theme => ({
          display: 'inline-block', mt: 0.5, px: 1, py: 0.4,
          border: 1, borderColor: alpha(theme.palette[failed ? 'error' : running ? 'warning' : 'success'].main, 0.4),
          bgcolor: alpha(theme.palette[failed ? 'error' : running ? 'warning' : 'success'].main, 0.08),
          color: tone, fontSize: '12px', fontWeight: 600, borderRadius: 1,
        })}>
          {failed ? '⚠ ' : running ? '⋯ ' : '✓ '}{label}
          {build.duration && <Box component="span" sx={{ color: 'text.disabled', ml: 1 }}>{build.duration}</Box>}
        </Box>
      </Box>
    </Stack>
  );
}

function ReviewEventItem({ review }: { review: DevReviewEvent }) {
  const tone = review.verdict === 'approved' ? 'success.main'
    : review.verdict === 'changes' ? 'error.main'
      : 'warning.main';
  const verb = review.verdict === 'approved' ? 'schválil'
    : review.verdict === 'changes' ? 'požaduje změny v'
      : 'okomentoval';
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <FluxAvatar user={review.reviewer} size={20}/>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <DevHeaderLine user={review.reviewer} at={review.at}>
          {verb} MR <Mono>!{review.mrId}</Mono>
        </DevHeaderLine>
        {review.body && (
          <Box sx={theme => ({
            mt: 0.5, p: 1.25, borderRadius: 1.25,
            borderLeft: 3, borderColor: tone,
            bgcolor: alpha(theme.palette.action.hover, 0.5),
            fontSize: '13.5px', color: 'text.primary',
          })}>
            {review.body}
          </Box>
        )}
      </Box>
    </Stack>
  );
}

interface Props {
  taskId: string;
  taskKey: string;
}

export function ActivityStream({ taskId, taskKey }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { data: comments = [], isLoading: commentsLoading } = useComments(taskId);
  const { data: events = [], isLoading: eventsLoading } = useActivity(taskId);
  const { data: attachments = [], isLoading: attachmentsLoading } = useAttachments(taskId);
  const dev = useDevActivity(taskKey);
  const createComment = useCreateComment(taskId);
  const upload = useUploadAttachment(taskId);
  const me = useAuthStore(s => s.user);
  const meId = useAuthStore(s => s.userId);

  const [filter, setFilter] = useState<StreamFilter>(loadDefaultFilter);
  const [composingComment, setComposingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try { localStorage.setItem(FILTER_STORAGE_KEY, filter); } catch { /* ignore */ }
  }, [filter]);

  const isLoading = commentsLoading || eventsLoading || attachmentsLoading;
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
      items.push({ kind: 'comment', at: top.createdAt, sortAt: latestAt, data: { comment: top, replies } });
    }

    for (const e of events) {
      items.push({ kind: 'event', at: e.createdAt, sortAt: e.createdAt, data: e });
    }

    for (const a of attachments) {
      items.push({ kind: 'attachment', at: a.createdAt, sortAt: a.createdAt, data: a });
    }

    for (const b of dev.branches) {
      items.push({ kind: 'branch', at: b.createdAt, sortAt: b.createdAt, data: { branch: b } });

      if (b.commits.length > 0) {
        const lastAt = b.commits.reduce((acc, c) => (c.at > acc ? c.at : acc), b.commits[0]!.at);
        items.push({ kind: 'push', at: lastAt, sortAt: lastAt, data: { branch: b, commits: b.commits } });
      }

      if (b.mr) {
        items.push({ kind: 'mr-open', at: b.mr.openedAt, sortAt: b.mr.openedAt, data: { mr: b.mr } });
        if (b.mr.mergedAt) {
          items.push({ kind: 'mr-merge', at: b.mr.mergedAt, sortAt: b.mr.mergedAt, data: { mr: b.mr } });
        }
      }

      if (b.build?.at) {
        items.push({ kind: 'ci', at: b.build.at, sortAt: b.build.at, data: { build: b.build } });
      }
    }

    for (const r of dev.reviews) {
      items.push({ kind: 'review', at: r.at, sortAt: r.at, data: r });
    }

    return items.sort((a, b) => new Date(a.sortAt).getTime() - new Date(b.sortAt).getTime());
  }, [comments, events, attachments, dev]);

  const counts = useMemo(() => {
    let c = 0, ch = 0, d = 0, a = 0;
    for (const item of stream) {
      const cat = classifyEvent(item.kind);
      if (cat === 'comments') c++;
      else if (cat === 'changes') ch++;
      else if (cat === 'dev') d++;
      else if (cat === 'attachments') a++;
    }
    return { total: stream.length, comments: c, changes: ch, dev: d, attachments: a };
  }, [stream]);

  const filtered = useMemo(() => {
    if (filter === 'all') return stream;
    return stream.filter(i => classifyEvent(i.kind) === filter);
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

  const handleAttach = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      try {
        await upload.mutateAsync(file);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Chyba uploadu';
        enqueueSnackbar(`Chyba uploadu: ${msg}`, { variant: 'error' });
        return;
      }
    }
    enqueueSnackbar('Příloha nahrána', { variant: 'success' });
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <FilterChip label={`Vše · ${counts.total}`}
          active={filter === 'all'} onClick={() => setFilter('all')}/>
        <FilterChip label="Komentáře" count={topLevelComments.length}
          active={filter === 'comments'} onClick={() => setFilter('comments')}/>
        <FilterChip label="Změny" count={counts.changes}
          active={filter === 'changes'} onClick={() => setFilter('changes')}/>
        <FilterChip label="Vývoj" count={counts.dev}
          active={filter === 'dev'} onClick={() => setFilter('dev')}/>
        <FilterChip label="Přílohy" count={counts.attachments}
          active={filter === 'attachments'} onClick={() => setFilter('attachments')}/>
        <Box sx={{ flex: 1 }}/>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={e => { void handleAttach(e.target.files); e.target.value = ''; }}
        />
        <Button
          size="small"
          variant="outlined"
          startIcon={<AttachIcon/>}
          disabled={upload.isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          {upload.isPending ? 'Nahrávám…' : 'Příloha'}
        </Button>
      </Stack>

      {isLoading && <CircularProgress size={16}/>}

      <Stack spacing={1.75}>
        {filtered.length === 0 && !isLoading && (
          <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
            Žádná aktivita pro tento filtr
          </Typography>
        )}

        {filtered.map(item => {
          if (item.kind === 'event')      return <SystemEventItem key={`e-${item.data.id}`} event={item.data}/>;
          if (item.kind === 'attachment') return <AttachmentEventItem key={`a-${item.data.id}`} attachment={item.data} currentUserId={meId} onDelete={() => { /* delete handled in dedicated tab — could wire here */ }}/>;
          if (item.kind === 'branch')     return <BranchEventItem key={`br-${item.data.branch.name}`} branch={item.data.branch} at={item.at}/>;
          if (item.kind === 'push')       return <PushEventItem key={`push-${item.data.branch.name}-${item.at}`} branch={item.data.branch} commits={item.data.commits} at={item.at}/>;
          if (item.kind === 'mr-open')    return <MrOpenEventItem key={`mro-${item.data.mr.id}`} mr={item.data.mr} at={item.at}/>;
          if (item.kind === 'mr-merge')   return <MrMergeEventItem key={`mrm-${item.data.mr.id}`} mr={item.data.mr} at={item.at}/>;
          if (item.kind === 'ci')         return <CiEventItem key={`ci-${item.at}`} build={item.data.build} at={item.at}/>;
          if (item.kind === 'review')     return <ReviewEventItem key={`rv-${item.data.id}`} review={item.data}/>;

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
              <Typography variant="caption" color="text.disabled">
                Napiš komentář, <Box component="code" sx={{ fontFamily: 'ui-monospace, monospace', fontSize: '12px' }}>/commit</Box> pro odkaz na commit, @ pro mention…
              </Typography>
            </Box>
          )}
        </Box>
      </Stack>
    </Stack>
  );
}
