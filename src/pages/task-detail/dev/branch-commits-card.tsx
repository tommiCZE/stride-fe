import { useState } from 'react';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { BranchIcon, CheckIcon, CloseIcon, LinkIcon } from '../../../components/icons/icons';
import { ReviewerAvatar } from './reviewer-avatar';
import type { DevBranch } from '../../../types/dev-activity';

const SHOW_FIRST_COMMITS = 3;

function ProviderIcon({ provider, size = 12 }: { provider: 'gitlab' | 'github'; size?: number }) {
  if (provider === 'gitlab') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.07c-3.2.7-3.87-1.36-3.87-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.55C20.21 21.39 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
    </svg>
  );
}

interface Props {
  branch: DevBranch;
  collapseCommits?: boolean;
  density?: 'compact' | 'comfortable';
}

export function BranchCommitsCard({ branch, collapseCommits = true, density = 'compact' }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [expanded, setExpanded] = useState(false);

  const totalCommits = branch.commits.length;
  const sortedCommits = [...branch.commits].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const showAll = !collapseCommits || expanded || totalCommits <= SHOW_FIRST_COMMITS;
  const visibleCommits = showAll ? sortedCommits : sortedCommits.slice(0, SHOW_FIRST_COMMITS);
  const hiddenCommits = totalCommits - visibleCommits.length;

  const copyBranch = async () => {
    try {
      await navigator.clipboard.writeText(branch.name);
      enqueueSnackbar('Branch zkopírována', { variant: 'success' });
    } catch {
      enqueueSnackbar('Kopírování selhalo', { variant: 'error' });
    }
  };

  const mr = branch.mr;
  const build = branch.build;
  const ciTone = build?.state === 'failed' ? 'error.main'
    : build?.state === 'running' ? 'warning.main'
      : 'success.main';
  const ciKey = build?.state === 'failed' ? 'error'
    : build?.state === 'running' ? 'warning'
      : 'success';

  const rowGap = density === 'compact' ? 0.5 : 0.75;

  return (
    <Box sx={{
      border: 1, borderColor: 'divider', borderRadius: 1.5,
      bgcolor: 'background.paper', overflow: 'hidden',
    }}>
      <Stack
        direction="row"
        spacing={1}
        sx={theme => ({
          alignItems: 'center',
          px: 1.25, py: 0.85,
          bgcolor: alpha(theme.palette.info.main, 0.06),
          borderBottom: 1, borderColor: 'divider',
        })}
      >
        <ProviderIcon provider={branch.provider} size={14}/>
        <Box
          component={branch.url ? 'a' : 'span'}
          href={branch.url || undefined}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            fontFamily: 'ui-monospace, monospace', fontSize: '13px',
            color: 'text.primary', textDecoration: 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: 1, minWidth: 0,
            '&:hover': branch.url ? { color: 'primary.main', textDecoration: 'underline' } : undefined,
          }}
        >
          {branch.name}
        </Box>
        <Tooltip title="Kopírovat název branche">
          <IconButton size="small" onClick={copyBranch} sx={{ p: 0.4 }} aria-label="Kopírovat název branche">
            <LinkIcon/>
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack sx={{ py: 0.5 }}>
        {visibleCommits.map((c, idx) => {
          const isLast = idx === visibleCommits.length - 1 && hiddenCommits === 0;
          return (
            <Stack
              key={c.sha}
              direction="row"
              spacing={1}
              sx={{
                position: 'relative',
                alignItems: 'center',
                pl: 3.25, pr: 1.25, py: rowGap,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 12, top: 0, bottom: isLast ? '50%' : 0,
                  borderLeft: '1.5px solid',
                  borderColor: 'divider',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: 8.5, top: 'calc(50% - 3.5px)',
                  width: 7, height: 7, borderRadius: '50%',
                  bgcolor: 'background.paper',
                  border: '1.5px solid',
                  borderColor: 'text.disabled',
                },
              }}
            >
              <Box component="code" sx={{
                fontFamily: 'ui-monospace, monospace', fontSize: '12px',
                color: 'info.main', flexShrink: 0,
              }}>
                {c.sha}
              </Box>
              <Typography sx={{
                fontSize: '13px', flex: 1, minWidth: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {c.message}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: 'text.disabled', flexShrink: 0 }}>
                {c.author.initials}
              </Typography>
            </Stack>
          );
        })}

        {hiddenCommits > 0 && (
          <Box
            role="button"
            tabIndex={0}
            onClick={() => setExpanded(true)}
            sx={{
              position: 'relative',
              pl: 3.25, pr: 1.25, py: rowGap,
              fontSize: '12px', color: 'text.secondary',
              cursor: 'default',
              '&:hover': { color: 'primary.main' },
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 12, top: 0, bottom: '50%',
                borderLeft: '1.5px solid', borderColor: 'divider',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                left: 8.5, top: 'calc(50% - 1px)', width: 8, height: 0,
                borderBottom: '1.5px solid', borderColor: 'divider',
              },
            }}
          >
            + {hiddenCommits} {hiddenCommits === 1 ? 'starší commit' : hiddenCommits < 5 ? 'starší commity' : 'starších commitů'}
          </Box>
        )}
      </Stack>

      {mr && (
        <Box sx={theme => ({
          borderTop: 1, borderColor: 'divider',
          bgcolor: alpha(theme.palette.warning.main, 0.05),
          px: 1.25, py: 1,
        })}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
            <Box
              component="a"
              href={mr.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontFamily: 'ui-monospace, monospace', fontSize: '13px',
                fontWeight: 700, color: 'info.main', textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              !{mr.id}
            </Box>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.5,
              px: 0.75, py: 0.15, borderRadius: 1,
              fontSize: '11.5px', fontWeight: 600, textTransform: 'capitalize',
              color: mr.state === 'open' ? 'success.main' : mr.state === 'merged' ? 'secondary.main' : 'error.main',
              bgcolor: theme => alpha(theme.palette[mr.state === 'open' ? 'success' : mr.state === 'merged' ? 'secondary' : 'error'].main, 0.12),
              border: 1,
              borderColor: theme => alpha(theme.palette[mr.state === 'open' ? 'success' : mr.state === 'merged' ? 'secondary' : 'error'].main, 0.4),
            }}>
              {mr.state}
            </Box>
            <Box
              component="a"
              href={mr.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontSize: '13px', fontWeight: 600,
                color: 'text.primary', textDecoration: 'none',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                flex: 1, minWidth: 0,
                '&:hover': { color: 'primary.main' },
              }}
            >
              {mr.title}
            </Box>
          </Stack>
          <Typography sx={{ fontSize: '11.5px', color: 'text.secondary', mb: 0.5 }}>
            <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>+{mr.plus}</Box>{' '}
            <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>−{mr.minus}</Box>{' '}
            · {mr.files} {mr.files === 1 ? 'soubor' : mr.files < 5 ? 'soubory' : 'souborů'}
            <Box component="span" sx={{ ml: 0.5, color: 'text.disabled' }}>→ {mr.base}</Box>
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            {mr.reviewers.length > 0 && (
              <Stack direction="row" spacing={-0.4}>
                {mr.reviewers.map(r => <ReviewerAvatar key={r.user.id} reviewer={r} size={18}/>)}
              </Stack>
            )}
            <Box sx={{ flex: 1 }}/>
            {build && (
              <Tooltip title={
                build.state === 'failed' && build.failedJob
                  ? `${build.failedJob} selhal · ${build.duration}`
                  : `${build.passed}/${build.total} · ${build.duration}`
              }>
                <Box sx={theme => ({
                  display: 'inline-flex', alignItems: 'center', gap: 0.4,
                  px: 0.75, py: 0.15,
                  borderRadius: 1,
                  border: 1, borderColor: alpha(theme.palette[ciKey].main, 0.4),
                  bgcolor: alpha(theme.palette[ciKey].main, 0.10),
                  color: ciTone,
                  fontSize: '11.5px', fontWeight: 600,
                  animation: build.state === 'running' ? 'pulse 1.4s ease-in-out infinite' : undefined,
                  '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.55 } },
                })}>
                  <Box component="span" sx={{ display: 'inline-flex' }}>
                    {build.state === 'failed' ? <CloseIcon/> : build.state === 'running' ? <BranchIcon/> : <CheckIcon/>}
                  </Box>
                  {build.state === 'failed' && build.failedJob
                    ? build.failedJob
                    : `${build.passed}/${build.total} CI`}
                </Box>
              </Tooltip>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
