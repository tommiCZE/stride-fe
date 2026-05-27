import { useMemo } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useReleaseTasks } from '../../../hooks/useReleases';
import { buildReleaseNotes } from '../utils/build-release-notes';
import { DownloadIcon, OpenInNewIcon } from '../../../components/icons/icons';
import type { ReleaseDto } from '../../../api/types';

const TASK_KEY_RE = /^([A-Z]+-\d+)$/;

interface Props {
  release: ReleaseDto;
  projectKey: string;
}

export default function ReleaseNotesTab({ release, projectKey }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { data: tasks = [] } = useReleaseTasks(release.id);
  const markdown = useMemo(() => buildReleaseNotes(release, tasks), [release, tasks]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      enqueueSnackbar('Release notes zkopírovány', { variant: 'success' });
    } catch {
      enqueueSnackbar('Kopírování selhalo', { variant: 'error' });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      enqueueSnackbar('Odkaz zkopírován', { variant: 'success' });
    } catch {
      enqueueSnackbar('Kopírování odkazu selhalo', { variant: 'error' });
    }
  };

  return (
    <Stack spacing={2} sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <Button size="small" variant="outlined" onClick={handleCopy}>
          Kopírovat markdown
        </Button>
        <Button size="small" variant="text" startIcon={<OpenInNewIcon/>} onClick={handleShare}>
          Sdílet odkaz
        </Button>
        <Button size="small" variant="text" startIcon={<DownloadIcon/>} disabled>
          Export PDF
        </Button>
      </Stack>

      <Box sx={{
        border: 1, borderColor: 'divider', borderRadius: 1.5,
        bgcolor: 'background.paper', px: 3, py: 2.5,
        maxWidth: 880,
        '& h1': { fontSize: 24, fontWeight: 700, mt: 0, mb: 1.5, fontFamily: '"JetBrains Mono", ui-monospace, monospace' },
        '& h2': { fontSize: 16, fontWeight: 700, mt: 2.5, mb: 1, letterSpacing: '0.01em' },
        '& p': { fontSize: 14, lineHeight: 1.6, my: 1 },
        '& blockquote': {
          borderLeft: 3, borderColor: 'primary.main',
          pl: 1.5, ml: 0, my: 1.5, color: 'text.secondary',
          fontStyle: 'italic',
        },
        '& ul': { pl: 3, my: 1 },
        '& li': { fontSize: 14, lineHeight: 1.7 },
        '& code': {
          bgcolor: 'action.hover', px: 0.6, py: 0.1, borderRadius: 0.5,
          fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 12,
        },
        '& a': { color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
      }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            strong: ({ children }) => {
              const text = Array.isArray(children) ? children.join('') : String(children);
              const match = TASK_KEY_RE.exec(text);
              if (match) {
                return (
                  <Box
                    component="span"
                    onClick={() => navigate(`/projects/${projectKey}/board?task=${match[1]}`)}
                    sx={{
                      fontWeight: 700,
                      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                      color: 'primary.main', cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {match[1]}
                  </Box>
                );
              }
              return <strong>{children}</strong>;
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </Box>

      {tasks.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Až sem přidáš tasky a označíš je jako Done, automaticky se objeví v release notes.
        </Typography>
      )}
    </Stack>
  );
}
