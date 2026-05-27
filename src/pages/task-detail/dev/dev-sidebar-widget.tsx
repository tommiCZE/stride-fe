import { Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { SectionLabel } from '../../../components/ui/ui';
import { BranchIcon, LinkIcon, PlusIcon } from '../../../components/icons/icons';
import { useDevActivity } from '../../../hooks/useDevActivity';
import { useProjects } from '../../../hooks/useProjects';
import { useProjectSettings } from '../../../store/project-settings-store';
import { useAuthStore } from '../../../store/auth-store';
import { BranchCommitsCard } from './branch-commits-card';

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

interface Props {
  taskId: string;
  taskKey: string;
  taskTitle: string;
  projectId: string;
}

export function DevSidebarWidget({ taskId: _taskId, taskKey, taskTitle, projectId }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const dev = useDevActivity(taskKey);
  const { data: projects = [] } = useProjects();
  const project = projects.find(p => p.id === projectId);
  const projectKey = project?.key ?? taskKey.split('-')[0];
  const { settings } = useProjectSettings(projectKey);
  const user = useAuthStore(s => s.user);

  const suggestedBranch = applyBranchTemplate(settings.branchNamingTemplate, {
    key: taskKey,
    slug: slugify(taskTitle),
    type: 'feat',
    user: user?.username ?? user?.name?.split(' ')[0]?.toLowerCase() ?? 'me',
  });

  const copySuggest = async () => {
    try {
      await navigator.clipboard.writeText(suggestedBranch);
      enqueueSnackbar('Suggest zkopírován', { variant: 'success' });
    } catch {
      enqueueSnackbar('Kopírování selhalo', { variant: 'error' });
    }
  };

  const branches = dev.branches;

  return (
    <Stack spacing={1}>
      <SectionLabel>Vývoj</SectionLabel>

      {branches.length === 0 ? (
        <Box sx={{
          p: 2, textAlign: 'center',
          border: 1, borderStyle: 'dashed', borderColor: 'divider', borderRadius: 1.5,
        }}>
          <Box sx={{ display: 'inline-flex', color: 'text.disabled', mb: 0.5 }}>
            <BranchIcon/>
          </Box>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, mb: 0.25 }}>Žádný branch</Typography>
          <Typography sx={{ fontSize: '12px', color: 'text.secondary', mb: 1 }}>
            Vytvoř větev s <Box component="code" sx={{ fontFamily: 'ui-monospace, monospace', fontSize: '11.5px' }}>{taskKey}</Box> v názvu
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{
            mb: 1, p: 0.75, border: 1, borderColor: 'divider', borderRadius: 1,
            bgcolor: 'background.paper', alignItems: 'center',
          }}>
            <Box sx={{
              flex: 1, minWidth: 0, textAlign: 'left',
              fontFamily: 'ui-monospace, monospace', fontSize: '12px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {suggestedBranch}
            </Box>
            <Tooltip title="Kopírovat suggest">
              <IconButton size="small" onClick={copySuggest} sx={{ p: 0.4 }} aria-label="Kopírovat suggest">
                <LinkIcon/>
              </IconButton>
            </Tooltip>
          </Stack>
          <Button size="small" variant="outlined" startIcon={<PlusIcon/>}>
            Vytvořit branch
          </Button>
        </Box>
      ) : (
        <Stack spacing={1}>
          {branches.map(b => (
            <Box key={b.name}>
              <BranchCommitsCard branch={b}/>
              {b.url && (
                <Box sx={{ mt: 0.75, textAlign: 'right' }}>
                  <Box
                    component="a"
                    href={b.mr?.url ?? b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      fontSize: '12px', color: 'primary.main', textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Otevřít v {b.provider === 'gitlab' ? 'GitLabu' : 'GitHubu'} ↗
                  </Box>
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
