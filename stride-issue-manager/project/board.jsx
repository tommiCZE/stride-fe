// board.jsx — Kanban board with 3 layout variants

const MUI_B = window.MaterialUI;
const { Box: BBox, Typography: BTypography, Card: BCard, IconButton: BIconButton,
        Stack: BStack, Chip: BChip, Tooltip: BTooltip, Button: BButton,
        TextField: BTextField, InputAdornment: BInputAdornment, Avatar: BAvatar } = MUI_B;
const { alpha: bAlpha } = MUI_B;
const { useState: bUseState, useMemo: bUseMemo, useRef: bUseRef } = React;

// ── Card ──────────────────────────────────────────────────────────────────
function TaskCard({ task, variant = 'standard', onClick, density = 'compact' }) {
  const t = task;
  const proj = getProject(t.project);
  const status = getStatus(t.status);
  const assignee = t.assignee ? getUser(t.assignee) : null;
  const epic = t.epic ? getEpic(t.epic) : null;

  const subDone = (t.subtasks || []).filter(s => s.done).length;
  const subTotal = (t.subtasks || []).length;

  if (variant === 'minimal') {
    // Linear-style — single row, very dense
    return (
      <BBox onClick={onClick} sx={{
        px: 1, py: 0.6, display: 'flex', alignItems: 'center', gap: 0.75,
        cursor: 'default', borderRadius: 1,
        '&:hover': { bgcolor: 'action.hover' },
      }}>
        <PriorityIcon priority={t.priority}/>
        <TypeIcon type={t.type} size={12}/>
        <BTypography sx={{ fontSize: 11, color: 'text.disabled', fontFamily: 'ui-monospace, monospace', flexShrink: 0 }}>
          {t.key}
        </BTypography>
        <BTypography sx={{ fontSize: 12.5, flex: 1, minWidth: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {t.title}
        </BTypography>
        {t.estimate && (
          <BTypography sx={{ fontSize: 11, color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
            {t.estimate}
          </BTypography>
        )}
        <FluxAvatar user={assignee} size={18}/>
      </BBox>
    );
  }

  if (variant === 'visual') {
    // Cover-art top stripe variant
    return (
      <BCard onClick={onClick} sx={{
        cursor: 'default', borderRadius: 1.5, overflow: 'hidden',
        transition: 'all 0.15s',
        '&:hover': { borderColor: 'primary.main', transform: 'translateY(-1px)' },
      }}>
        {epic && (
          <BBox sx={{ height: 4, bgcolor: epic.color }}/>
        )}
        <BBox sx={{ p: 1.25 }}>
          <BBox sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <TypeIcon type={t.type} size={13}/>
            <BTypography sx={{ fontSize: 10.5, color: 'text.disabled', fontFamily: 'ui-monospace, monospace' }}>
              {t.key}
            </BTypography>
            <BBox sx={{ flex: 1 }}/>
            <PriorityIcon priority={t.priority}/>
          </BBox>
          <BTypography sx={{ fontSize: 13, lineHeight: 1.35, fontWeight: 500, mb: 1 }}>
            {t.title}
          </BTypography>
          {epic && (
            <BBox sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.25,
              borderRadius: 0.8, bgcolor: bAlpha(epic.color, 0.12), color: epic.color, mb: 1 }}>
              <BBox sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: epic.color }}/>
              <BTypography sx={{ fontSize: 10.5, fontWeight: 600 }}>{epic.title}</BTypography>
            </BBox>
          )}
          {(t.labels || []).length > 0 && (
            <BBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
              {t.labels.map(lid => {
                const l = getLabel(lid);
                return (
                  <BBox key={lid} sx={{ fontSize: 10, fontWeight: 600, px: 0.6, py: 0.2,
                    borderRadius: 0.6, bgcolor: bAlpha(l.color, 0.13), color: l.color }}>
                    {l.name}
                  </BBox>
                );
              })}
            </BBox>
          )}
          <BBox sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            {subTotal > 0 && (
              <BBox sx={{ display: 'flex', alignItems: 'center', gap: 0.4, fontSize: 11 }}>
                <I.check/> {subDone}/{subTotal}
              </BBox>
            )}
            {t.comments > 0 && (
              <BBox sx={{ display: 'flex', alignItems: 'center', gap: 0.4, fontSize: 11 }}>
                <I.comment/> {t.comments}
              </BBox>
            )}
            {t.attachments > 0 && (
              <BBox sx={{ display: 'flex', alignItems: 'center', gap: 0.4, fontSize: 11 }}>
                <I.attach/> {t.attachments}
              </BBox>
            )}
            {t.logged > 0 && (
              <BBox sx={{ display: 'flex', alignItems: 'center', gap: 0.4, fontSize: 11 }}>
                <I.clock/> {t.logged}h
              </BBox>
            )}
            <BBox sx={{ flex: 1 }}/>
            {t.estimate && (
              <BBox sx={{ fontSize: 10.5, fontWeight: 600, px: 0.6, borderRadius: 0.6,
                bgcolor: 'action.hover' }}>{t.estimate}</BBox>
            )}
            <FluxAvatar user={assignee} size={20}/>
          </BBox>
        </BBox>
      </BCard>
    );
  }

  // standard
  return (
    <BCard onClick={onClick} sx={{
      cursor: 'default', borderRadius: 1.2, p: 1.25,
      transition: 'all 0.12s',
      '&:hover': { borderColor: 'primary.main' },
    }}>
      {epic && (
        <BBox sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.15,
          borderRadius: 0.6, bgcolor: bAlpha(epic.color, 0.12), color: epic.color, mb: 0.75 }}>
          <BTypography sx={{ fontSize: 10, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{epic.key}</BTypography>
          <BTypography sx={{ fontSize: 10, fontWeight: 500 }}>· {epic.title}</BTypography>
        </BBox>
      )}
      <BTypography sx={{ fontSize: 12.5, lineHeight: 1.35, fontWeight: 500, mb: 0.75 }}>
        {t.title}
      </BTypography>
      {(t.labels || []).length > 0 && (
        <BBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.75 }}>
          {t.labels.slice(0, 3).map(lid => {
            const l = getLabel(lid);
            return (
              <BBox key={lid} sx={{ fontSize: 10, fontWeight: 600, px: 0.6, py: 0.15,
                borderRadius: 0.6, bgcolor: bAlpha(l.color, 0.13), color: l.color }}>
                {l.name}
              </BBox>
            );
          })}
        </BBox>
      )}
      <BBox sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
        <TypeIcon type={t.type} size={13}/>
        <BTypography sx={{ fontSize: 10.5, color: 'text.disabled', fontFamily: 'ui-monospace, monospace' }}>
          {t.key}
        </BTypography>
        <PriorityIcon priority={t.priority}/>
        <BBox sx={{ flex: 1 }}/>
        {subTotal > 0 && (
          <BBox sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontSize: 11 }}>
            <I.check/> {subDone}/{subTotal}
          </BBox>
        )}
        {t.comments > 0 && (
          <BBox sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontSize: 11 }}>
            <I.comment/> {t.comments}
          </BBox>
        )}
        {t.estimate && (
          <BBox sx={{ fontSize: 10.5, fontWeight: 600, px: 0.5, borderRadius: 0.6,
            bgcolor: 'action.hover' }}>{t.estimate}</BBox>
        )}
        <FluxAvatar user={assignee} size={18}/>
      </BBox>
    </BCard>
  );
}

// ── Column ────────────────────────────────────────────────────────────────
function Column({ status, tasks, variant, onTaskClick }) {
  const count = tasks.length;
  const isWipBreached = status.wip && count > status.wip;
  const colored = variant === 'colored';

  return (
    <BBox sx={{
      width: variant === 'minimal' ? 280 : 280,
      flexShrink: 0, display: 'flex', flexDirection: 'column',
      bgcolor: colored ? bAlpha(status.color, 0.06) : 'action.hover',
      borderRadius: 1.5,
      border: 1, borderColor: colored ? bAlpha(status.color, 0.2) : 'transparent',
      maxHeight: '100%', minHeight: 0,
    }}>
      {/* Header */}
      <BBox sx={{ px: 1.25, py: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <BBox sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: status.color }}/>
        <BTypography sx={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
          color: colored ? status.color : 'text.secondary' }}>
          {status.name}
        </BTypography>
        <BTypography sx={{ fontSize: 11, color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
          {count}
        </BTypography>
        {status.wip && (
          <BBox sx={{ ml: 0.25, fontSize: 9.5, fontWeight: 700, px: 0.5, borderRadius: 0.5,
            bgcolor: isWipBreached ? 'error.main' : 'action.selected',
            color: isWipBreached ? '#fff' : 'text.secondary' }}>
            WIP {status.wip}
          </BBox>
        )}
        <BBox sx={{ flex: 1 }}/>
        <BIconButton size="small" sx={{ p: 0.25 }}><I.plus/></BIconButton>
        <BIconButton size="small" sx={{ p: 0.25 }}><I.more/></BIconButton>
      </BBox>

      {/* Cards */}
      <BBox sx={{ px: 1, pb: 1, display: 'flex', flexDirection: 'column', gap: 0.75,
        overflowY: 'auto', flex: 1, minHeight: 0 }}>
        {tasks.map(t => (
          <TaskCard key={t.id} task={t} variant={variant === 'minimal' ? 'minimal' : variant === 'visual' ? 'visual' : 'standard'}
                    onClick={() => onTaskClick(t.id)}/>
        ))}
        {tasks.length === 0 && (
          <BBox sx={{ p: 2, textAlign: 'center', color: 'text.disabled', fontSize: 11.5,
            border: 1, borderColor: 'divider', borderStyle: 'dashed', borderRadius: 1 }}>
            Žádné tasky
          </BBox>
        )}
        <BBox sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0.5, borderRadius: 1,
          color: 'text.disabled', fontSize: 11.5, cursor: 'default',
          '&:hover': { bgcolor: 'action.hover', color: 'text.secondary' } }}>
          <I.plus/> Přidat task
        </BBox>
      </BBox>
    </BBox>
  );
}

// ── Board view ────────────────────────────────────────────────────────────
function KanbanBoard({ projectId, variant = 'standard', onTaskClick }) {
  const [search, setSearch] = bUseState('');
  const [filterAssignee, setFilterAssignee] = bUseState(null);
  const [filterMine, setFilterMine] = bUseState(false);
  const [groupBy, setGroupBy] = bUseState('status');

  const allTasks = window.FLUX_TASKS.filter(t => t.project === projectId);
  const filtered = allTasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.key.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterAssignee && t.assignee !== filterAssignee) return false;
    if (filterMine && t.assignee !== 'u1') return false;
    return true;
  });

  const teamMembers = bUseMemo(() => {
    const ids = new Set(allTasks.map(t => t.assignee).filter(Boolean));
    return [...ids].map(id => getUser(id));
  }, [projectId]);

  const sprint = window.FLUX_SPRINTS.find(s => s.project === projectId && s.state === 'active');

  return (
    <BBox sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Toolbar */}
      <BBox sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 1,
                  borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        {sprint && (
          <BBox sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
            <BBox sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }}/>
            <BTypography sx={{ fontSize: 12.5, fontWeight: 600 }}>{sprint.name.split(' — ')[0]}</BTypography>
            <BTypography sx={{ fontSize: 11, color: 'text.secondary' }}>· končí za 1 den</BTypography>
          </BBox>
        )}
        <BTextField placeholder="Hledat v boardu…" value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 200, '& .MuiOutlinedInput-root': { height: 28, fontSize: 12.5 } }}
          InputProps={{ startAdornment: <BInputAdornment position="start" sx={{ mr: 0.5 }}><I.search/></BInputAdornment> }}/>

        {/* Avatars filter */}
        <BBox sx={{ display: 'flex', ml: 0.5 }}>
          {teamMembers.slice(0, 6).map((u, i) => (
            <BTooltip key={u.id} title={u.name}>
              <BBox onClick={() => setFilterAssignee(filterAssignee === u.id ? null : u.id)}
                    sx={{ ml: i === 0 ? 0 : -0.75, cursor: 'default',
                          opacity: filterAssignee && filterAssignee !== u.id ? 0.35 : 1,
                          transform: filterAssignee === u.id ? 'translateY(-1px)' : 'none',
                          transition: '0.15s' }}>
                <FluxAvatar user={u} size={22} ring/>
              </BBox>
            </BTooltip>
          ))}
        </BBox>

        <BButton size="small" variant={filterMine ? 'contained' : 'outlined'} onClick={() => setFilterMine(!filterMine)}
          sx={{ ml: 0.5 }}>Pouze moje</BButton>
        <BButton size="small" variant="outlined" startIcon={<I.filter/>}>Filtry</BButton>

        <BBox sx={{ flex: 1 }}/>

        <BBox sx={{ display: 'flex', border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
          {['status', 'assignee', 'priority'].map(g => (
            <BBox key={g} onClick={() => setGroupBy(g)}
              sx={{ px: 1, py: 0.5, fontSize: 11.5, fontWeight: 600,
                bgcolor: groupBy === g ? 'action.selected' : 'transparent',
                color: groupBy === g ? 'text.primary' : 'text.secondary',
                cursor: 'default', '&:hover': { bgcolor: 'action.hover' } }}>
              {g === 'status' ? 'Status' : g === 'assignee' ? 'Člověk' : 'Priorita'}
            </BBox>
          ))}
        </BBox>
      </BBox>

      {/* Columns */}
      <BBox sx={{ flex: 1, minHeight: 0, overflowX: 'auto', overflowY: 'hidden', p: 1.25 }}>
        <BBox sx={{ display: 'flex', gap: 1, height: '100%' }}>
          {window.FLUX_STATUSES.map(s => {
            const tasks = filtered.filter(t => t.status === s.id);
            return <Column key={s.id} status={s} tasks={tasks} variant={variant} onTaskClick={onTaskClick}/>;
          })}
        </BBox>
      </BBox>
    </BBox>
  );
}

Object.assign(window, { KanbanBoard, TaskCard });
