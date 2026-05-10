// views.jsx — Dashboard, Backlog/List, Reports, Settings, Create modal

const MV = window.MaterialUI;
const { Box: VBox, Typography: VTypography, Card: VCard, IconButton: VIconButton,
        Button: VButton, Divider: VDivider, TextField: VTextField, Chip: VChip,
        LinearProgress: VLinearProgress, Tooltip: VTooltip, Avatar: VAvatar,
        Menu: VMenu, MenuItem: VMenuItem } = MV;
const { alpha: vAlpha } = MV;
const { useState: vUse, useMemo: vMemo } = React;

// ── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ onProjectClick, onTaskClick }) {
  const me = getUser('u1');
  const myTasks = window.FLUX_TASKS.filter(t => t.assignee === 'u1' || t.reporter === 'u1');

  return (
    <VBox sx={{ p: 3, overflowY: 'auto', bgcolor: 'background.default', flex: 1 }}>
      <VBox sx={{ mb: 3 }}>
        <VTypography sx={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary' }}>
          Úterý 28. dubna 2026
        </VTypography>
        <VTypography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Dobré ráno, {me.name.split(' ')[0]} 👋
        </VTypography>
        <VTypography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>
          Sprint 24 končí dnes večer. Máš 3 nedořešené tasky a 2 čekající code review.
        </VTypography>
      </VBox>

      {/* Stat cards */}
      <VBox sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mb: 3 }}>
        {[
          { label: 'Přiřazeno mně', value: 4, sub: '2 due tento týden', color: '#5A5BFF' },
          { label: 'V code review', value: 2, sub: 'WEB-119, WEB-138', color: '#a855f7' },
          { label: 'Logged tento týden', value: '14.5h', sub: 'z plánovaných 32h', color: '#10b981' },
          { label: 'Po termínu', value: 1, sub: 'WEB-103', color: '#ef4444' },
        ].map((s, i) => (
          <VCard key={i} sx={{ p: 1.75, borderRadius: 1.5 }}>
            <VTypography sx={{ fontSize: 11.5, color: 'text.secondary', fontWeight: 500 }}>{s.label}</VTypography>
            <VTypography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: s.color, mt: 0.25 }}>
              {s.value}
            </VTypography>
            <VTypography sx={{ fontSize: 11, color: 'text.disabled' }}>{s.sub}</VTypography>
          </VCard>
        ))}
      </VBox>

      <VBox sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {/* My work */}
        <VCard sx={{ borderRadius: 1.5 }}>
          <VBox sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <VTypography sx={{ fontSize: 13, fontWeight: 700 }}>Moje práce</VTypography>
            <VBox sx={{ flex: 1 }}/>
            <VTypography sx={{ fontSize: 11.5, color: 'primary.main', cursor: 'default' }}>Vše →</VTypography>
          </VBox>
          {myTasks.slice(0, 6).map(t => (
            <VBox key={t.id} onClick={() => onTaskClick(t.id)}
              sx={{ px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1,
                borderBottom: 1, borderColor: 'divider', cursor: 'default',
                '&:hover': { bgcolor: 'action.hover' },
                '&:last-child': { borderBottom: 0 } }}>
              <PriorityIcon priority={t.priority}/>
              <TypeIcon type={t.type} size={13}/>
              <VTypography sx={{ fontSize: 11, color: 'text.disabled', fontFamily: 'ui-monospace, monospace', minWidth: 60 }}>{t.key}</VTypography>
              <VTypography sx={{ fontSize: 12.5, flex: 1, minWidth: 0,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</VTypography>
              <VBox sx={{ display: 'flex', alignItems: 'center', gap: 0.4, px: 0.6, py: 0.2,
                borderRadius: 0.6, bgcolor: vAlpha(getStatus(t.status).color, 0.15),
                color: getStatus(t.status).color, fontSize: 10.5, fontWeight: 600 }}>
                {getStatus(t.status).name}
              </VBox>
            </VBox>
          ))}
        </VCard>

        {/* Activity */}
        <VCard sx={{ borderRadius: 1.5 }}>
          <VBox sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <VTypography sx={{ fontSize: 13, fontWeight: 700 }}>Aktivita týmu</VTypography>
          </VBox>
          <VBox sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {window.FLUX_ACTIVITY.map(a => {
              const u = getUser(a.user);
              return (
                <VBox key={a.id} sx={{ display: 'flex', gap: 1 }}>
                  <FluxAvatar user={u} size={22}/>
                  <VBox sx={{ flex: 1, minWidth: 0 }}>
                    <VTypography sx={{ fontSize: 12.5, lineHeight: 1.4 }}>
                      <b>{u.name}</b> <VBox component="span" sx={{ color: 'text.secondary' }}>{a.action}</VBox>
                      {' '}<VBox component="span" sx={{ fontFamily: 'ui-monospace, monospace', color: 'info.main' }}>{a.target}</VBox>
                    </VTypography>
                    {a.preview && (
                      <VTypography sx={{ fontSize: 11.5, color: 'text.secondary', mt: 0.25,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.preview}</VTypography>
                    )}
                    <VTypography sx={{ fontSize: 10.5, color: 'text.disabled', mt: 0.1 }}>{timeAgo(a.at)}</VTypography>
                  </VBox>
                </VBox>
              );
            })}
          </VBox>
        </VCard>

        {/* Projects */}
        <VCard sx={{ borderRadius: 1.5, gridColumn: '1 / -1' }}>
          <VBox sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <VTypography sx={{ fontSize: 13, fontWeight: 700 }}>Projekty</VTypography>
            <VBox sx={{ flex: 1 }}/>
            <VButton size="small" startIcon={<I.plus/>}>Nový projekt</VButton>
          </VBox>
          <VBox sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, p: 1.5 }}>
            {window.FLUX_PROJECTS.map(p => {
              const lead = getUser(p.lead);
              const pct = ((p.tasks - p.open) / p.tasks);
              return (
                <VBox key={p.id} onClick={() => onProjectClick(p.id)}
                  sx={{ p: 1.5, borderRadius: 1.2, border: 1, borderColor: 'divider', cursor: 'default',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}>
                  <VBox sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <VBox sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: p.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 13, fontWeight: 700 }}>{p.key[0]}</VBox>
                    <VBox sx={{ flex: 1, minWidth: 0 }}>
                      <VTypography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.1 }}>{p.name}</VTypography>
                      <VTypography sx={{ fontSize: 10.5, color: 'text.secondary' }}>{p.key} · {lead.name}</VTypography>
                    </VBox>
                  </VBox>
                  <VBox sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VBox sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: 'action.hover', overflow: 'hidden' }}>
                      <VBox sx={{ height: '100%', width: `${pct * 100}%`, bgcolor: p.color }}/>
                    </VBox>
                    <VTypography sx={{ fontSize: 10.5, color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
                      {p.tasks - p.open}/{p.tasks}
                    </VTypography>
                  </VBox>
                </VBox>
              );
            })}
          </VBox>
        </VCard>
      </VBox>
    </VBox>
  );
}

// ── List view (table) ───────────────────────────────────────────────────────
function ListView({ projectId, onTaskClick }) {
  const tasks = window.FLUX_TASKS.filter(t => t.project === projectId);
  const cols = [
    { key: 'key', label: 'Key', w: 84 },
    { key: 'type', label: 'T', w: 28 },
    { key: 'priority', label: 'P', w: 28 },
    { key: 'title', label: 'Title', flex: 1 },
    { key: 'epic', label: 'Epic', w: 160 },
    { key: 'assignee', label: 'Assignee', w: 130 },
    { key: 'status', label: 'Status', w: 110 },
    { key: 'estimate', label: 'Est', w: 50 },
    { key: 'logged', label: 'Logged', w: 70 },
    { key: 'due', label: 'Due', w: 80 },
  ];

  return (
    <VBox sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
      <VBox sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, gap: 1, borderBottom: 1, borderColor: 'divider', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
        <VTextField placeholder="Filtr…" size="small"
          sx={{ width: 200, '& .MuiOutlinedInput-root': { height: 26, fontSize: 12.5 } }}/>
        <VButton size="small" variant="outlined" startIcon={<I.filter/>}>Filtry</VButton>
        <VBox sx={{ flex: 1 }}/>
        <VTypography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{tasks.length} tasků</VTypography>
      </VBox>
      <VBox sx={{ minWidth: 1100 }}>
        <VBox sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.75, fontSize: 10.5, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary',
          borderBottom: 1, borderColor: 'divider', position: 'sticky', top: 43, bgcolor: 'background.paper', zIndex: 1 }}>
          {cols.map(c => (
            <VBox key={c.key} sx={{ width: c.w, flex: c.flex, px: 0.5 }}>{c.label}</VBox>
          ))}
        </VBox>
        {tasks.map(t => {
          const epic = t.epic ? getEpic(t.epic) : null;
          const assignee = t.assignee ? getUser(t.assignee) : null;
          const status = getStatus(t.status);
          return (
            <VBox key={t.id} onClick={() => onTaskClick(t.id)}
              sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.75, fontSize: 12.5,
                borderBottom: 1, borderColor: 'divider', cursor: 'default',
                '&:hover': { bgcolor: 'action.hover' } }}>
              <VBox sx={{ width: 84, fontFamily: 'ui-monospace, monospace', color: 'text.disabled', fontSize: 11.5, px: 0.5 }}>{t.key}</VBox>
              <VBox sx={{ width: 28, px: 0.5 }}><TypeIcon type={t.type} size={13}/></VBox>
              <VBox sx={{ width: 28, px: 0.5 }}><PriorityIcon priority={t.priority}/></VBox>
              <VBox sx={{ flex: 1, px: 0.5, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</VBox>
              <VBox sx={{ width: 160, px: 0.5, minWidth: 0 }}>
                {epic && (
                  <VBox sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 11, color: epic.color }}>
                    <VBox sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: epic.color }}/>
                    <VBox sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{epic.title}</VBox>
                  </VBox>
                )}
              </VBox>
              <VBox sx={{ width: 130, px: 0.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <FluxAvatar user={assignee} size={18}/>
                {assignee && <VBox sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{assignee.name.split(' ')[0]}</VBox>}
              </VBox>
              <VBox sx={{ width: 110, px: 0.5 }}>
                <VBox sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, px: 0.6, py: 0.2,
                  borderRadius: 0.6, bgcolor: vAlpha(status.color, 0.14),
                  color: status.color, fontSize: 10.5, fontWeight: 600 }}>
                  <VBox sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: status.color }}/>
                  {status.name}
                </VBox>
              </VBox>
              <VBox sx={{ width: 50, px: 0.5, fontVariantNumeric: 'tabular-nums', fontSize: 11.5, color: 'text.secondary' }}>{t.estimate || '—'}</VBox>
              <VBox sx={{ width: 70, px: 0.5, fontVariantNumeric: 'tabular-nums', fontSize: 11.5, color: 'text.secondary' }}>{t.logged}h</VBox>
              <VBox sx={{ width: 80, px: 0.5, fontSize: 11.5, color: 'text.secondary' }}>
                {t.due ? new Date(t.due).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' }) : '—'}
              </VBox>
            </VBox>
          );
        })}
      </VBox>
    </VBox>
  );
}

// ── Backlog ─────────────────────────────────────────────────────────────────
function Backlog({ projectId, onTaskClick }) {
  const sprints = window.FLUX_SPRINTS.filter(s => s.project === projectId);
  const allTasks = window.FLUX_TASKS.filter(t => t.project === projectId);

  return (
    <VBox sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {sprints.map(sp => {
        const tasks = allTasks.filter(t => t.sprint === sp.id);
        const totalE = tasks.reduce((a, t) => a + (t.estimate || 0), 0);
        const totalL = tasks.reduce((a, t) => a + (t.logged || 0), 0);
        return (
          <VCard key={sp.id} sx={{ borderRadius: 1.5 }}>
            <VBox sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
              <I.caret/>
              <VBox>
                <VTypography sx={{ fontSize: 13.5, fontWeight: 700 }}>{sp.name}</VTypography>
                <VTypography sx={{ fontSize: 11, color: 'text.secondary' }}>
                  {new Date(sp.start).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })} – {new Date(sp.end).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })} · {tasks.length} tasků · {totalE}h plán / {totalL}h logged
                </VTypography>
              </VBox>
              <VBox sx={{ flex: 1 }}/>
              <VBox sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.3,
                borderRadius: 0.8, bgcolor: sp.state === 'active' ? vAlpha('#10b981', 0.15) : sp.state === 'planned' ? vAlpha('#5A5BFF', 0.15) : vAlpha('#64748b', 0.15),
                color: sp.state === 'active' ? '#10b981' : sp.state === 'planned' ? '#5A5BFF' : '#64748b',
                fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {sp.state === 'active' ? 'Aktivní' : sp.state === 'planned' ? 'Plánovaný' : 'Hotový'}
              </VBox>
              {sp.state === 'planned' && <VButton size="small" variant="contained">Spustit sprint</VButton>}
            </VBox>
            {tasks.map(t => (
              <VBox key={t.id} onClick={() => onTaskClick(t.id)}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75,
                  borderBottom: 1, borderColor: 'divider', cursor: 'default',
                  '&:hover': { bgcolor: 'action.hover' },
                  '&:last-child': { borderBottom: 0 } }}>
                <PriorityIcon priority={t.priority}/>
                <TypeIcon type={t.type} size={13}/>
                <VTypography sx={{ fontSize: 11, color: 'text.disabled', fontFamily: 'ui-monospace, monospace', minWidth: 60 }}>{t.key}</VTypography>
                <VTypography sx={{ fontSize: 12.5, flex: 1, minWidth: 0,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</VTypography>
                <VBox sx={{ fontSize: 10.5, fontWeight: 600, px: 0.5, borderRadius: 0.6, bgcolor: 'action.hover' }}>
                  {t.estimate || '—'}
                </VBox>
                <FluxAvatar user={t.assignee ? getUser(t.assignee) : null} size={18}/>
              </VBox>
            ))}
          </VCard>
        );
      })}

      {/* Backlog (no sprint) */}
      <VCard sx={{ borderRadius: 1.5 }}>
        <VBox sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <I.caret/>
          <VTypography sx={{ fontSize: 13.5, fontWeight: 700 }}>Backlog</VTypography>
          <VTypography sx={{ fontSize: 11, color: 'text.secondary' }}>· {allTasks.filter(t => !t.sprint).length} tasků</VTypography>
        </VBox>
        {allTasks.filter(t => !t.sprint).map(t => (
          <VBox key={t.id} onClick={() => onTaskClick(t.id)}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75,
              borderBottom: 1, borderColor: 'divider', cursor: 'default',
              '&:hover': { bgcolor: 'action.hover' },
              '&:last-child': { borderBottom: 0 } }}>
            <PriorityIcon priority={t.priority}/>
            <TypeIcon type={t.type} size={13}/>
            <VTypography sx={{ fontSize: 11, color: 'text.disabled', fontFamily: 'ui-monospace, monospace', minWidth: 60 }}>{t.key}</VTypography>
            <VTypography sx={{ fontSize: 12.5, flex: 1, minWidth: 0,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</VTypography>
            <FluxAvatar user={t.assignee ? getUser(t.assignee) : null} size={18}/>
          </VBox>
        ))}
      </VCard>
    </VBox>
  );
}

// ── Reports ────────────────────────────────────────────────────────────────
function Reports({ projectId }) {
  // Time by user
  const tasks = projectId ? window.FLUX_TASKS.filter(t => t.project === projectId) : window.FLUX_TASKS;
  const byUser = {};
  for (const t of tasks) {
    if (t.assignee) byUser[t.assignee] = (byUser[t.assignee] || 0) + (t.logged || 0);
  }
  const userRows = Object.entries(byUser).map(([uid, h]) => ({ user: getUser(uid), h }))
    .sort((a, b) => b.h - a.h);
  const maxH = Math.max(...userRows.map(r => r.h), 1);

  const byProject = {};
  for (const t of window.FLUX_TASKS) {
    byProject[t.project] = (byProject[t.project] || 0) + (t.logged || 0);
  }
  const projRows = Object.entries(byProject).map(([pid, h]) => ({ project: getProject(pid), h }))
    .sort((a, b) => b.h - a.h);
  const maxP = Math.max(...projRows.map(r => r.h), 1);

  const days = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
  const weekData = [4, 6, 3.5, 5, 7, 0, 0];
  const maxD = Math.max(...weekData);

  return (
    <VBox sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: 'background.default' }}>
      <VTypography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', mb: 0.25 }}>Reporty času</VTypography>
      <VTypography sx={{ fontSize: 13, color: 'text.secondary', mb: 3 }}>Posledních 14 dní · všichni členové týmu</VTypography>

      <VBox sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 3 }}>
        {[
          { label: 'Logged celkem', value: '142.5h', sub: '+18% vs minulý týden', color: '#5A5BFF' },
          { label: 'Plánováno', value: '180h', sub: '79% využití', color: '#10b981' },
          { label: 'Průměr / člověka', value: '17.8h', sub: 'týdně', color: '#f59e0b' },
        ].map((s, i) => (
          <VCard key={i} sx={{ p: 1.75, borderRadius: 1.5 }}>
            <VTypography sx={{ fontSize: 11.5, color: 'text.secondary', fontWeight: 500 }}>{s.label}</VTypography>
            <VTypography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: s.color, mt: 0.25 }}>{s.value}</VTypography>
            <VTypography sx={{ fontSize: 11, color: 'text.disabled' }}>{s.sub}</VTypography>
          </VCard>
        ))}
      </VBox>

      <VBox sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
        {/* By person */}
        <VCard sx={{ borderRadius: 1.5, p: 2 }}>
          <VTypography sx={{ fontSize: 13, fontWeight: 700, mb: 1.5 }}>Čas podle člověka</VTypography>
          <VBox sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {userRows.map(r => (
              <VBox key={r.user.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FluxAvatar user={r.user} size={20}/>
                <VTypography sx={{ fontSize: 12, width: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.user.name}</VTypography>
                <VBox sx={{ flex: 1, height: 8, bgcolor: 'action.hover', borderRadius: 1, overflow: 'hidden' }}>
                  <VBox sx={{ height: '100%', width: `${(r.h / maxH) * 100}%`, bgcolor: r.user.color, borderRadius: 1 }}/>
                </VBox>
                <VTypography sx={{ fontSize: 11.5, fontWeight: 600, width: 36, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.h}h</VTypography>
              </VBox>
            ))}
          </VBox>
        </VCard>

        {/* By project */}
        <VCard sx={{ borderRadius: 1.5, p: 2 }}>
          <VTypography sx={{ fontSize: 13, fontWeight: 700, mb: 1.5 }}>Čas podle projektu</VTypography>
          <VBox sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {projRows.map(r => (
              <VBox key={r.project.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VBox sx={{ width: 18, height: 18, borderRadius: 0.6, bgcolor: r.project.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 10.5, fontWeight: 700 }}>{r.project.key[0]}</VBox>
                <VTypography sx={{ fontSize: 12, width: 130 }}>{r.project.name}</VTypography>
                <VBox sx={{ flex: 1, height: 8, bgcolor: 'action.hover', borderRadius: 1, overflow: 'hidden' }}>
                  <VBox sx={{ height: '100%', width: `${(r.h / maxP) * 100}%`, bgcolor: r.project.color, borderRadius: 1 }}/>
                </VBox>
                <VTypography sx={{ fontSize: 11.5, fontWeight: 600, width: 36, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.h}h</VTypography>
              </VBox>
            ))}
          </VBox>
        </VCard>

        {/* Weekly chart */}
        <VCard sx={{ borderRadius: 1.5, p: 2, gridColumn: '1 / -1' }}>
          <VTypography sx={{ fontSize: 13, fontWeight: 700, mb: 1.5 }}>Tento týden</VTypography>
          <VBox sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 140, mt: 1 }}>
            {weekData.map((v, i) => (
              <VBox key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <VTypography sx={{ fontSize: 10.5, color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
                  {v > 0 ? `${v}h` : ''}
                </VTypography>
                <VBox sx={{ width: '100%', height: `${(v / maxD) * 100}%`,
                  background: `linear-gradient(180deg, #5A5BFF, ${vAlpha('#5A5BFF', 0.6)})`,
                  borderRadius: '4px 4px 0 0', minHeight: 2 }}/>
                <VTypography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}>{days[i]}</VTypography>
              </VBox>
            ))}
          </VBox>
        </VCard>
      </VBox>
    </VBox>
  );
}

// ── Settings ───────────────────────────────────────────────────────────────
function ProviderLogo({ provider, size = 18 }) {
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

function IntegrationCard({ ig }) {
  const [expanded, setExpanded] = vUse(false);
  return (
    <VBox sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden', mb: 1.5 }}>
      <VBox sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
        bgcolor: 'background.paper', cursor: 'default' }}
        onClick={() => setExpanded(e => !e)}>
        <VBox sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: 'action.hover',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ProviderLogo provider={ig.provider} size={20}/>
        </VBox>
        <VBox sx={{ flex: 1 }}>
          <VBox sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VTypography sx={{ fontSize: 14, fontWeight: 700 }}>{ig.name}</VTypography>
            <VBox sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5,
              px: 0.75, py: 0.15, borderRadius: 1, fontSize: 10.5, fontWeight: 600,
              color: ig.connected ? '#10b981' : '#94a3b8',
              bgcolor: (ig.connected ? '#10b981' : '#94a3b8') + '22' }}>
              <VBox sx={{ width: 6, height: 6, borderRadius: '50%',
                bgcolor: ig.connected ? '#10b981' : '#94a3b8' }}/>
              {ig.connected ? 'Připojeno' : 'Nepřipojeno'}
            </VBox>
          </VBox>
          <VTypography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
            {ig.connected ? `${ig.org} · ${ig.repos.filter(r=>r.linked).length} repo · sync ${timeAgo(ig.lastSync)}`
                          : 'Připoj svou organizaci a propoj repository.'}
          </VTypography>
        </VBox>
        {ig.connected ? (
          <VButton size="small" variant="outlined" onClick={(e) => e.stopPropagation()}>Spravovat</VButton>
        ) : (
          <VButton size="small" variant="contained">Připojit</VButton>
        )}
      </VBox>

      {expanded && ig.connected && (
        <VBox sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.default', p: 1.5 }}>
          <VTypography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'text.secondary', mb: 0.75 }}>Repository</VTypography>
          <VBox sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
            {ig.repos.map((r, i) => (
              <VBox key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1,
                border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
                <ProviderLogo provider={ig.provider} size={13}/>
                <VTypography sx={{ fontSize: 12.5, fontFamily: 'JetBrains Mono, ui-monospace, monospace', flex: 1 }}>
                  {r.full}
                </VTypography>
                <VTypography sx={{ fontSize: 10.5, px: 0.5, py: 0.1, borderRadius: 0.5,
                  bgcolor: 'action.hover', color: 'text.secondary' }}>{r.lang}</VTypography>
                <VBox sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4,
                  px: 0.6, py: 0.2, borderRadius: 0.6, fontSize: 10.5, fontWeight: 600,
                  color: r.linked ? '#10b981' : 'text.disabled',
                  bgcolor: r.linked ? '#10b98122' : 'transparent',
                  border: r.linked ? 0 : 1, borderColor: 'divider' }}>
                  {r.linked ? '✓ propojeno' : 'připojit'}
                </VBox>
              </VBox>
            ))}
          </VBox>

          <VTypography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'text.secondary', mb: 0.75 }}>Webhooky</VTypography>
          <VBox sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
            {ig.webhooks.map(w => (
              <VBox key={w} sx={{ fontSize: 11, fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                px: 0.75, py: 0.25, borderRadius: 0.6, bgcolor: 'action.hover' }}>{w}</VBox>
            ))}
          </VBox>

          <VTypography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'text.secondary', mb: 0.75 }}>Automatizace</VTypography>
          <VBox sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <VBox sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1,
              border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
              <VBox sx={{ flex: 1 }}>
                <VTypography sx={{ fontSize: 12.5, fontWeight: 600 }}>Smart commits</VTypography>
                <VTypography sx={{ fontSize: 11, color: 'text.secondary' }}>
                  Logovat čas a měnit status pomocí <code>WEB-142 #log 1h</code>, <code>#done</code>.
                </VTypography>
              </VBox>
              <VBox sx={{ width: 32, height: 18, borderRadius: 9,
                bgcolor: ig.smartCommits ? 'primary.main' : 'action.hover', position: 'relative' }}>
                <VBox sx={{ position: 'absolute', top: 2, left: ig.smartCommits ? 16 : 2,
                  width: 14, height: 14, borderRadius: '50%', bgcolor: '#fff', transition: '0.2s' }}/>
              </VBox>
            </VBox>
            <VBox sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1,
              border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
              <VBox sx={{ flex: 1 }}>
                <VTypography sx={{ fontSize: 12.5, fontWeight: 600 }}>Auto-přechod statusů</VTypography>
                <VTypography sx={{ fontSize: 11, color: 'text.secondary' }}>
                  Otevřený PR → In Review · Merge → Done.
                </VTypography>
              </VBox>
              <VBox sx={{ width: 32, height: 18, borderRadius: 9,
                bgcolor: ig.autoTransition ? 'primary.main' : 'action.hover', position: 'relative' }}>
                <VBox sx={{ position: 'absolute', top: 2, left: ig.autoTransition ? 16 : 2,
                  width: 14, height: 14, borderRadius: '50%', bgcolor: '#fff', transition: '0.2s' }}/>
              </VBox>
            </VBox>
          </VBox>
        </VBox>
      )}
    </VBox>
  );
}

function Settings({ project }) {
  return (
    <VBox sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: 'background.default', maxWidth: 720 }}>
      <VTypography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', mb: 2 }}>
        Nastavení projektu
      </VTypography>

      <VCard sx={{ borderRadius: 1.5, p: 2.5, mb: 2 }}>
        <VTypography sx={{ fontSize: 13, fontWeight: 700, mb: 1.5 }}>Obecné</VTypography>
        <VBox sx={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 2, alignItems: 'center' }}>
          <VTypography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Název</VTypography>
          <VTextField size="small" defaultValue={project.name} sx={{ '& .MuiInputBase-root': { fontSize: 13 } }}/>
          <VTypography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Klíč</VTypography>
          <VTextField size="small" defaultValue={project.key} sx={{ width: 140, '& .MuiInputBase-root': { fontSize: 13, fontFamily: 'ui-monospace, monospace' } }}/>
          <VTypography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Lead</VTypography>
          <VBox sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FluxAvatar user={getUser(project.lead)} size={22}/>
            <VTypography sx={{ fontSize: 13 }}>{getUser(project.lead).name}</VTypography>
          </VBox>
          <VTypography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Barva</VTypography>
          <VBox sx={{ display: 'flex', gap: 0.75 }}>
            {['#6366f1', '#0ea5e9', '#ec4899', '#10b981', '#f59e0b', '#a855f7', '#ef4444'].map(c => (
              <VBox key={c} sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: c, cursor: 'default',
                outline: c === project.color ? '2px solid' : 'none', outlineColor: 'text.primary', outlineOffset: 2 }}/>
            ))}
          </VBox>
        </VBox>
      </VCard>

      <VCard sx={{ borderRadius: 1.5, p: 2.5, mb: 2 }}>
        <VTypography sx={{ fontSize: 13, fontWeight: 700, mb: 1.5 }}>Workflow / sloupce</VTypography>
        <VBox sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {window.FLUX_STATUSES.map((s, i) => (
            <VBox key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.75,
              borderRadius: 1, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
              <VBox sx={{ color: 'text.disabled', fontSize: 12 }}>≡</VBox>
              <VBox sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }}/>
              <VTypography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{s.name}</VTypography>
              {s.wip && (
                <VTypography sx={{ fontSize: 11, color: 'text.disabled' }}>WIP {s.wip}</VTypography>
              )}
              <VIconButton size="small"><I.more/></VIconButton>
            </VBox>
          ))}
          <VButton size="small" startIcon={<I.plus/>} sx={{ alignSelf: 'flex-start', mt: 0.5 }}>Přidat sloupec</VButton>
        </VBox>
      </VCard>

      <VCard sx={{ borderRadius: 1.5, p: 2.5, mb: 2 }}>
        <VBox sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <VTypography sx={{ fontSize: 13, fontWeight: 700 }}>Integrace s Gitem</VTypography>
          <VTypography sx={{ fontSize: 11, color: 'text.secondary' }}>
            Propoj branches, PR/MR a commity přímo s tasky.
          </VTypography>
        </VBox>
        {(window.FLUX_GIT_INTEGRATIONS || []).map(ig => (
          <IntegrationCard key={ig.id} ig={ig}/>
        ))}
        <VBox sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
          <VButton size="small" variant="outlined" startIcon={<ProviderLogo provider="github" size={14}/>}>
            Přidat GitHub účet
          </VButton>
          <VButton size="small" variant="outlined" startIcon={<ProviderLogo provider="gitlab" size={14}/>}>
            Přidat GitLab účet
          </VButton>
          <VBox sx={{ flex: 1 }}/>
          <VButton size="small">Bitbucket…</VButton>
        </VBox>
      </VCard>

      <VCard sx={{ borderRadius: 1.5, p: 2.5 }}>
        <VTypography sx={{ fontSize: 13, fontWeight: 700, mb: 1.5 }}>Členové týmu</VTypography>
        <VBox sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {window.FLUX_USERS.map(u => (
            <VBox key={u.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1, py: 0.75 }}>
              <FluxAvatar user={u} size={26}/>
              <VBox sx={{ flex: 1 }}>
                <VTypography sx={{ fontSize: 13, fontWeight: 500 }}>{u.name}</VTypography>
                <VTypography sx={{ fontSize: 11, color: 'text.secondary' }}>{u.role}</VTypography>
              </VBox>
              <VBox sx={{ fontSize: 10.5, fontWeight: 600, px: 0.75, py: 0.2, borderRadius: 0.6,
                bgcolor: 'action.hover', color: 'text.secondary' }}>
                {u.id === 'u1' ? 'Admin' : 'Member'}
              </VBox>
            </VBox>
          ))}
        </VBox>
      </VCard>
    </VBox>
  );
}

// ── Create modal ───────────────────────────────────────────────────────────
function CreateTaskModal({ projectId, onClose }) {
  const proj = getProject(projectId);
  const [title, setTitle] = vUse('');
  const [type, setType] = vUse('task');
  const [priority, setPriority] = vUse('medium');
  const [assignee, setAssignee] = vUse(null);

  return (
    <VBox onClick={onClose} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.5)',
      zIndex: 1400, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', pt: '8vh' }}>
      <VCard onClick={(e) => e.stopPropagation()}
        sx={{ width: 640, borderRadius: 1.5, overflow: 'hidden' }}>
        <VBox sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
          <VTypography sx={{ fontSize: 13, fontWeight: 600 }}>Nový task v {proj.name}</VTypography>
          <VBox sx={{ flex: 1 }}/>
          <VIconButton size="small" onClick={onClose}><I.close/></VIconButton>
        </VBox>
        <VBox sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <VBox sx={{ display: 'flex', gap: 1 }}>
            {window.FLUX_TYPES.map(t => (
              <VBox key={t.id} onClick={() => setType(t.id)}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5,
                  border: 1, borderColor: type === t.id ? t.color : 'divider',
                  bgcolor: type === t.id ? vAlpha(t.color, 0.1) : 'transparent',
                  color: type === t.id ? t.color : 'text.secondary',
                  borderRadius: 1, fontSize: 12.5, fontWeight: 500, cursor: 'default' }}>
                <TypeIcon type={t.id} size={12}/> {t.name}
              </VBox>
            ))}
          </VBox>
          <VTextField placeholder="Title…" autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
            sx={{ '& .MuiInputBase-root': { fontSize: 16, fontWeight: 500 } }}/>
          <VBox sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.25,
            fontSize: 13, color: 'text.disabled', minHeight: 80 }}>
            Popis… (slash menu, mentions, code, obrázky)
          </VBox>
          <VBox sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <VBox sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.4, borderRadius: 0.8,
              border: '1px dashed', borderColor: 'divider', fontSize: 12, color: 'text.secondary', cursor: 'default' }}>
              + Assignee
            </VBox>
            <VBox sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.4, borderRadius: 0.8,
              bgcolor: vAlpha(getPriority(priority).color, 0.12), color: getPriority(priority).color,
              fontSize: 12, fontWeight: 600, cursor: 'default' }}>
              <PriorityIcon priority={priority}/> {getPriority(priority).name}
            </VBox>
            <VBox sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.4, borderRadius: 0.8,
              border: '1px dashed', borderColor: 'divider', fontSize: 12, color: 'text.secondary' }}>+ Štítky</VBox>
            <VBox sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.4, borderRadius: 0.8,
              border: '1px dashed', borderColor: 'divider', fontSize: 12, color: 'text.secondary' }}>+ Sprint</VBox>
            <VBox sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.4, borderRadius: 0.8,
              border: '1px dashed', borderColor: 'divider', fontSize: 12, color: 'text.secondary' }}>+ Estimate</VBox>
          </VBox>
        </VBox>
        <VBox sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
          <VBox sx={{ flex: 1 }}/>
          <VButton size="small" onClick={onClose}>Zrušit</VButton>
          <VButton size="small" variant="contained" disabled={!title}>Vytvořit task</VButton>
        </VBox>
      </VCard>
    </VBox>
  );
}

Object.assign(window, { Dashboard, ListView, Backlog, Reports, Settings, CreateTaskModal });
