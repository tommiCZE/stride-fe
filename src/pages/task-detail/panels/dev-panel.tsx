import { useMemo, useState } from 'react';
import { Box, Button, CircularProgress, IconButton, Link, Stack, Tooltip, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { SectionLabel } from '../../../components/ui/ui';
import { CloseIcon, PlusIcon } from '../../../components/icons/icons';
import { useTaskRemoteLinks, useDeleteTaskRemoteLink } from '../../../hooks/useTaskRemoteLinks';
import { useProjects } from '../../../hooks/useProjects';
import { useProjectSettings } from '../../../store/project-settings-store';
import { useAuthStore } from '../../../store/auth-store';
import { timeAgo } from '../../../utils/time';
import type { RemoteLinkProvider, RemoteLinkState, TaskRemoteLinkDto } from '../../../api/types';
import { LinkRemoteDialog } from '../dialogs/link-remote-dialog';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 40);
}

function applyBranchTemplate(template: string, ctx: { key: string; slug: string; type: string; user: string }) {
  return template
    .replace(/\{key\}/g, ctx.key)
    .replace(/\{slug\}/g, ctx.slug)
    .replace(/\{type\}/g, ctx.type)
    .replace(/\{user\}/g, ctx.user);
}

function ProviderIcon({ provider, size = 14 }: { provider: RemoteLinkProvider; size?: number }) {
  if (provider === 'gitlab') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <path fill="#FC6D26" d="m12 21.42 3.68-11.33H8.32z"/>
        <path fill="#E24329" d="M12 21.42 8.32 10.09H3.16z"/>
        <path fill="#FCA326" d="M3.16 10.09 2.04 13.53a.76.76 0 0 0 .28.85L12 21.42z"/>
        <path fill="#E24329" d="M3.16 10.09h5.16L6.1 3.27a.38.38 0 0 0-.72 0z"/>
        <path fill="#FC6D26" d="m12 21.42 3.68-11.33h5.16z"/>
        <path fill="#FCA326" d="m20.84 10.09 1.12 3.44a.76.76 0 0 1-.28.85L12 21.42z"/>
        <path fill="#E24329" d="M20.84 10.09h-5.16l2.22-6.82a.38.38 0 0 1 .72 0z"/>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.07c-3.2.7-3.87-1.36-3.87-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.55C20.21 21.39 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
    </svg>
  );
}

function StateBadge({ state }: { state: RemoteLinkState }) {
  const m = state === 'open'   ? { label: 'Open',   color: '#10b981' }
         : state === 'merged' ? { label: 'Merged', color: '#a855f7' }
         :                      { label: 'Closed', color: '#ef4444' };
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.15,
      borderRadius: 1, fontSize: '13px', fontWeight: 600,
      color: m.color, bgcolor: m.color + '22', border: 1, borderColor: m.color + '55',
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: m.color }}/>
      {m.label}
    </Box>
  );
}

function LinkRow({ link, onUnlink, unlinking }: {
  link: TaskRemoteLinkDto;
  onUnlink: () => void;
  unlinking: boolean;
}) {
  const symbol = link.provider === 'github' ? '#' : '!';
  const numeric = `${symbol}${link.remoteNumber}`;
  return (
    <Box sx={{
      position: 'relative',
      border: 1, borderColor: 'divider', borderRadius: 1.5, p: 1.5,
      '&:hover': { borderColor: 'primary.main' },
      '&:hover .link-row-unlink': { opacity: 1 },
    }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }}>
        <ProviderIcon provider={link.provider} size={14}/>
        <Typography sx={{
          fontSize: '13px', fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          color: 'info.main', fontWeight: 700,
        }}>{numeric}</Typography>
        <StateBadge state={link.state}/>
        <Box sx={{ flex: 1 }}/>
        <Typography sx={{ fontSize: '13px', color: 'text.disabled' }}>{timeAgo(link.updatedAt)}</Typography>
        <Tooltip title="Odpojit">
          <span>
            <IconButton
              className="link-row-unlink"
              size="small"
              onClick={onUnlink}
              disabled={unlinking}
              sx={{ opacity: 0, transition: 'opacity 120ms', p: 0.25 }}
              aria-label="Odpojit"
            >
              <CloseIcon/>
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
      <Link
        href={link.remoteUrl} target="_blank" rel="noopener noreferrer"
        underline="hover"
        sx={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.35, color: 'text.primary' }}
      >
        {link.title}
      </Link>
      <Typography sx={{ fontSize: '13px', color: 'text.secondary', mt: 0.5 }}>
        {link.provider === 'github'
          ? link.repoRef
          : `project #${link.repoRef}`}
      </Typography>
    </Box>
  );
}

interface DevPanelProps {
  taskId: string;
  taskKey: string;
  taskTitle: string;
  projectId: string;
}

function BranchNameCopy({ taskKey, taskTitle, projectId }: Omit<DevPanelProps, 'taskId'>) {
  const { enqueueSnackbar } = useSnackbar();
  const { data: projects = [] } = useProjects();
  const project = projects.find(p => p.id === projectId);
  const projectKey = project?.key ?? taskKey.split('-')[0];
  const { settings } = useProjectSettings(projectKey);
  const user = useAuthStore(s => s.user);

  const branch = applyBranchTemplate(settings.branchNamingTemplate, {
    key: taskKey,
    slug: slugify(taskTitle),
    type: 'feat',
    user: user?.username ?? user?.name?.split(' ')[0]?.toLowerCase() ?? 'me',
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(branch);
      enqueueSnackbar('Branch zkopírována', { variant: 'success' });
    } catch {
      enqueueSnackbar('Kopírování selhalo', { variant: 'error' });
    }
  };

  return (
    <Stack direction="row" spacing={1} sx={{
        mb: 2, p: 1.25, border: 1, borderColor: 'divider', borderRadius: 1.25,
      alignItems: 'center', bgcolor: 'background.paper' }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: 'text.disabled', mb: 0.25 }}>Branch name</Typography>
        <Typography sx={{ fontFamily: 'ui-monospace, monospace', fontSize: '14px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {branch}
        </Typography>
      </Box>
      <Button size="small" variant="outlined" onClick={handleCopy}>Copy</Button>
    </Stack>
  );
}

export function DevPanel({ taskId, taskKey, taskTitle, projectId }: DevPanelProps) {
  const { data: links = [], isLoading } = useTaskRemoteLinks(taskId);
  const deleteLink = useDeleteTaskRemoteLink(taskId);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const { data: projects = [] } = useProjects();
  const projectKey = useMemo(
    () => projects.find(p => p.id === projectId)?.key ?? taskKey.split('-')[0],
    [projects, projectId, taskKey],
  );

  const handleUnlink = (linkId: string) => {
    if (!window.confirm('Odebrat tento odkaz?')) return;
    deleteLink.mutate(linkId);
  };

  const linkButton = (
    <Button
      size="small"
      variant="outlined"
      startIcon={<PlusIcon/>}
      onClick={() => setLinkDialogOpen(true)}
    >
      Linkovat MR / PR
    </Button>
  );

  if (isLoading) {
    return (
      <Stack direction="row" sx={{ justifyContent: 'center', py: 3 }}>
        <CircularProgress size={20} thickness={5}/>
      </Stack>
    );
  }

  return (
    <Box>
      <BranchNameCopy taskKey={taskKey} taskTitle={taskTitle} projectId={projectId}/>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
        <SectionLabel>Pull / Merge requests</SectionLabel>
        {links.length > 0 && (
          <Stack direction="row" sx={{
            minWidth: 18, height: 18, borderRadius: 9, px: 0.6, bgcolor: 'action.hover',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, color: 'text.secondary',
          }}>{links.length}</Stack>
        )}
        <Box sx={{ flex: 1 }}/>
        {linkButton}
      </Stack>

      {links.length === 0 ? (
        <Box sx={{
          p: 3, textAlign: 'center', border: 1, borderStyle: 'dashed',
          borderColor: 'divider', borderRadius: 1.5, color: 'text.secondary',
        }}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mb: 1.5 }}>
            <ProviderIcon provider="github" size={22}/>
            <ProviderIcon provider="gitlab" size={22}/>
          </Stack>
          <Typography sx={{ fontSize: 13.5, fontWeight: 600, mb: 0.5 }}>Žádná dev aktivita</Typography>
          <Typography sx={{ fontSize: '14px' }}>
            Otevři PR nebo MR s <code>{taskKey}</code> v titulu nebo názvu větve a Stride ho automaticky propojí
            — nebo ho propoj ručně tlačítkem výše.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {links.map(l => (
            <LinkRow
              key={l.id}
              link={l}
              onUnlink={() => handleUnlink(l.id)}
              unlinking={deleteLink.isPending}
            />
          ))}
        </Stack>
      )}

      <LinkRemoteDialog
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        taskId={taskId}
        projectKey={projectKey}
      />
    </Box>
  );
}
