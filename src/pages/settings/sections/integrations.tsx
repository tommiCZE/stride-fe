import { useEffect } from 'react';
import { Avatar, Box, Button, Chip, CircularProgress, IconButton, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { SectionHeader, SettingsCard, FieldRow } from '../shared';
import { useProjectSettings } from '../../../store/project-settings-store';
import { ProviderLogo } from '../integration-card';
import type { ProjectDto } from '../../../api/types';
import type {
  ProjectApiTokenDto, ProjectWebhookDto, ProjectAutomationDto, ProjectTaskTemplateDto,
} from '../../../api/project-settings';
import {
  useProjectApiTokensRes, useProjectWebhooksRes,
  useProjectAutomationsRes, useProjectTaskTemplatesRes,
} from '../../../hooks/useProjectSettingsResources';
import { useSlackIntegration } from '../../../hooks/useSlackIntegration';
import { useGithubIntegration } from '../../../hooks/useGithubIntegration';
import { useGitlabIntegration } from '../../../hooks/useGitlabIntegration';
import { slackIntegrationApi } from '../../../api/slack-integration';
import { githubIntegrationApi } from '../../../api/github-integration';
import { gitlabIntegrationApi } from '../../../api/gitlab-integration';
import { PlusIcon, CloseIcon } from '../../../components/icons/icons';

const WEBHOOK_EVENTS = [
  'task.created', 'task.updated', 'task.status_changed', 'task.deleted',
  'comment.added', 'sprint.started', 'sprint.completed',
];

const ROW_SX = {
  p: 1,
  border: 1,
  borderColor: 'divider',
  borderRadius: 1,
  alignItems: 'center',
} as const;

function formatLastUsed(lastUsedAt: string | null): string {
  if (!lastUsedAt) return 'nepoužito';
  return `použito ${Math.round((Date.now() - new Date(lastUsedAt).getTime()) / 3600_000)}h zpět`;
}

export function IntegrationsSection({ project, readOnly }: { project: ProjectDto; readOnly: boolean }) {
  const tokens = useProjectApiTokensRes(project.key);
  const webhooks = useProjectWebhooksRes(project.key);
  const automations = useProjectAutomationsRes(project.key);
  const templates = useProjectTaskTemplatesRes(project.key);

  return (
    <Box>
      <SectionHeader
        title="Integrace a automatizace"
        hint="Propoj Stride s Gitem, Slackem a vlastními systémy přes webhooks."
      />

      <SettingsCard title="Git" description="Propoj GitHub / GitLab repozitář s tímto projektem.">
        <Stack spacing={2}>
          <GithubRow projectKey={project.key} readOnly={readOnly}/>
          <GitlabRow projectKey={project.key} readOnly={readOnly}/>
        </Stack>
      </SettingsCard>

      <BranchNamingCard projectKey={project.key} readOnly={readOnly}/>

      <SlackCard projectKey={project.key} readOnly={readOnly}/>

      <SettingsCard title="API tokeny" description="Servisní tokeny pro CI/CD a externí skripty.">
        <Stack spacing={0.5} sx={{ mb: 1.5 }}>
          {tokens.data.map((t, i) => (
            <Stack key={t.id} direction="row" spacing={1} sx={ROW_SX}>
              <Stack sx={{ flex: 1 }}>
                <Typography variant="subtitle2">{t.name}</Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'ui-monospace, monospace' }}>
                  {t.prefix}…  ·  {t.scopes.join(', ')}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {formatLastUsed(t.lastUsedAt)}
              </Typography>
              <IconButton size="small" disabled={readOnly}
                onClick={() => tokens.replace(tokens.data.filter((_, j) => j !== i))}>
                <CloseIcon/>
              </IconButton>
            </Stack>
          ))}
        </Stack>
        <Button
          size="small" variant="outlined" startIcon={<PlusIcon/>} disabled={readOnly}
          onClick={() => tokens.replace([...tokens.data, {
            id: crypto.randomUUID(),
            name: 'Nový token',
            prefix: `sk_${Math.random().toString(36).slice(2, 6)}`,
            scopes: ['tasks:read'],
            lastUsedAt: null,
            createdAt: new Date().toISOString(),
          }])}
        >Vygenerovat token</Button>
      </SettingsCard>

      <SettingsCard title="Webhooky" description="HTTP POST endpoint pro tyto eventy.">
        <Stack spacing={1}>
          {webhooks.data.map((w, i) => (
            <WebhookRow
              key={w.id} webhook={w} readOnly={readOnly}
              onChange={(next) => webhooks.replace(webhooks.data.map((x, j) => j === i ? next : x))}
              onDelete={() => webhooks.replace(webhooks.data.filter((_, j) => j !== i))}
            />
          ))}
        </Stack>
        <Button
          size="small" variant="outlined" startIcon={<PlusIcon/>} disabled={readOnly} sx={{ mt: 1.5 }}
          onClick={() => webhooks.replace([...webhooks.data, {
            id: crypto.randomUUID(), url: '', events: ['task.created'], enabled: false, sortOrder: webhooks.data.length,
          }])}
        >Přidat webhook</Button>
      </SettingsCard>

      <SettingsCard title="Automatizace" description="Pravidla typu „pokud — tak”.">
        <Stack spacing={0.5} sx={{ mb: 1.5 }}>
          {automations.data.map((a, i) => (
            <Stack key={a.id} direction="row" spacing={1} sx={ROW_SX}>
              <Switch size="small" checked={a.enabled} disabled={readOnly}
                onChange={(_, v) => automations.replace(
                  automations.data.map((x, j) => j === i ? { ...x, enabled: v } : x),
                )}/>
              <Stack sx={{ flex: 1 }}>
                <Typography variant="subtitle2">{a.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  pokud {a.trigger} → {a.action}
                </Typography>
              </Stack>
              <IconButton size="small" disabled={readOnly}
                onClick={() => automations.replace(automations.data.filter((_, j) => j !== i))}>
                <CloseIcon/>
              </IconButton>
            </Stack>
          ))}
        </Stack>
        <Button
          size="small" variant="outlined" startIcon={<PlusIcon/>} disabled={readOnly}
          onClick={() => automations.replace([...automations.data, {
            id: crypto.randomUUID(), name: 'Nové pravidlo', enabled: false,
            trigger: 'task.created', action: 'priority = MEDIUM',
            sortOrder: automations.data.length,
          }])}
        >Přidat pravidlo</Button>
      </SettingsCard>

      <SettingsCard title="Šablony tasků" description="Předvyplněné struktury pro běžně používané typy tasků.">
        <Stack spacing={0.5}>
          {templates.data.map((t, i) => (
            <Stack key={t.id} direction="row" spacing={1} sx={{ ...ROW_SX, alignItems: 'flex-start' }}>
              <Stack sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="label">{t.name}</Typography>
                  <Chip size="small" label={t.typeKey} variant="outlined"/>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, whiteSpace: 'pre-line' }}>
                  {t.description.split('\n').slice(0, 2).join(' · ')}
                </Typography>
              </Stack>
              <IconButton size="small" disabled={readOnly}
                onClick={() => templates.replace(templates.data.filter((_, j) => j !== i))}>
                <CloseIcon/>
              </IconButton>
            </Stack>
          ))}
        </Stack>
        <Button
          size="small" variant="outlined" startIcon={<PlusIcon/>} disabled={readOnly} sx={{ mt: 1.5 }}
          onClick={() => templates.replace([...templates.data, {
            id: crypto.randomUUID(), name: 'Nová šablona', typeKey: 'TASK', title: '', description: '',
            sortOrder: templates.data.length,
          }])}
        >Přidat šablonu</Button>
      </SettingsCard>
    </Box>
  );
}

function WebhookRow({ webhook, readOnly, onChange, onDelete }: {
  webhook: ProjectWebhookDto;
  readOnly: boolean;
  onChange: (w: ProjectWebhookDto) => void;
  onDelete: () => void;
}) {
  return (
    <Stack spacing={0.75} sx={{ p: 1.25, border: 1, borderColor: 'divider', borderRadius: 1 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Switch size="small" checked={webhook.enabled} disabled={readOnly}
          onChange={(_, v) => onChange({ ...webhook, enabled: v })}/>
        <TextField
          size="small" fullWidth placeholder="https://hooks.example.com/…"
          value={webhook.url} disabled={readOnly}
          onChange={e => onChange({ ...webhook, url: e.target.value })}
          sx={{ '& .MuiInputBase-root': { fontFamily: 'ui-monospace, monospace' } }}
        />
        <IconButton size="small" disabled={readOnly} onClick={onDelete}>
          <CloseIcon/>
        </IconButton>
      </Stack>
      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
        {WEBHOOK_EVENTS.map(ev => {
          const on = webhook.events.includes(ev);
          return (
            <Chip key={ev} size="small" label={ev}
              variant={on ? 'filled' : 'outlined'}
              color={on ? 'primary' : 'default'}
              onClick={readOnly ? undefined : () => onChange({
                ...webhook,
                events: on ? webhook.events.filter(e => e !== ev) : [...webhook.events, ev],
              })}
            />
          );
        })}
      </Stack>
    </Stack>
  );
}

function SlackLogo() {
  return (
    <Stack sx={{
      width: 36, height: 36, borderRadius: 1, bgcolor: 'action.hover',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={20} height={20} viewBox="0 0 24 24">
        <path fill="#E01E5A" d="M5.04 15.06a2.52 2.52 0 1 1-5.04 0 2.52 2.52 0 0 1 2.52-2.52h2.52v2.52zm1.26 0a2.52 2.52 0 1 1 5.04 0v6.42a2.52 2.52 0 1 1-5.04 0v-6.42z"/>
        <path fill="#36C5F0" d="M8.82 5.04a2.52 2.52 0 1 1 0-5.04 2.52 2.52 0 0 1 2.52 2.52v2.52H8.82zm0 1.26a2.52 2.52 0 1 1 0 5.04H2.4a2.52 2.52 0 1 1 0-5.04h6.42z"/>
        <path fill="#2EB67D" d="M18.84 8.82a2.52 2.52 0 1 1 5.04 0 2.52 2.52 0 0 1-2.52 2.52h-2.52V8.82zm-1.26 0a2.52 2.52 0 1 1-5.04 0V2.4a2.52 2.52 0 1 1 5.04 0v6.42z"/>
        <path fill="#ECB22E" d="M15.06 18.84a2.52 2.52 0 1 1 0 5.04 2.52 2.52 0 0 1-2.52-2.52v-2.52h2.52zm0-1.26a2.52 2.52 0 1 1 0-5.04h6.42a2.52 2.52 0 1 1 0 5.04h-6.42z"/>
      </svg>
    </Stack>
  );
}

function SlackCard({ projectKey, readOnly }: { projectKey: string; readOnly: boolean }) {
  const slack = useSlackIntegration(projectKey);
  const [searchParams, setSearchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const flag = searchParams.get('slack');
    if (!flag) return;
    if (flag === 'connected') enqueueSnackbar('Slack připojen', { variant: 'success' });
    else if (flag === 'error') {
      enqueueSnackbar(`Slack se nepodařilo připojit: ${searchParams.get('reason') ?? '?'}`, { variant: 'error' });
    }
    const next = new URLSearchParams(searchParams);
    next.delete('slack');
    next.delete('reason');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, enqueueSnackbar]);

  const startInstall = async () => {
    try {
      const { url } = await slackIntegrationApi.startInstall(projectKey);
      window.location.href = url;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      enqueueSnackbar(e?.response?.data?.error ?? 'Připojení Slacku se nezdařilo', { variant: 'error' });
    }
  };

  return (
    <SettingsCard title="Slack" description="Posílej notifikace o eventech do vybraného Slack kanálu.">
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <SlackLogo/>
        <Stack sx={{ flex: 1 }}>
          <Typography variant="label">Slack workspace</Typography>
          <Typography variant="caption" color="text.secondary">
            {slack.isLoading ? 'Načítám…'
              : slack.isConnected ? `Připojeno k ${slack.integration?.teamName}`
              : 'Nepřipojeno'}
          </Typography>
        </Stack>
        {!slack.isConnected && (
          <Button size="small" variant="contained" disabled={readOnly || slack.isLoading} onClick={startInstall}>
            Připojit Slack
          </Button>
        )}
        {slack.isConnected && (
          <Button size="small" variant="outlined" color="error"
            disabled={readOnly || slack.disconnecting}
            onClick={() => slack.disconnect()}>
            {slack.disconnecting ? 'Odpojuji…' : 'Odpojit'}
          </Button>
        )}
      </Stack>

      {slack.isConnected && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130 }}>
            Výchozí kanál
          </Typography>
          <TextField
            size="small" select
            value={slack.integration?.defaultChannelId ?? ''}
            disabled={readOnly || slack.channelsLoading || slack.settingChannel}
            onChange={e => {
              const ch = slack.channels.find(c => c.id === e.target.value);
              if (ch) slack.setChannel({ id: ch.id, name: ch.name });
            }}
            sx={{ width: 280 }}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="" disabled>
              {slack.channelsLoading ? 'Načítám kanály…' : 'Vyberte kanál'}
            </MenuItem>
            {slack.channels.map(c => (
              <MenuItem key={c.id} value={c.id}>
                {c.isPrivate ? '🔒 ' : '# '}{c.name}
              </MenuItem>
            ))}
          </TextField>
          {slack.settingChannel && <CircularProgress size={14} thickness={5}/>}
        </Stack>
      )}
    </SettingsCard>
  );
}

function useOAuthQueryFlag(provider: 'github' | 'gitlab') {
  const [searchParams, setSearchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    const flag = searchParams.get(provider);
    if (!flag) return;
    if (flag === 'connected') {
      enqueueSnackbar(`${provider === 'github' ? 'GitHub' : 'GitLab'} připojen`, { variant: 'success' });
    } else if (flag === 'error') {
      enqueueSnackbar(
        `${provider === 'github' ? 'GitHub' : 'GitLab'} se nepodařilo připojit: ${searchParams.get('reason') ?? '?'}`,
        { variant: 'error' },
      );
    }
    const next = new URLSearchParams(searchParams);
    next.delete(provider);
    next.delete('reason');
    setSearchParams(next, { replace: true });
  }, [provider, searchParams, setSearchParams, enqueueSnackbar]);
}

function GithubRow({ projectKey, readOnly }: { projectKey: string; readOnly: boolean }) {
  const gh = useGithubIntegration(projectKey);
  const { enqueueSnackbar } = useSnackbar();
  useOAuthQueryFlag('github');

  const startInstall = async () => {
    try {
      const { url } = await githubIntegrationApi.startInstall(projectKey);
      window.location.href = url;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      enqueueSnackbar(e?.response?.data?.error ?? 'Připojení GitHubu se nezdařilo', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <ProviderLogo provider="github" size={28}/>
        <Stack sx={{ flex: 1 }}>
          <Typography variant="label">GitHub</Typography>
          <Typography variant="caption" color="text.secondary">
            {gh.isLoading ? 'Načítám…'
              : gh.isConnected
                ? <>Přihlášen jako <strong>@{gh.integration?.accountLogin}</strong></>
                : 'Nepřipojeno'}
          </Typography>
        </Stack>
        {gh.integration?.accountAvatarUrl && (
          <Avatar src={gh.integration.accountAvatarUrl} sx={{ width: 24, height: 24 }}/>
        )}
        {!gh.isConnected && (
          <Button size="small" variant="contained" disabled={readOnly || gh.isLoading} onClick={startInstall}>
            Připojit GitHub
          </Button>
        )}
        {gh.isConnected && (
          <Button size="small" variant="outlined" color="error"
            disabled={readOnly || gh.disconnecting}
            onClick={() => gh.disconnect()}>
            {gh.disconnecting ? 'Odpojuji…' : 'Odpojit'}
          </Button>
        )}
      </Stack>

      {gh.isConnected && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1, ml: 4.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
            Výchozí repo
          </Typography>
          <TextField
            size="small" select
            value={gh.integration?.defaultRepoId ?? ''}
            disabled={readOnly || gh.reposLoading || gh.settingRepo}
            onChange={e => {
              const id = Number(e.target.value);
              const r = gh.repos.find(x => x.id === id);
              if (r) gh.setRepo({ id: r.id, fullName: r.fullName });
            }}
            sx={{ width: 320 }}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="" disabled>
              {gh.reposLoading ? 'Načítám repozitáře…' : 'Vyberte repozitář'}
            </MenuItem>
            {gh.repos.map(r => (
              <MenuItem key={r.id} value={r.id}>
                {r.isPrivate ? '🔒 ' : ''}{r.fullName}
              </MenuItem>
            ))}
          </TextField>
          {gh.settingRepo && <CircularProgress size={14} thickness={5}/>}
        </Stack>
      )}
    </Box>
  );
}

function GitlabRow({ projectKey, readOnly }: { projectKey: string; readOnly: boolean }) {
  const gl = useGitlabIntegration(projectKey);
  const { enqueueSnackbar } = useSnackbar();
  useOAuthQueryFlag('gitlab');

  const startInstall = async () => {
    try {
      const { url } = await gitlabIntegrationApi.startInstall(projectKey);
      window.location.href = url;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      enqueueSnackbar(e?.response?.data?.error ?? 'Připojení GitLabu se nezdařilo', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <ProviderLogo provider="gitlab" size={28}/>
        <Stack sx={{ flex: 1 }}>
          <Typography variant="label">GitLab</Typography>
          <Typography variant="caption" color="text.secondary">
            {gl.isLoading ? 'Načítám…'
              : gl.isConnected
                ? <>Přihlášen jako <strong>@{gl.integration?.accountUsername}</strong></>
                : 'Nepřipojeno'}
          </Typography>
        </Stack>
        {gl.integration?.accountAvatarUrl && (
          <Avatar src={gl.integration.accountAvatarUrl} sx={{ width: 24, height: 24 }}/>
        )}
        {!gl.isConnected && (
          <Button size="small" variant="contained" disabled={readOnly || gl.isLoading} onClick={startInstall}>
            Připojit GitLab
          </Button>
        )}
        {gl.isConnected && (
          <Button size="small" variant="outlined" color="error"
            disabled={readOnly || gl.disconnecting}
            onClick={() => gl.disconnect()}>
            {gl.disconnecting ? 'Odpojuji…' : 'Odpojit'}
          </Button>
        )}
      </Stack>

      {gl.isConnected && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1, ml: 4.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
            Výchozí projekt
          </Typography>
          <TextField
            size="small" select
            value={gl.integration?.defaultProjectId ?? ''}
            disabled={readOnly || gl.projectsLoading || gl.settingProject}
            onChange={e => {
              const id = Number(e.target.value);
              const p = gl.projects.find(x => x.id === id);
              if (p) gl.setProject({ id: p.id, path: p.pathWithNamespace });
            }}
            sx={{ width: 320 }}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="" disabled>
              {gl.projectsLoading ? 'Načítám projekty…' : 'Vyberte projekt'}
            </MenuItem>
            {gl.projects.map(p => (
              <MenuItem key={p.id} value={p.id}>
                {p.visibility === 'private' ? '🔒 ' : ''}{p.pathWithNamespace}
              </MenuItem>
            ))}
          </TextField>
          {gl.settingProject && <CircularProgress size={14} thickness={5}/>}
        </Stack>
      )}
    </Box>
  );
}

function BranchNamingCard({ projectKey, readOnly }: { projectKey: string; readOnly: boolean }) {
  const { settings, update } = useProjectSettings(projectKey);
  const sample = settings.branchNamingTemplate
    .replace('{key}', 'WEB-142')
    .replace('{slug}', 'fix-login-button')
    .replace('{type}', 'feat')
    .replace('{user}', 'tomas');

  return (
    <SettingsCard
      title="Branch naming"
      description="Šablona pro generování názvu větve z tasku. Placeholdery: {key}, {slug}, {type}, {user}."
    >
      <FieldRow label="Šablona" hint="Použije se v Dev panelu tasku přes „Copy branch name”.">
        <TextField
          size="small" fullWidth value={settings.branchNamingTemplate}
          onChange={e => update({ branchNamingTemplate: e.target.value })}
          disabled={readOnly}
          sx={{ '& .MuiInputBase-root': { fontFamily: 'ui-monospace, monospace' } }}
        />
      </FieldRow>
      <FieldRow label="Náhled">
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'ui-monospace, monospace',
          bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 0.75 }}>
          {sample}
        </Typography>
      </FieldRow>
    </SettingsCard>
  );
}

// avoid unused-imports
export type _Unused = ProjectApiTokenDto | ProjectAutomationDto | ProjectTaskTemplateDto;
