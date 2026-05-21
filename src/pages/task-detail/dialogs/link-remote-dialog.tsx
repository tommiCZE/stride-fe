import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Stack, Tab, Tabs, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import {
  useCreateTaskRemoteLink,
  useSearchTaskRemoteLinks,
} from '../../../hooks/useTaskRemoteLinks';
import { useGithubIntegration } from '../../../hooks/useGithubIntegration';
import { useGitlabIntegration } from '../../../hooks/useGitlabIntegration';
import { useSubmitShortcut } from '../../../hooks/use-submit-shortcut';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { timeAgo } from '../../../utils/time';
import type { RemoteLinkProvider, RemoteLinkState } from '../../../api/types';

const urlSchema = z.object({
  url: z.string()
    .url('Neplatná URL')
    .refine(
      v => /github\.com\/[^/\s]+\/[^/\s]+\/pull\/\d+/.test(v)
        || /\/-\/merge_requests\/\d+/.test(v),
      'Podporujeme jen GitHub PR a GitLab MR URL.',
    ),
});
type UrlForm = z.infer<typeof urlSchema>;

type LinkMode = 'search' | 'url';

interface LinkRemoteDialogProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  projectKey: string;
}

function StateBadge({ state }: { state: RemoteLinkState }) {
  const m = state === 'open'   ? { label: 'Open',   color: '#10b981' }
         : state === 'merged' ? { label: 'Merged', color: '#a855f7' }
         :                      { label: 'Closed', color: '#ef4444' };
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.6, py: 0.1,
      borderRadius: 1, fontSize: '12px', fontWeight: 600,
      color: m.color, bgcolor: m.color + '22', border: 1, borderColor: m.color + '55',
    }}>
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: m.color }}/>
      {m.label}
    </Box>
  );
}

export function LinkRemoteDialog({ open, onClose, taskId, projectKey }: LinkRemoteDialogProps) {
  const createLink = useCreateTaskRemoteLink(taskId);
  const gh = useGithubIntegration(projectKey);
  const gl = useGitlabIntegration(projectKey);

  const availableProviders = useMemo<RemoteLinkProvider[]>(() => {
    const out: RemoteLinkProvider[] = [];
    if (gh.isConnected) out.push('github');
    if (gl.isConnected) out.push('gitlab');
    return out;
  }, [gh.isConnected, gl.isConnected]);

  const [provider, setProvider] = useState<RemoteLinkProvider | null>(null);
  const [mode, setMode] = useState<LinkMode>('search');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    if (!open) return;
    if (!provider && availableProviders.length > 0) {
      setProvider(availableProviders[0]);
    }
  }, [open, provider, availableProviders]);

  const noIntegrations = availableProviders.length === 0
    && !gh.isLoading && !gl.isLoading;

  const search = useSearchTaskRemoteLinks(
    taskId,
    provider,
    debouncedQuery,
  );

  const { register, handleSubmit, reset: resetUrlForm, formState: { errors } } = useForm<UrlForm>({
    resolver: zodResolver(urlSchema),
    defaultValues: { url: '' },
  });

  const handleClose = () => {
    resetUrlForm();
    setQuery('');
    setProvider(null);
    setMode('search');
    onClose();
  };

  const onSubmitUrl = (data: UrlForm) => {
    createLink.mutate({ url: data.url }, {
      onSuccess: () => handleClose(),
    });
  };

  const handleSubmitShortcut = useSubmitShortcut(handleSubmit(onSubmitUrl));

  const handlePick = (remoteNumber: number) => {
    if (!provider) return;
    createLink.mutate({ provider, remoteNumber }, {
      onSuccess: () => handleClose(),
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
            onKeyDown={mode === 'url' ? handleSubmitShortcut : undefined}>
      <DialogTitle sx={{ fontSize: '15px', fontWeight: 700, pb: 1 }}>
        Linkovat MR / PR
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
        {noIntegrations ? (
          <Box sx={{ p: 2, border: 1, borderStyle: 'dashed', borderColor: 'divider', borderRadius: 1.5 }}>
            <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
              Žádná integrace není nakonfigurována. Připoj GitHub nebo GitLab v nastavení projektu.
            </Typography>
          </Box>
        ) : (
          <>
            {availableProviders.length > 1 && (
              <Tabs
                value={provider ?? availableProviders[0]}
                onChange={(_e, v) => setProvider(v as RemoteLinkProvider)}
                variant="fullWidth"
              >
                {availableProviders.includes('github') && <Tab value="github" label="GitHub"/>}
                {availableProviders.includes('gitlab') && <Tab value="gitlab" label="GitLab"/>}
              </Tabs>
            )}

            <ToggleButtonGroup
              size="small"
              exclusive
              value={mode}
              onChange={(_e, v: LinkMode | null) => v && setMode(v)}
              sx={{ alignSelf: 'flex-start' }}
            >
              <ToggleButton value="search">Vyhledat</ToggleButton>
              <ToggleButton value="url">Z URL</ToggleButton>
            </ToggleButtonGroup>

            {mode === 'search' ? (
              <Stack spacing={1.25}>
                <TextField
                  autoFocus
                  size="small"
                  fullWidth
                  placeholder="Hledat název nebo číslo PR/MR…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                <Box sx={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {search.isFetching && (
                    <Stack direction="row" sx={{ justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={18} thickness={5}/>
                    </Stack>
                  )}
                  {!search.isFetching && search.isError && (
                    <Typography sx={{ fontSize: '13px', color: 'error.main', py: 1 }}>
                      Nepodařilo se načíst MR/PR z {provider}. Zkus to znovu.
                    </Typography>
                  )}
                  {!search.isFetching && !search.isError && (search.data ?? []).length === 0 && (
                    <Typography sx={{ fontSize: '13px', color: 'text.secondary', py: 1 }}>
                      Nic nenalezeno.
                    </Typography>
                  )}
                  {(search.data ?? []).map(r => {
                    const symbol = r.provider === 'github' ? '#' : '!';
                    return (
                      <Box
                        key={`${r.provider}-${r.remoteNumber}`}
                        onClick={() => !createLink.isPending && handlePick(r.remoteNumber)}
                        sx={{
                          p: 1, border: 1, borderColor: 'divider', borderRadius: 1.25,
                          cursor: createLink.isPending ? 'wait' : 'pointer',
                          '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                        }}
                      >
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.25 }}>
                          <Typography sx={{
                            fontSize: '12px', fontFamily: 'JetBrains Mono, monospace',
                            fontWeight: 700, color: 'info.main',
                          }}>{symbol}{r.remoteNumber}</Typography>
                          <StateBadge state={r.state}/>
                          <Box sx={{ flex: 1 }}/>
                          <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>
                            {timeAgo(r.updatedAt)}
                          </Typography>
                        </Stack>
                        <Typography sx={{ fontSize: '13.5px', fontWeight: 600 }}>{r.title}</Typography>
                        {r.author && (
                          <Typography sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.25 }}>
                            {r.author}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Stack>
            ) : (
              <Box>
                <Typography sx={{ fontSize: '14px', color: 'text.secondary', mb: 0.75 }}>
                  Vlož URL na PR nebo MR z napojeného repa.
                </Typography>
                <TextField
                  {...register('url')}
                  autoFocus
                  size="small"
                  fullWidth
                  placeholder="https://github.com/owner/repo/pull/123"
                  error={!!errors.url}
                  helperText={errors.url?.message}
                />
                <Typography sx={{ fontSize: '13px', color: 'text.disabled', mt: 1 }}>
                  Tip: pokud PR nebo MR má v titulu / větvi task key (např. {projectKey}-12),
                  Stride ho napáruje automaticky.
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button size="small" onClick={handleClose}>Zrušit</Button>
        {mode === 'url' && !noIntegrations && (
          <Button
            size="small"
            variant="contained"
            disabled={createLink.isPending}
            onClick={handleSubmit(onSubmitUrl)}
          >
            {createLink.isPending ? 'Propojuji…' : 'Propojit'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
