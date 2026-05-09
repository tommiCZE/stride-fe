import { Box, Typography } from '@mui/material';
import { SectionLabel } from '../../../components/ui/ui';
import { BranchIcon } from '../../../components/icons/icons';
import { DEV_DATA, getUser, timeAgo } from '../../../mocks/data';
import FluxAvatar from '../../../components/flux-avatar';

function ProviderIcon({ provider, size = 14 }: { provider: 'github' | 'gitlab'; size?: number }) {
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

function PRStateBadge({ state, draft }: { state: string; draft: boolean }) {
  const m = draft
    ? { label: 'Draft', color: '#94a3b8' }
    : state === 'open'   ? { label: 'Open',   color: '#10b981' }
    : state === 'merged' ? { label: 'Merged', color: '#a855f7' }
    :                      { label: 'Closed', color: '#ef4444' };
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.15,
      borderRadius: 1, fontSize: 11, fontWeight: 600,
      color: m.color, bgcolor: m.color + '22', border: 1, borderColor: m.color + '55' }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: m.color }}/>
      {m.label}
    </Box>
  );
}

export function DevPanel({ taskKey }: { taskKey: string }) {
  const dev = DEV_DATA[taskKey];
  if (!dev) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', border: 1, borderStyle: 'dashed',
        borderColor: 'divider', borderRadius: 1.5, color: 'text.secondary' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1.5 }}>
          <ProviderIcon provider="github" size={22}/>
          <ProviderIcon provider="gitlab" size={22}/>
        </Box>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, mb: 0.5 }}>Žádná dev aktivita</Typography>
        <Typography sx={{ fontSize: 12, mb: 2 }}>
          Vytvoř branch s názvem obsahujícím <code>{taskKey}</code> a Stride ji automaticky propojí.
        </Typography>
      </Box>
    );
  }

  const sec = (label: string, count: number) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 2 }}>
      <SectionLabel>{label}</SectionLabel>
      <Box sx={{ minWidth: 18, height: 18, borderRadius: 9, px: 0.6, bgcolor: 'action.hover',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 700, color: 'text.secondary' }}>{count}</Box>
    </Box>
  );

  return (
    <Box>
      {dev.branches.length > 0 && <>
        {sec('Branches', dev.branches.length)}
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
          {dev.branches.map((b, i) => {
            const a = getUser(b.author)!;
            return (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25,
                borderTop: i ? 1 : 0, borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                <Box sx={{ color: 'text.secondary', flexShrink: 0 }}><ProviderIcon provider={b.provider} size={15}/></Box>
                <BranchIcon style={{ color: 'var(--mui-palette-text-disabled)', flexShrink: 0 }}/>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{b.repo} · ↑ {b.ahead} · ↓ {b.behind} · {timeAgo(b.updated)}</Typography>
                </Box>
                <FluxAvatar user={a} size={20}/>
              </Box>
            );
          })}
        </Box>
      </>}

      {dev.pulls.length > 0 && <>
        {sec('Pull requests', dev.pulls.length)}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {dev.pulls.map((p, i) => {
            const a = getUser(p.author)!;
            const total = p.checks.passed + p.checks.failed + p.checks.pending;
            const checkColor = p.checks.failed > 0 ? '#ef4444' : p.checks.pending > 0 ? '#f59e0b' : '#10b981';
            return (
              <Box key={i} sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, p: 1.5,
                '&:hover': { borderColor: 'primary.main' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                  <ProviderIcon provider={p.provider} size={14}/>
                  <Typography sx={{ fontSize: 11.5, fontFamily: 'JetBrains Mono, ui-monospace, monospace', color: 'info.main', fontWeight: 700 }}>{p.id}</Typography>
                  <PRStateBadge state={p.state} draft={p.draft}/>
                  <Box sx={{ flex: 1 }}/>
                  <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{timeAgo(p.updated)}</Typography>
                </Box>
                <Typography sx={{ fontSize: 13.5, fontWeight: 600, mb: 0.75, lineHeight: 1.35 }}>{p.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 11.5, color: 'text.secondary', flexWrap: 'wrap' }}>
                  <Box component="span" sx={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', px: 0.5, bgcolor: 'action.hover', borderRadius: 0.5 }}>{p.head}</Box>
                  <Box component="span" sx={{ color: 'text.disabled' }}>→</Box>
                  <Box component="span" sx={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', px: 0.5, bgcolor: 'action.hover', borderRadius: 0.5 }}>{p.base}</Box>
                  <Box component="span" sx={{ color: '#10b981', fontWeight: 600 }}>+{p.additions}</Box>
                  <Box component="span" sx={{ color: '#ef4444', fontWeight: 600 }}>−{p.deletions}</Box>
                  <Box component="span" sx={{ color: 'text.disabled' }}>· {p.files} souborů</Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <FluxAvatar user={a} size={20}/>
                    <Typography sx={{ fontSize: 12 }}>{a.name}</Typography>
                  </Box>
                  {p.reviews.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {p.reviews.map((r, j) => {
                        const ru = getUser(r.user)!;
                        const rc = r.state === 'approved' ? '#10b981' : r.state === 'changes' ? '#ef4444' : '#94a3b8';
                        return (
                          <Box key={j} sx={{ position: 'relative' }}>
                            <FluxAvatar user={ru} size={20}/>
                            <Box sx={{ position: 'absolute', right: -2, bottom: -2, width: 10, height: 10,
                              borderRadius: '50%', bgcolor: rc, border: 2, borderColor: 'background.paper' }}/>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                  <Box sx={{ flex: 1 }}/>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 11.5, color: checkColor }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: checkColor }}/>
                    {p.checks.passed}/{total} checks
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </>}

      {dev.builds.length > 0 && <>
        {sec('CI / Builds', dev.builds.length)}
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
          {dev.builds.map((b, i) => {
            const c = b.state === 'success' ? '#10b981' : b.state === 'failed' ? '#ef4444' : b.state === 'running' ? '#3b82f6' : '#94a3b8';
            return (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, borderTop: i ? 1 : 0, borderColor: 'divider' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c }}/>
                <Typography sx={{ fontSize: 12, fontFamily: 'JetBrains Mono, ui-monospace, monospace', color: 'info.main', minWidth: 50 }}>{b.id}</Typography>
                <Typography sx={{ fontSize: 12.5, flex: 1 }}>{b.name}</Typography>
                <Typography sx={{ fontSize: 11.5, color: 'text.disabled' }}>{b.duration}</Typography>
                <Typography sx={{ fontSize: 11, color: c, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', minWidth: 60, textAlign: 'right' }}>{b.state}</Typography>
              </Box>
            );
          })}
        </Box>
      </>}

      {dev.commits.length > 0 && <>
        {sec('Commity', dev.commits.length)}
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
          {dev.commits.map((c, i) => {
            const a = getUser(c.author)!;
            return (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, borderTop: i ? 1 : 0, borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                <FluxAvatar user={a} size={22}/>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.message}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                    <Box component="span" sx={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 11.5, color: 'info.main', bgcolor: 'action.hover', px: 0.6, py: 0.1, borderRadius: 0.6 }}>{c.sha.slice(0, 7)}</Box>
                    <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{a.name} · {timeAgo(c.at)}</Typography>
                  </Box>
                </Box>
                <ProviderIcon provider={c.provider} size={13}/>
              </Box>
            );
          })}
        </Box>
      </>}
    </Box>
  );
}
