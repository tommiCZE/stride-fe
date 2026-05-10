// detail.jsx — Task detail panel with rich editor

const MD = window.MaterialUI;
const { Box: DBox, Typography: DTypography, IconButton: DIconButton,
        Button: DButton, Divider: DDivider, TextField: DTextField,
        Chip: DChip, Menu: DMenu, MenuItem: DMenuItem, Tooltip: DTooltip } = MD;
const { alpha: dAlpha } = MD;
const { useState: dUse, useEffect: dEff, useRef: dRef } = React;

function FieldRow({ label, children }) {
  return (
    <DBox sx={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 1, alignItems: 'center', minHeight: 28 }}>
      <DTypography sx={{ fontSize: 11.5, color: 'text.secondary', fontWeight: 500 }}>{label}</DTypography>
      <DBox sx={{ minWidth: 0 }}>{children}</DBox>
    </DBox>
  );
}

function FieldPill({ children, color, onClick, dashed }) {
  return (
    <DBox onClick={onClick}
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.4,
        borderRadius: 0.8, fontSize: 12, cursor: 'default',
        border: dashed ? '1px dashed' : 'none',
        borderColor: dashed ? 'divider' : 'transparent',
        bgcolor: dashed ? 'transparent' : (color ? dAlpha(color, 0.12) : 'action.hover'),
        color: color || 'text.primary',
        '&:hover': { bgcolor: color ? dAlpha(color, 0.18) : 'action.selected' },
      }}>
      {children}
    </DBox>
  );
}

function StatusPicker({ status, onChange }) {
  const [anchor, setAnchor] = dUse(null);
  return (
    <>
      <DBox onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5,
          borderRadius: 1, fontSize: 12.5, fontWeight: 600, cursor: 'default',
          bgcolor: dAlpha(status.color, 0.14), color: status.color,
          border: 1, borderColor: dAlpha(status.color, 0.25),
          '&:hover': { bgcolor: dAlpha(status.color, 0.22) } }}>
        <DBox sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: status.color }}/>
        {status.name}
        <I.caret/>
      </DBox>
      <DMenu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        {window.FLUX_STATUSES.map(s => (
          <DMenuItem key={s.id} onClick={() => { onChange(s.id); setAnchor(null); }}>
            <DBox sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: s.color, mr: 1 }}/>
            {s.name}
          </DMenuItem>
        ))}
      </DMenu>
    </>
  );
}

// ── Comments ─────────────────────────────────────────────────────────────
function Comments({ taskKey }) {
  const [comments, setComments] = dUse([
    { id: 'c1', user: 'u1', at: '2026-04-26T10:15:00', blocks: [{ type: 'p', text: '@JN co myslíš na ten upload progress bar? Mělo by se to taky zobrazovat během paste z clipboardu, nebo jen u drag & drop?' }] },
    { id: 'c2', user: 'u2', at: '2026-04-26T11:30:00', blocks: [{ type: 'p', text: 'Souhlasím, paste z clipboardu by určitě měl mít progress. Ideálně inline pod kurzorem. Implementuju.' }] },
    { id: 'c3', user: 'u4', at: '2026-04-27T09:20:00', blocks: [{ type: 'p', text: 'Designy přidávám do #WEB-148. Backup placeholder pokud upload selže by se hodil — myšlenky?' }] },
    { id: 'c4', user: 'u1', at: '2026-04-27T14:30:00', blocks: [{ type: 'p', text: 'Skvěle. Pojďme pokračovat.' }] },
  ]);
  const [editingId, setEditingId] = dUse(null);
  const [composing, setComposing] = dUse(false);
  const [newHtml, setNewHtml] = dUse('');

  return (
    <DBox sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <DTypography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
        color: 'text.secondary' }}>Komentáře · {comments.length}</DTypography>
      {comments.map(c => {
        const u = getUser(c.user);
        const isEditing = editingId === c.id;
        return (
          <DBox key={c.id} sx={{ display: 'flex', gap: 1.25 }}>
            <FluxAvatar user={u} size={28}/>
            <DBox sx={{ flex: 1, minWidth: 0 }}>
              <DBox sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                <DTypography sx={{ fontSize: 12.5, fontWeight: 600 }}>{u.name}</DTypography>
                <DTypography sx={{ fontSize: 11, color: 'text.disabled' }}>{timeAgo(c.at)}</DTypography>
              </DBox>
              {isEditing ? (
                <window.RichEditor blocks={c.blocks} editable autoFocus showToggle={false} compact
                  onSave={(html) => {
                    setComments(cs => cs.map(x => x.id === c.id ? { ...x, blocks: [{ type: 'p', text: html.replace(/<[^>]+>/g, '') }] } : x));
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}/>
              ) : (
                <DBox sx={{ position: 'relative', p: 1.25, borderRadius: 1.2, bgcolor: 'action.hover',
                  fontSize: 13, lineHeight: 1.55,
                  '&:hover .cmt-pencil': { opacity: 1 } }}>
                  <window.RenderBlocks blocks={c.blocks}/>
                  {c.user === 'u1' && (
                    <DBox className="cmt-pencil" onClick={() => setEditingId(c.id)}
                      sx={{ position: 'absolute', top: 6, right: 6,
                        width: 24, height: 24, borderRadius: 1, opacity: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: 'background.paper', border: 1, borderColor: 'divider',
                        color: 'text.secondary', cursor: 'default', transition: 'opacity 0.15s',
                        '&:hover': { color: 'primary.main', borderColor: 'primary.main' } }}>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m11 2 3 3-9 9H2v-3z"/><path d="m9 4 3 3"/></svg>
                    </DBox>
                  )}
                </DBox>
              )}
              {!isEditing && (
                <DBox sx={{ display: 'flex', gap: 1.5, mt: 0.5, color: 'text.disabled', fontSize: 11.5 }}>
                  <DBox sx={{ cursor: 'default', '&:hover': { color: 'text.secondary' } }}>Odpovědět</DBox>
                  {c.user === 'u1' && (
                    <DBox onClick={() => setEditingId(c.id)} sx={{ cursor: 'default', '&:hover': { color: 'primary.main' } }}>Upravit</DBox>
                  )}
                </DBox>
              )}
            </DBox>
          </DBox>
        );
      })}

      <DBox sx={{ display: 'flex', gap: 1.25, mt: 1 }}>
        <FluxAvatar user={getUser('u1')} size={28}/>
        <DBox sx={{ flex: 1 }}>
          {composing ? (
            <window.RichEditor blocks={[{ type: 'p', text: '' }]} editable autoFocus compact
              showToggle={false} placeholder="Napiš komentář… (/, @, #, paste obrázek)"
              onSave={(html) => {
                const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                if (text) {
                  setComments(cs => [...cs, { id: 'c' + Date.now(), user: 'u1',
                    at: new Date().toISOString(), blocks: [{ type: 'p', text }] }]);
                }
                setComposing(false);
              }}
              onCancel={() => setComposing(false)}/>
          ) : (
            <DBox onClick={() => setComposing(true)}
              sx={{ p: 1.25, border: 1, borderColor: 'divider', borderRadius: 1.5,
                bgcolor: 'background.paper', fontSize: 13, color: 'text.disabled',
                cursor: 'text', '&:hover': { borderColor: 'primary.main' } }}>
              Napiš komentář… (klikni pro otevření editoru)
            </DBox>
          )}
        </DBox>
      </DBox>
    </DBox>
  );
}

// ── Activity ─────────────────────────────────────────────────────────────
function TaskActivity() {
  const items = [
    { user: 'u2', action: 'změnil/a status', from: 'To Do', to: 'In Progress', at: '2026-04-27T14:32:00' },
    { user: 'u2', action: 'logoval/a 2.5h', at: '2026-04-27T13:00:00' },
    { user: 'u1', action: 'přiřadil/a → Jana Nováková', at: '2026-04-26T09:00:00' },
    { user: 'u1', action: 'přidal/a label frontend', at: '2026-04-21T09:15:00' },
    { user: 'u1', action: 'vytvořil/a task', at: '2026-04-21T09:15:00' },
  ];
  return (
    <DBox sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {items.map((it, i) => {
        const u = getUser(it.user);
        return (
          <DBox key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 12, color: 'text.secondary' }}>
            <FluxAvatar user={u} size={18}/>
            <DTypography sx={{ fontSize: 12 }}><b style={{ color: 'inherit' }}>{u.name}</b> {it.action}
              {it.from && <> z <DBox component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{it.from}</DBox> na <DBox component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{it.to}</DBox></>}
            </DTypography>
            <DBox sx={{ flex: 1 }}/>
            <DTypography sx={{ fontSize: 11, color: 'text.disabled' }}>{timeAgo(it.at)}</DTypography>
          </DBox>
        );
      })}
    </DBox>
  );
}

// ── Dev panel (GitHub / GitLab integration) ────────────────────────────────
function ProviderIcon({ provider, size = 14 }) {
  if (provider === 'gitlab') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-label="GitLab">
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-label="GitHub">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.07c-3.2.7-3.87-1.36-3.87-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.55C20.21 21.39 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
    </svg>
  );
}

function MonoSha({ sha }) {
  return <DBox component="span" sx={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace',
    fontSize: 11.5, color: 'info.main', bgcolor: 'action.hover', px: 0.6, py: 0.1, borderRadius: 0.6 }}>
    {sha.slice(0, 7)}
  </DBox>;
}

function PRStateBadge({ state, draft }) {
  const map = {
    open:   { label: draft ? 'Draft' : 'Open',  color: draft ? '#94a3b8' : '#10b981' },
    merged: { label: 'Merged', color: '#a855f7' },
    closed: { label: 'Closed', color: '#ef4444' },
    draft:  { label: 'Draft',  color: '#94a3b8' },
  };
  const m = map[draft ? 'draft' : state] || map.open;
  return (
    <DBox sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.15,
      borderRadius: 1, fontSize: 11, fontWeight: 600,
      color: m.color, bgcolor: m.color + '22',
      border: 1, borderColor: m.color + '55' }}>
      <DBox sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: m.color }}/>
      {m.label}
    </DBox>
  );
}

function CheckBadge({ checks }) {
  const total = checks.passed + checks.failed + checks.pending;
  const allOk = checks.failed === 0 && checks.pending === 0;
  const anyFail = checks.failed > 0;
  const color = anyFail ? '#ef4444' : (allOk ? '#10b981' : '#f59e0b');
  return (
    <DBox sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 11.5, color }}>
      <DBox sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }}/>
      {checks.passed}/{total} checks
    </DBox>
  );
}

function DevPanel({ taskKey }) {
  const dev = window.FLUX_DEV?.[taskKey];

  if (!dev) {
    return (
      <DBox sx={{ p: 3, textAlign: 'center', border: 1, borderStyle: 'dashed',
        borderColor: 'divider', borderRadius: 1.5, color: 'text.secondary' }}>
        <DBox sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1.5 }}>
          <ProviderIcon provider="github" size={22}/>
          <ProviderIcon provider="gitlab" size={22}/>
        </DBox>
        <DTypography sx={{ fontSize: 13.5, fontWeight: 600, mb: 0.5 }}>Žádná dev aktivita</DTypography>
        <DTypography sx={{ fontSize: 12, mb: 2 }}>
          Vytvoř branch s názvem obsahujícím <code>{taskKey}</code> a Flux ji automaticky propojí.
        </DTypography>
        <DBox sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <DButton size="small" variant="outlined" startIcon={<ProviderIcon provider="github"/>}>
            Vytvořit branch na GitHubu
          </DButton>
          <DButton size="small" variant="outlined" startIcon={<ProviderIcon provider="gitlab"/>}>
            Vytvořit MR na GitLabu
          </DButton>
        </DBox>
      </DBox>
    );
  }

  const sec = (label, count) => (
    <DBox sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 2 }}>
      <DTypography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'text.secondary' }}>{label}</DTypography>
      <DBox sx={{ minWidth: 18, height: 18, borderRadius: 9, px: 0.6,
        bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10.5, fontWeight: 700, color: 'text.secondary' }}>{count}</DBox>
    </DBox>
  );

  return (
    <DBox>
      {/* Branches */}
      {dev.branches.length > 0 && <>
        {sec('Branches', dev.branches.length)}
        <DBox sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
          {dev.branches.map((b, i) => {
            const a = getUser(b.author);
            return (
              <DBox key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25,
                borderTop: i ? 1 : 0, borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover' } }}>
                <DBox sx={{ color: 'text.secondary', flexShrink: 0 }}>
                  <ProviderIcon provider={b.provider} size={15}/>
                </DBox>
                <DBox sx={{ flexShrink: 0, color: 'text.disabled' }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="4" cy="3" r="1.5"/><circle cx="4" cy="13" r="1.5"/><circle cx="12" cy="8" r="1.5"/>
                    <path d="M4 4.5v7M4 8c0-2 1.5-3.5 3.5-3.5h2"/>
                  </svg>
                </DBox>
                <DBox sx={{ flex: 1, minWidth: 0 }}>
                  <DTypography sx={{ fontSize: 12.5, fontWeight: 600,
                    fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.name}
                  </DTypography>
                  <DTypography sx={{ fontSize: 11, color: 'text.disabled' }}>
                    {b.repo} · ↑ {b.ahead} ahead · ↓ {b.behind} behind · {timeAgo(b.updated)}
                  </DTypography>
                </DBox>
                <FluxAvatar user={a} size={20}/>
              </DBox>
            );
          })}
        </DBox>
      </>}

      {/* Pull / Merge requests */}
      {dev.pulls.length > 0 && <>
        {sec(dev.pulls[0].provider === 'gitlab' ? 'Merge requests' : 'Pull requests', dev.pulls.length)}
        <DBox sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {dev.pulls.map((p, i) => {
            const a = getUser(p.author);
            return (
              <DBox key={i} sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, p: 1.5,
                '&:hover': { borderColor: 'primary.main' } }}>
                <DBox sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                  <ProviderIcon provider={p.provider} size={14}/>
                  <DTypography sx={{ fontSize: 11.5, fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                    color: 'info.main', fontWeight: 700 }}>{p.id}</DTypography>
                  <PRStateBadge state={p.state} draft={p.draft}/>
                  <DBox sx={{ flex: 1 }}/>
                  <DTypography sx={{ fontSize: 11, color: 'text.disabled' }}>{timeAgo(p.updated)}</DTypography>
                </DBox>
                <DTypography sx={{ fontSize: 13.5, fontWeight: 600, mb: 0.75, lineHeight: 1.35 }}>
                  {p.title}
                </DTypography>
                <DBox sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 11.5,
                  color: 'text.secondary', flexWrap: 'wrap' }}>
                  <DBox component="span" sx={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                    px: 0.5, bgcolor: 'action.hover', borderRadius: 0.5 }}>{p.head}</DBox>
                  <DBox component="span" sx={{ color: 'text.disabled' }}>→</DBox>
                  <DBox component="span" sx={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                    px: 0.5, bgcolor: 'action.hover', borderRadius: 0.5 }}>{p.base}</DBox>
                  <DBox component="span" sx={{ color: '#10b981', fontWeight: 600 }}>+{p.additions}</DBox>
                  <DBox component="span" sx={{ color: '#ef4444', fontWeight: 600 }}>−{p.deletions}</DBox>
                  <DBox component="span" sx={{ color: 'text.disabled' }}>· {p.files} souborů</DBox>
                </DBox>
                <DBox sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1, pt: 1,
                  borderTop: 1, borderColor: 'divider' }}>
                  <DBox sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <FluxAvatar user={a} size={20}/>
                    <DTypography sx={{ fontSize: 12 }}>{a.name}</DTypography>
                  </DBox>
                  {p.reviews.length > 0 && (
                    <DBox sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {p.reviews.map((r, j) => {
                        const ru = getUser(r.user);
                        const ringColor = r.state === 'approved' ? '#10b981' :
                          r.state === 'changes' ? '#ef4444' : '#94a3b8';
                        return (
                          <DBox key={j} sx={{ position: 'relative' }}>
                            <FluxAvatar user={ru} size={20}/>
                            <DBox sx={{ position: 'absolute', right: -2, bottom: -2,
                              width: 10, height: 10, borderRadius: '50%', bgcolor: ringColor,
                              border: 2, borderColor: 'background.paper' }}/>
                          </DBox>
                        );
                      })}
                    </DBox>
                  )}
                  <DBox sx={{ flex: 1 }}/>
                  <CheckBadge checks={p.checks}/>
                </DBox>
              </DBox>
            );
          })}
        </DBox>
      </>}

      {/* Builds */}
      {dev.builds && dev.builds.length > 0 && <>
        {sec('CI / Builds', dev.builds.length)}
        <DBox sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
          {dev.builds.map((b, i) => {
            const c = b.state === 'success' ? '#10b981' :
                      b.state === 'failed' ? '#ef4444' :
                      b.state === 'running' ? '#3b82f6' : '#94a3b8';
            return (
              <DBox key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25,
                borderTop: i ? 1 : 0, borderColor: 'divider' }}>
                <DBox sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c,
                  animation: b.state === 'running' ? 'pulse 1.5s infinite' : 'none' }}/>
                <DTypography sx={{ fontSize: 12, fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                  color: 'info.main', minWidth: 50 }}>{b.id}</DTypography>
                <DTypography sx={{ fontSize: 12.5, flex: 1 }}>{b.name}</DTypography>
                <DTypography sx={{ fontSize: 11.5, color: 'text.disabled' }}>{b.duration}</DTypography>
                <DTypography sx={{ fontSize: 11, color: c, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.04em', minWidth: 60, textAlign: 'right' }}>{b.state}</DTypography>
              </DBox>
            );
          })}
        </DBox>
      </>}

      {/* Commits */}
      {dev.commits.length > 0 && <>
        {sec('Commity', dev.commits.length)}
        <DBox sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
          {dev.commits.map((c, i) => {
            const a = getUser(c.author);
            return (
              <DBox key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25,
                borderTop: i ? 1 : 0, borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover' } }}>
                <FluxAvatar user={a} size={22}/>
                <DBox sx={{ flex: 1, minWidth: 0 }}>
                  <DTypography sx={{ fontSize: 12.5, lineHeight: 1.4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.message}
                  </DTypography>
                  <DBox sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                    <MonoSha sha={c.sha}/>
                    <DTypography sx={{ fontSize: 11, color: 'text.disabled' }}>
                      {a.name} · {timeAgo(c.at)}
                    </DTypography>
                  </DBox>
                </DBox>
                <ProviderIcon provider={c.provider} size={13}/>
              </DBox>
            );
          })}
        </DBox>
      </>}

      <DBox sx={{ mt: 2, p: 1.25, bgcolor: 'action.hover', borderRadius: 1.2,
        fontSize: 11.5, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
        <DBox sx={{ color: 'primary.main', fontSize: 14 }}>ⓘ</DBox>
        <DBox>
          <strong>Smart commits:</strong> v commit zprávě napiš <code>{taskKey} #log 1h</code> pro logování,
          nebo <code>{taskKey} #done</code> pro automatický přechod na Done.
        </DBox>
      </DBox>
    </DBox>
  );
}

// ── Worklog ──────────────────────────────────────────────────────────────
function Worklog({ task }) {
  const entries = [
    { user: 'u2', date: '2026-04-27', hours: 2.5, note: 'Slash menu UI shell, fuzzy search' },
    { user: 'u2', date: '2026-04-26', hours: 1.5, note: 'Heading / list bloky' },
    { user: 'u2', date: '2026-04-23', hours: 0.5, note: 'Setup TipTap, exploration' },
  ];
  return (
    <DBox sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {entries.map((e, i) => {
        const u = getUser(e.user);
        return (
          <DBox key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 12.5,
            p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
            <FluxAvatar user={u} size={20}/>
            <DBox sx={{ flex: 1, minWidth: 0 }}>
              <DTypography sx={{ fontSize: 12.5, fontWeight: 500 }}>{e.note}</DTypography>
              <DTypography sx={{ fontSize: 11, color: 'text.disabled' }}>{u.name} · {e.date}</DTypography>
            </DBox>
            <DBox sx={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'primary.main' }}>{e.hours}h</DBox>
          </DBox>
        );
      })}
    </DBox>
  );
}

// ── Detail panel ─────────────────────────────────────────────────────────
function TaskDetail({ taskId, onClose, timer }) {
  const t0 = window.FLUX_TASKS.find(x => x.id === taskId);
  const [task, setTask] = dUse(t0);
  const [tab, setTab] = dUse('comments');
  const [pinned, setPinned] = dUse(() => localStorage.getItem('flux-detail-pinned') === '1');
  const [expanded, setExpanded] = dUse(false);
  const isMobile = useIsMobile();

  dEff(() => { localStorage.setItem('flux-detail-pinned', pinned ? '1' : '0'); }, [pinned]);

  dEff(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isFullscreen = isMobile || expanded;

  if (!task) return null;
  const proj   = getProject(task.project);
  const status = getStatus(task.status);
  const prio   = getPriority(task.priority);
  const type   = getType(task.type);
  const epic   = task.epic ? getEpic(task.epic) : null;
  const sprint = task.sprint ? getSprint(task.sprint) : null;
  const assignee = task.assignee ? getUser(task.assignee) : null;
  const reporter = task.reporter ? getUser(task.reporter) : null;

  const blocks = task.description === '__RICH_DESC_1__' ? window.FLUX_RICH_DESC_1 :
    [{ type: 'p', text: task.description }];

  const subDone = (task.subtasks || []).filter(s => s.done).length;
  const subTotal = (task.subtasks || []).length;

  const toggleSub = (sid) => setTask(t => ({
    ...t, subtasks: t.subtasks.map(s => s.id === sid ? { ...s, done: !s.done } : s)
  }));

  return (
    <DBox sx={{ position: 'fixed', inset: 0,
      bgcolor: isFullscreen ? 'background.default' : 'rgba(0,0,0,0.5)',
      zIndex: 1300, display: 'flex',
      justifyContent: isFullscreen ? 'stretch' : 'flex-end' }}
      onClick={(pinned || isFullscreen) ? undefined : onClose}>
      <DBox onClick={(e) => e.stopPropagation()}
        sx={{ width: isFullscreen ? '100%' : 'min(1100px, 96vw)',
          height: '100%', bgcolor: 'background.default',
          display: 'flex', flexDirection: 'column',
          boxShadow: isFullscreen ? 'none' : '-12px 0 40px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <DBox sx={{ px: { xs: 1.5, md: 2 }, py: 1, display: 'flex', alignItems: 'center', gap: 1,
          borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', flexWrap: 'wrap' }}>
          <DBox sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DBox sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: proj.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 9.5, fontWeight: 700 }}>{proj.key[0]}</DBox>
            <DTypography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{proj.name}</DTypography>
            <I.caretR style={{ color: 'var(--mui-palette-text-disabled)' }}/>
            <TypeIcon type={task.type} size={13}/>
            <DTypography sx={{ fontSize: 11.5, color: 'text.secondary', fontFamily: 'ui-monospace, monospace' }}>{task.key}</DTypography>
          </DBox>
          <DBox sx={{ flex: 1 }}/>
          <DButton size="small" variant="outlined" startIcon={<I.clock/>}
            onClick={() => timer.start(task.key)}>
            {timer.taskKey === task.key && timer.running ? 'Stopnout timer' : 'Spustit timer'}
          </DButton>
          <DTooltip title={pinned ? 'Odepnout (kliknutí mimo zavře panel)' : 'Připnout panel (kliknutí mimo nezavře)'}>
            <DIconButton size="small" onClick={() => setPinned(p => !p)}
              sx={{ color: pinned ? 'primary.main' : 'text.secondary' }}>
              {pinned ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M9.5 1.5h-3a.5.5 0 0 0-.354.854L7 3.207V6L4.146 8.854A.5.5 0 0 0 4.5 9.707h3v4.5a.5.5 0 0 0 1 0v-4.5h3a.5.5 0 0 0 .354-.853L9 6V3.207l.854-.853A.5.5 0 0 0 9.5 1.5Z"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M9.5 1.5h-3a.5.5 0 0 0-.354.854L7 3.207V6L4.146 8.854A.5.5 0 0 0 4.5 9.707h3v4.5a.5.5 0 0 0 1 0v-4.5h3a.5.5 0 0 0 .354-.853L9 6V3.207l.854-.853A.5.5 0 0 0 9.5 1.5Z"/>
                </svg>
              )}
            </DIconButton>
          </DTooltip>
          <DTooltip title={expanded ? 'Sbalit do panelu' : 'Otevřít na celé okno'}>
            <DIconButton size="small" onClick={() => setExpanded(e => !e)}>
              {expanded ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 7h5M9 7V2M9 7l5-5M7 9H2M7 9v5M7 9l-5 5"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 7V2h5M2 2l5 5M14 9v5H9M14 14 9 9"/>
                </svg>
              )}
            </DIconButton>
          </DTooltip>
          <DIconButton size="small"><I.link/></DIconButton>
          <DIconButton size="small"><I.more/></DIconButton>
          <DIconButton size="small" onClick={onClose}><I.close/></DIconButton>
        </DBox>

        {/* Body */}
        <DBox sx={{ flex: 1, display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 300px', lg: '1fr 320px' },
          minHeight: 0 }}>
          {/* Main */}
          <DBox sx={{ overflowY: 'auto', p: 3 }}>
            <DTypography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', mb: 0.5,
              cursor: 'text', '&:hover': { bgcolor: 'action.hover' }, p: 0.5, mx: -0.5, borderRadius: 1 }}>
              {task.title}
            </DTypography>
            <DBox sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2 }}>
              <StatusPicker status={status} onChange={(sid) => setTask(t => ({ ...t, status: sid }))}/>
              <DBox sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.4,
                borderRadius: 0.8, bgcolor: dAlpha(prio.color, 0.12), color: prio.color, fontSize: 11.5, fontWeight: 600 }}>
                <PriorityIcon priority={task.priority}/> {prio.name}
              </DBox>
              {epic && (
                <DBox sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.4,
                  borderRadius: 0.8, bgcolor: dAlpha(epic.color, 0.12), color: epic.color, fontSize: 11.5, fontWeight: 600 }}>
                  <DBox sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: epic.color }}/>
                  {epic.title}
                </DBox>
              )}
            </DBox>

            {/* Description */}
            <DTypography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'text.secondary', mb: 0.75 }}>Popis</DTypography>
            <window.RichEditor blocks={blocks}/>

            {/* Subtasks */}
            {subTotal > 0 && (
              <DBox sx={{ mt: 3 }}>
                <DBox sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <DTypography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: 'text.secondary' }}>Subtasky · {subDone}/{subTotal}</DTypography>
                  <DBox sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: 'action.hover', overflow: 'hidden' }}>
                    <DBox sx={{ height: '100%', width: `${(subDone / subTotal) * 100}%`, bgcolor: 'success.main', transition: '0.3s' }}/>
                  </DBox>
                  <DTypography sx={{ fontSize: 11, color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
                    {Math.round((subDone / subTotal) * 100)}%
                  </DTypography>
                </DBox>
                <DBox sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
                  {task.subtasks.map((s, i) => (
                    <DBox key={s.id} onClick={() => toggleSub(s.id)}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.25, py: 0.85,
                        borderTop: i === 0 ? 0 : 1, borderColor: 'divider',
                        bgcolor: 'background.paper', cursor: 'default',
                        '&:hover': { bgcolor: 'action.hover' } }}>
                      <DBox sx={{ width: 16, height: 16, borderRadius: 0.5,
                        border: 1.5, borderColor: s.done ? 'success.main' : 'text.disabled',
                        bgcolor: s.done ? 'success.main' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff' }}>
                        {s.done && <I.check/>}
                      </DBox>
                      <DTypography sx={{ fontSize: 13, flex: 1,
                        textDecoration: s.done ? 'line-through' : 'none',
                        color: s.done ? 'text.disabled' : 'text.primary' }}>{s.title}</DTypography>
                    </DBox>
                  ))}
                </DBox>
              </DBox>
            )}

            {/* Tabs */}
            <DBox sx={{ mt: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 2 }}>
              {(() => {
                const dev = window.FLUX_DEV?.[task.key];
                const devCount = dev ? (dev.branches.length + dev.pulls.length + dev.commits.length) : 0;
                const tabs = [
                  ['comments', `Komentáře · ${task.comments}`],
                  ['dev', devCount > 0 ? `Vývoj · ${devCount}` : 'Vývoj'],
                  ['worklog', `Worklog · ${task.logged}h`],
                  ['activity', 'Historie'],
                ];
                return tabs.map(([k, l]) => (
                  <DBox key={k} onClick={() => setTab(k)}
                    sx={{ py: 1, fontSize: 12.5, fontWeight: 600, cursor: 'default',
                      color: tab === k ? 'primary.main' : 'text.secondary',
                      borderBottom: 2, borderColor: tab === k ? 'primary.main' : 'transparent',
                      mb: '-1px' }}>{l}</DBox>
                ));
              })()}
            </DBox>
            <DBox sx={{ mt: 2 }}>
              {tab === 'comments' && <Comments taskKey={task.key}/>}
              {tab === 'dev' && <DevPanel taskKey={task.key}/>}
              {tab === 'worklog' && <Worklog task={task}/>}
              {tab === 'activity' && <TaskActivity/>}
            </DBox>
          </DBox>

          {/* Sidebar fields — hidden on mobile (shown below main on md+) */}
          <DBox sx={{ borderLeft: { xs: 0, md: 1 }, borderTop: { xs: 1, md: 0 },
            borderColor: 'divider', bgcolor: 'background.paper',
            overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <DTypography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'text.secondary' }}>Detaily</DTypography>

            <FieldRow label="Assignee">
              {assignee ? (
                <DBox sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 12.5, cursor: 'default',
                  '&:hover': { bgcolor: 'action.hover' }, p: 0.5, mx: -0.5, borderRadius: 0.8 }}>
                  <FluxAvatar user={assignee} size={20}/> {assignee.name}
                </DBox>
              ) : <FieldPill dashed>Přiřadit</FieldPill>}
            </FieldRow>
            <FieldRow label="Reporter">
              <DBox sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 12.5 }}>
                <FluxAvatar user={reporter} size={20}/> {reporter.name}
              </DBox>
            </FieldRow>
            <FieldRow label="Priorita">
              <FieldPill color={prio.color}>
                <PriorityIcon priority={task.priority}/> {prio.name}
              </FieldPill>
            </FieldRow>
            <FieldRow label="Typ">
              <FieldPill>
                <TypeIcon type={task.type} size={13}/> {type.name}
              </FieldPill>
            </FieldRow>
            {epic && (
              <FieldRow label="Epic">
                <FieldPill color={epic.color}>
                  <DBox sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: epic.color }}/>
                  {epic.title}
                </FieldPill>
              </FieldRow>
            )}
            {sprint && (
              <FieldRow label="Sprint">
                <DTypography sx={{ fontSize: 12.5 }}>{sprint.name.split(' — ')[0]}</DTypography>
              </FieldRow>
            )}
            <FieldRow label="Štítky">
              <DBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {task.labels.map(lid => {
                  const l = getLabel(lid);
                  return <FieldPill key={lid} color={l.color}>{l.name}</FieldPill>;
                })}
                <FieldPill dashed>+ přidat</FieldPill>
              </DBox>
            </FieldRow>
            <FieldRow label="Estimate">
              <DTypography sx={{ fontSize: 12.5, fontWeight: 600 }}>{task.estimate} h</DTypography>
            </FieldRow>
            <FieldRow label="Logged">
              <DBox sx={{ flex: 1 }}>
                <DBox sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 12.5, fontWeight: 600 }}>
                  {task.logged}h / {task.estimate}h
                  <DBox sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: 'action.hover', overflow: 'hidden' }}>
                    <DBox sx={{ height: '100%',
                      width: `${Math.min(100, (task.logged / task.estimate) * 100)}%`,
                      bgcolor: task.logged > task.estimate ? 'error.main' : 'primary.main' }}/>
                  </DBox>
                </DBox>
              </DBox>
            </FieldRow>
            <FieldRow label="Due">
              <DTypography sx={{ fontSize: 12.5, color: task.due === '2026-04-28' ? 'warning.main' : 'text.primary' }}>
                {task.due ? new Date(task.due).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' }) : '—'}
              </DTypography>
            </FieldRow>

            {task.links?.length > 0 && (
              <>
                <DDivider sx={{ my: 1 }}/>
                <DTypography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: 'text.secondary' }}>Vazby</DTypography>
                {task.links.map((l, i) => (
                  <DBox key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 12 }}>
                    <DTypography sx={{ fontSize: 11, color: 'text.disabled', width: 56 }}>
                      {l.type === 'blocks' ? 'blokuje' : 'souvisí'}
                    </DTypography>
                    <DTypography sx={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', color: 'info.main' }}>{l.key}</DTypography>
                  </DBox>
                ))}
              </>
            )}

            <DDivider sx={{ my: 1 }}/>
            <DTypography sx={{ fontSize: 11, color: 'text.disabled' }}>
              Vytvořeno {timeAgo(task.created)} · Aktualizováno {timeAgo(task.updated)}
            </DTypography>
          </DBox>
        </DBox>
      </DBox>
    </DBox>
  );
}

Object.assign(window, { TaskDetail });
