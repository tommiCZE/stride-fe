import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { GIT_INTEGRATIONS } from '../../mocks/data';
import { timeAgo } from '../../utils/time';
import { SectionLabel } from '../../components/ui/ui';

export function ProviderLogo({ provider, size = 18 }: { provider: 'github' | 'gitlab'; size?: number }) {
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

export function IntegrationCard({ ig }: { ig: typeof GIT_INTEGRATIONS[number] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden', mb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: 'background.paper', cursor: 'default' }}
        onClick={() => setExpanded(e => !e)}>
        <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: 'action.hover',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ProviderLogo provider={ig.provider} size={20}/>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{ig.name}</Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5,
              px: 0.75, py: 0.15, borderRadius: 1, fontSize: 14, fontWeight: 600,
              color: ig.connected ? '#10b981' : '#94a3b8',
              bgcolor: (ig.connected ? '#10b981' : '#94a3b8') + '22' }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: ig.connected ? '#10b981' : '#94a3b8' }}/>
              {ig.connected ? 'Připojeno' : 'Nepřipojeno'}
            </Box>
          </Box>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            {ig.connected
              ? `${ig.org} · ${ig.repos.filter(r => r.linked).length} repo · sync ${timeAgo(ig.lastSync)}`
              : 'Připoj svou organizaci a propoj repository.'}
          </Typography>
        </Box>
        {ig.connected
          ? <Button size="small" variant="outlined" onClick={e => e.stopPropagation()}>Spravovat</Button>
          : <Button size="small" variant="contained">Připojit</Button>}
      </Box>

      {expanded && ig.connected && (
        <Box sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.default', p: 1.5 }}>
          <SectionLabel sx={{ mb: 0.75 }}>Repository</SectionLabel>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
            {ig.repos.map((r, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1,
                border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
                <ProviderLogo provider={ig.provider} size={13}/>
                <Typography sx={{ fontSize: 14, fontFamily: 'JetBrains Mono, ui-monospace, monospace', flex: 1 }}>{r.full}</Typography>
                <Typography sx={{ fontSize: 14, px: 0.5, py: 0.1, borderRadius: 0.5, bgcolor: 'action.hover', color: 'text.secondary' }}>{r.lang}</Typography>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4,
                  px: 0.6, py: 0.2, borderRadius: 0.6, fontSize: 14, fontWeight: 600,
                  color: r.linked ? '#10b981' : 'text.disabled',
                  bgcolor: r.linked ? '#10b98122' : 'transparent',
                  border: r.linked ? 0 : 1, borderColor: 'divider' }}>
                  {r.linked ? '✓ propojeno' : 'připojit'}
                </Box>
              </Box>
            ))}
          </Box>

          <SectionLabel sx={{ mb: 0.75 }}>Webhooky</SectionLabel>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
            {ig.webhooks.map(w => (
              <Box key={w} sx={{ fontSize: 13, fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                px: 0.75, py: 0.25, borderRadius: 0.6, bgcolor: 'action.hover' }}>{w}</Box>
            ))}
          </Box>

          <SectionLabel sx={{ mb: 0.75 }}>Automatizace</SectionLabel>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {[
              { label: 'Smart commits', desc: `Logovat čas pomocí ${ig.provider === 'github' ? 'WEB-142' : ''} #log 1h, #done.`, on: ig.smartCommits },
              { label: 'Auto-přechod statusů', desc: 'Otevřený PR → In Review · Merge → Done.', on: ig.autoTransition },
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1,
                border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{item.desc}</Typography>
                </Box>
                <Box sx={{ width: 32, height: 18, borderRadius: 9, position: 'relative',
                  bgcolor: item.on ? 'primary.main' : 'action.hover' }}>
                  <Box sx={{ position: 'absolute', top: 2, left: item.on ? 16 : 2,
                    width: 14, height: 14, borderRadius: '50%', bgcolor: '#fff', transition: '0.2s' }}/>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
