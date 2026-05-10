// Mock data for Flux — projects, users, tasks, sprints, activity

const FLUX_USERS = [
  { id: 'u1', name: 'Tomáš Veselý', initials: 'TV', color: '#6366f1', role: 'PM' },
  { id: 'u2', name: 'Jana Nováková', initials: 'JN', color: '#ec4899', role: 'Frontend' },
  { id: 'u3', name: 'Pavel Dvořák', initials: 'PD', color: '#0ea5e9', role: 'Backend' },
  { id: 'u4', name: 'Klára Svobodová', initials: 'KS', color: '#10b981', role: 'Design' },
  { id: 'u5', name: 'Marek Procházka', initials: 'MP', color: '#f59e0b', role: 'QA' },
  { id: 'u6', name: 'Eva Horáková', initials: 'EH', color: '#8b5cf6', role: 'Frontend' },
  { id: 'u7', name: 'David Kučera', initials: 'DK', color: '#ef4444', role: 'DevOps' },
  { id: 'u8', name: 'Lucie Marešová', initials: 'LM', color: '#14b8a6', role: 'PO' },
];

const FLUX_PROJECTS = [
  { id: 'p1', key: 'WEB', name: 'Webová aplikace', color: '#6366f1', icon: '◆', lead: 'u1', tasks: 47, open: 18 },
  { id: 'p2', key: 'API', name: 'API & integrace', color: '#0ea5e9', icon: '▲', lead: 'u3', tasks: 32, open: 9 },
  { id: 'p3', key: 'MOB', name: 'Mobilní aplikace', color: '#ec4899', icon: '●', lead: 'u8', tasks: 28, open: 14 },
  { id: 'p4', key: 'DSN', name: 'Design system', color: '#10b981', icon: '■', lead: 'u4', tasks: 19, open: 5 },
  { id: 'p5', key: 'OPS', name: 'Infrastruktura', color: '#f59e0b', icon: '◇', lead: 'u7', tasks: 15, open: 3 },
];

const FLUX_STATUSES = [
  { id: 'todo',     name: 'To Do',       color: '#64748b', wip: null },
  { id: 'progress', name: 'In Progress', color: '#3b82f6', wip: 5 },
  { id: 'review',   name: 'In Review',   color: '#a855f7', wip: 3 },
  { id: 'testing',  name: 'Testing',     color: '#f59e0b', wip: null },
  { id: 'done',     name: 'Done',        color: '#10b981', wip: null },
];

const FLUX_PRIORITIES = [
  { id: 'urgent', name: 'Urgent', color: '#dc2626', icon: '⏶⏶' },
  { id: 'high',   name: 'High',   color: '#ea580c', icon: '⏶' },
  { id: 'medium', name: 'Medium', color: '#eab308', icon: '=' },
  { id: 'low',    name: 'Low',    color: '#22c55e', icon: '⏷' },
];

const FLUX_TYPES = [
  { id: 'story', name: 'Story', color: '#22c55e', icon: '◆' },
  { id: 'task',  name: 'Task',  color: '#3b82f6', icon: '✓' },
  { id: 'bug',   name: 'Bug',   color: '#ef4444', icon: '●' },
  { id: 'epic',  name: 'Epic',  color: '#a855f7', icon: '⚡' },
];

const FLUX_LABELS = [
  { id: 'l1', name: 'frontend',    color: '#6366f1' },
  { id: 'l2', name: 'backend',     color: '#0ea5e9' },
  { id: 'l3', name: 'urgent-fix',  color: '#ef4444' },
  { id: 'l4', name: 'tech-debt',   color: '#64748b' },
  { id: 'l5', name: 'ux',          color: '#ec4899' },
  { id: 'l6', name: 'performance', color: '#f59e0b' },
  { id: 'l7', name: 'a11y',        color: '#10b981' },
  { id: 'l8', name: 'mobile',      color: '#8b5cf6' },
];

const FLUX_SPRINTS = [
  { id: 's1', name: 'Sprint 24 — Auth & onboarding', project: 'p1', start: '2026-04-14', end: '2026-04-28', state: 'active', goal: 'Dokončit nový onboarding flow + 2FA' },
  { id: 's2', name: 'Sprint 25 — Editor v2',         project: 'p1', start: '2026-04-28', end: '2026-05-12', state: 'planned', goal: 'WYSIWYG editor s obrázky' },
  { id: 's3', name: 'Sprint 23 — API rate limits',   project: 'p2', start: '2026-03-31', end: '2026-04-14', state: 'completed', goal: 'Rate limiting a observability' },
];

const FLUX_EPICS = [
  { id: 'e1', key: 'WEB-1',  title: 'Onboarding redesign',         project: 'p1', color: '#6366f1', progress: 0.62 },
  { id: 'e2', key: 'WEB-22', title: 'Editor v2 (WYSIWYG)',         project: 'p1', color: '#ec4899', progress: 0.18 },
  { id: 'e3', key: 'API-3',  title: 'Rate limiting',               project: 'p2', color: '#0ea5e9', progress: 1.00 },
  { id: 'e4', key: 'MOB-7',  title: 'Push notifikace',             project: 'p3', color: '#a855f7', progress: 0.40 },
];

// ── Tasks ────────────────────────────────────────────────────────────────────
const FLUX_TASKS = [
  {
    id: 't1', key: 'WEB-142', title: 'Slash menu v rich-text editoru',
    type: 'story', status: 'progress', priority: 'high', project: 'p1', epic: 'e2', sprint: 's2',
    assignee: 'u2', reporter: 'u1', labels: ['l1', 'l5'],
    estimate: 8, logged: 4.5, due: '2026-05-08',
    subtasks: [
      { id: 'st1', title: 'Návrh slash menu UI',         done: true },
      { id: 'st2', title: 'Heading / list / quote',      done: true },
      { id: 'st3', title: 'Image insert + drag & drop',  done: false },
      { id: 'st4', title: 'Code block s highlightem',    done: false },
      { id: 'st5', title: 'Mention picker (@user)',      done: false },
    ],
    comments: 4, attachments: 2,
    links: [{ type: 'blocks', key: 'WEB-148' }, { type: 'relates', key: 'WEB-150' }],
    description: '__RICH_DESC_1__',
    updated: '2026-04-27T14:32:00',
    created: '2026-04-21T09:15:00',
  },
  {
    id: 't2', key: 'WEB-148', title: 'Inline obrázky — upload + paste z clipboardu',
    type: 'task', status: 'progress', priority: 'high', project: 'p1', epic: 'e2', sprint: 's2',
    assignee: 'u6', reporter: 'u1', labels: ['l1'],
    estimate: 5, logged: 2, due: '2026-05-10',
    subtasks: [], comments: 2, attachments: 0, links: [],
    description: 'Podpora pro paste obrázku ze schránky a drag & drop. Upload na S3, optimistický náhled.',
    updated: '2026-04-27T11:02:00', created: '2026-04-22T13:00:00',
  },
  {
    id: 't3', key: 'WEB-150', title: 'Tabulky v editoru',
    type: 'story', status: 'todo', priority: 'medium', project: 'p1', epic: 'e2', sprint: 's2',
    assignee: 'u2', reporter: 'u1', labels: ['l1'],
    estimate: 13, logged: 0, due: '2026-05-12',
    subtasks: [], comments: 0, attachments: 0, links: [],
    description: 'Resizable tabulky, slučování buněk, header row.',
    updated: '2026-04-25T09:00:00', created: '2026-04-25T09:00:00',
  },
  {
    id: 't4', key: 'WEB-119', title: 'Reset hesla — nová obrazovka',
    type: 'task', status: 'review', priority: 'medium', project: 'p1', epic: 'e1', sprint: 's1',
    assignee: 'u6', reporter: 'u1', labels: ['l1', 'l7'],
    estimate: 3, logged: 3.5, due: '2026-04-28',
    subtasks: [], comments: 7, attachments: 3, links: [],
    description: 'Email link → token verifikace → nové heslo. Pozor na expiraci tokenu (15 min).',
    updated: '2026-04-27T16:45:00', created: '2026-04-18T10:30:00',
  },
  {
    id: 't5', key: 'WEB-103', title: '2FA — TOTP setup flow',
    type: 'story', status: 'testing', priority: 'urgent', project: 'p1', epic: 'e1', sprint: 's1',
    assignee: 'u3', reporter: 'u8', labels: ['l2'],
    estimate: 8, logged: 9, due: '2026-04-28',
    subtasks: [], comments: 12, attachments: 1, links: [{ type: 'blocks', key: 'WEB-130' }],
    description: 'Generování QR, ověření kódu, backup kódy. RFC 6238.',
    updated: '2026-04-27T18:00:00', created: '2026-04-15T08:00:00',
  },
  {
    id: 't6', key: 'WEB-130', title: 'Onboarding wizard — finální copy',
    type: 'task', status: 'done', priority: 'low', project: 'p1', epic: 'e1', sprint: 's1',
    assignee: 'u4', reporter: 'u1', labels: ['l5'],
    estimate: 2, logged: 2.5, due: '2026-04-25',
    subtasks: [], comments: 3, attachments: 0, links: [],
    description: '4 kroky, friendly tone. Schválit s marketingem.',
    updated: '2026-04-25T14:00:00', created: '2026-04-19T10:00:00',
  },
  {
    id: 't7', key: 'WEB-156', title: 'Crash při uploadu PDF > 10MB',
    type: 'bug', status: 'todo', priority: 'urgent', project: 'p1', sprint: 's2',
    assignee: 'u3', reporter: 'u5', labels: ['l3', 'l2'],
    estimate: 3, logged: 0, due: '2026-04-30',
    subtasks: [], comments: 1, attachments: 2, links: [],
    description: 'Chrome 124+, soubor > 10MB → 500. Nejspíš timeout v load balanceru.',
    updated: '2026-04-27T09:30:00', created: '2026-04-27T09:30:00',
  },
  {
    id: 't8', key: 'WEB-145', title: 'Dark mode pro dashboard',
    type: 'task', status: 'progress', priority: 'low', project: 'p1', sprint: 's2',
    assignee: 'u2', reporter: 'u4', labels: ['l1', 'l5'],
    estimate: 5, logged: 1.5, due: '2026-05-05',
    subtasks: [], comments: 0, attachments: 0, links: [],
    description: 'Dotáhnout chybějící tokeny, otestovat kontrast.',
    updated: '2026-04-26T15:20:00', created: '2026-04-23T11:00:00',
  },
  {
    id: 't9', key: 'WEB-160', title: 'Keyboard shortcuts — global help (?)',
    type: 'story', status: 'todo', priority: 'medium', project: 'p1',
    assignee: null, reporter: 'u1', labels: ['l5'],
    estimate: 5, logged: 0, due: null,
    subtasks: [], comments: 0, attachments: 0, links: [],
    description: 'Cmd+K, G+B (board), G+D (dashboard) atd.',
    updated: '2026-04-26T08:00:00', created: '2026-04-26T08:00:00',
  },
  {
    id: 't10', key: 'WEB-138', title: 'Filtr „moje tasky" v boardu',
    type: 'task', status: 'review', priority: 'medium', project: 'p1', sprint: 's1',
    assignee: 'u6', reporter: 'u1', labels: ['l1'],
    estimate: 2, logged: 2, due: '2026-04-28',
    subtasks: [], comments: 2, attachments: 0, links: [],
    description: 'Toggle v topbaru, persist v URL.',
    updated: '2026-04-27T13:10:00', created: '2026-04-22T09:00:00',
  },
  {
    id: 't11', key: 'WEB-128', title: 'Drag & drop sloupců na kanbanu',
    type: 'story', status: 'done', priority: 'medium', project: 'p1', sprint: 's1',
    assignee: 'u2', reporter: 'u1', labels: ['l1'],
    estimate: 5, logged: 4, due: '2026-04-26',
    subtasks: [], comments: 5, attachments: 0, links: [],
    description: 'react-dnd, optimistic update.',
    updated: '2026-04-26T17:00:00', created: '2026-04-20T10:00:00',
  },
  {
    id: 't12', key: 'WEB-141', title: 'Activity feed — mentions',
    type: 'task', status: 'testing', priority: 'medium', project: 'p1', sprint: 's1',
    assignee: 'u3', reporter: 'u8', labels: ['l2'],
    estimate: 3, logged: 3, due: '2026-04-28',
    subtasks: [], comments: 2, attachments: 0, links: [],
    description: 'Notifikace při @mention v komentáři.',
    updated: '2026-04-27T12:00:00', created: '2026-04-21T14:00:00',
  },
];

// ── Activity feed ────────────────────────────────────────────────────────────
const FLUX_ACTIVITY = [
  { id: 'a1',  user: 'u2', action: 'changed status',  target: 'WEB-142', from: 'To Do', to: 'In Progress', at: '2026-04-27T14:32:00' },
  { id: 'a2',  user: 'u3', action: 'logged 1.5h on',  target: 'WEB-103', at: '2026-04-27T18:00:00' },
  { id: 'a3',  user: 'u1', action: 'commented on',    target: 'WEB-119', at: '2026-04-27T16:45:00', preview: 'Můžeme to ještě probrat na standupu?' },
  { id: 'a4',  user: 'u5', action: 'created bug',     target: 'WEB-156', at: '2026-04-27T09:30:00' },
  { id: 'a5',  user: 'u6', action: 'attached file to', target: 'WEB-119', at: '2026-04-27T11:30:00', preview: 'reset-flow.png' },
  { id: 'a6',  user: 'u4', action: 'closed',          target: 'WEB-130', at: '2026-04-25T14:00:00' },
  { id: 'a7',  user: 'u2', action: 'mentioned you in', target: 'WEB-148', at: '2026-04-26T10:15:00', preview: '@TV co myslíš na ten upload progress bar?' },
  { id: 'a8',  user: 'u3', action: 'merged PR for',   target: 'WEB-128', at: '2026-04-26T17:00:00' },
];

// ── Git integrations (mock) ────────────────────────────────────────────────
const FLUX_GIT_INTEGRATIONS = [
  { id: 'gh', provider: 'github', name: 'GitHub', org: 'flexo-team', connected: true,
    repos: [
      { full: 'flexo-team/flux-web', stars: 24, lang: 'TypeScript', linked: true },
      { full: 'flexo-team/flux-design-system', stars: 8, lang: 'TypeScript', linked: true },
      { full: 'flexo-team/flux-mobile', stars: 12, lang: 'Swift', linked: false },
    ],
    webhooks: ['push', 'pull_request', 'issue_comment'],
    smartCommits: true, autoTransition: true, lastSync: '2026-04-29T08:12:00',
  },
  { id: 'gl', provider: 'gitlab', name: 'GitLab', org: 'flexo-team', connected: true,
    repos: [
      { full: 'flexo-team/flux-api', stars: 6, lang: 'Go', linked: true },
      { full: 'flexo-team/flux-infra', stars: 2, lang: 'HCL', linked: true },
    ],
    webhooks: ['push', 'merge_request', 'pipeline'],
    smartCommits: true, autoTransition: false, lastSync: '2026-04-29T07:55:00',
  },
];

// Per-task linked dev objects: branches, commits, PRs/MRs, builds
const FLUX_DEV = {
  'WEB-142': {
    branches: [
      { name: 'feature/WEB-142-slash-menu', repo: 'flexo-team/flux-web', provider: 'github',
        author: 'u2', ahead: 14, behind: 2, updated: '2026-04-29T09:14:00' },
    ],
    pulls: [
      { id: '#487', title: 'WEB-142: slash menu base + heading/list/quote',
        repo: 'flexo-team/flux-web', provider: 'github', author: 'u2',
        state: 'open', draft: false,
        head: 'feature/WEB-142-slash-menu', base: 'main',
        additions: 412, deletions: 38, files: 9,
        reviews: [
          { user: 'u1', state: 'approved' },
          { user: 'u3', state: 'comment' },
        ],
        checks: { passed: 7, failed: 0, pending: 1 },
        updated: '2026-04-29T09:14:00',
      },
    ],
    commits: [
      { sha: 'a1f24e9', message: 'WEB-142: extract slash trigger regex into util',
        author: 'u2', repo: 'flexo-team/flux-web', provider: 'github', at: '2026-04-29T09:14:00' },
      { sha: '7c83b12', message: 'WEB-142: keyboard nav (↑ ↓ Enter Esc)',
        author: 'u2', repo: 'flexo-team/flux-web', provider: 'github', at: '2026-04-28T17:42:00' },
      { sha: '4d09a55', message: 'WEB-142: heading / list / quote inserts',
        author: 'u2', repo: 'flexo-team/flux-web', provider: 'github', at: '2026-04-28T11:20:00' },
      { sha: '0b71ee3', message: 'WEB-142: render floating menu near caret',
        author: 'u2', repo: 'flexo-team/flux-web', provider: 'github', at: '2026-04-27T16:08:00' },
    ],
    builds: [
      { id: '#1284', name: 'CI · build & test', state: 'success',
        duration: '3m 14s', at: '2026-04-29T09:18:00' },
      { id: '#1283', name: 'CI · e2e', state: 'running',
        duration: '1m 44s', at: '2026-04-29T09:18:00' },
    ],
  },
  'WEB-148': {
    branches: [
      { name: 'feature/WEB-148-paste-images', repo: 'flexo-team/flux-web', provider: 'github',
        author: 'u6', ahead: 6, behind: 0, updated: '2026-04-28T20:11:00' },
    ],
    pulls: [
      { id: '#491', title: 'WEB-148: paste / drag obrázku → S3',
        repo: 'flexo-team/flux-web', provider: 'github', author: 'u6',
        state: 'draft', draft: true,
        head: 'feature/WEB-148-paste-images', base: 'main',
        additions: 188, deletions: 12, files: 5,
        reviews: [], checks: { passed: 5, failed: 1, pending: 0 },
        updated: '2026-04-28T20:11:00',
      },
    ],
    commits: [
      { sha: 'e2c4811', message: 'WEB-148: optimistic preview + retry',
        author: 'u6', repo: 'flexo-team/flux-web', provider: 'github', at: '2026-04-28T20:11:00' },
      { sha: 'f81b339', message: 'WEB-148: hook clipboard paste handler',
        author: 'u6', repo: 'flexo-team/flux-web', provider: 'github', at: '2026-04-28T11:33:00' },
    ],
    builds: [
      { id: '#1281', name: 'CI · build & test', state: 'failed',
        duration: '2m 51s', at: '2026-04-28T20:14:00' },
    ],
  },
};

// Rich description for WEB-142 (used by editor demo)
const FLUX_RICH_DESC_1 = [
  { type: 'h2', text: 'Slash menu v rich-text editoru' },
  { type: 'p',  text: 'Cílem je přidat slash menu (/) které otevře rychlý picker pro vkládání bloků. Inspirace: Notion, Linear.' },
  { type: 'h3', text: 'Akceptační kritéria' },
  { type: 'ul', items: [
    'Při napsání `/` na začátku řádku se otevře menu',
    'Fuzzy search nad názvy bloků',
    'Klávesové ovládání (↑ ↓ Enter Esc)',
    'Po vybrání: blok se vloží na aktuální pozici',
  ]},
  { type: 'callout', tone: 'info', text: 'Pozor: menu se nesmí otevírat uvnitř code bloků a uvnitř inline kódu.' },
  { type: 'h3', text: 'Bloky které musí jít vložit' },
  { type: 'ul', items: [
    'Heading 1 / 2 / 3',
    'Bullet / numbered list',
    'Todo list',
    'Quote, Callout, Divider',
    'Code block',
    'Image (upload + paste)',
    'Table',
    'Mention (@user) a Issue link (#TASK-123)',
  ]},
  { type: 'code', lang: 'tsx', text: 'const SLASH_TRIGGER = /(^|\\s)\\/(\\w*)$/;\n\nfunction openSlashMenu(view: EditorView, query: string) {\n  // ...show floating menu near caret\n}' },
  { type: 'h3', text: 'Otevřené otázky' },
  { type: 'p',  text: 'Má slash menu fungovat i na mobilech? Nebo jen na desktopu? Cc @KS @TV' },
];

Object.assign(window, {
  FLUX_USERS, FLUX_PROJECTS, FLUX_STATUSES, FLUX_PRIORITIES, FLUX_TYPES, FLUX_LABELS,
  FLUX_SPRINTS, FLUX_EPICS, FLUX_TASKS, FLUX_ACTIVITY, FLUX_RICH_DESC_1,
  FLUX_GIT_INTEGRATIONS, FLUX_DEV,
});
