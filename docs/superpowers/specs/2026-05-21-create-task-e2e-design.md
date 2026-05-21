# Spec: E2E test scénáře pro vytvoření tasku

**Datum:** 2026-05-21
**Status:** Approved — implementace
**Scope:** `stride-fe` (samostatné git repo)

---

## Cíl

Zavést v `stride-fe` Playwright jako E2E framework a pokrýt **happy-path** scénáře pro vytvoření tasku přes `CreateTaskModal`. Sada je záměrně malá (3 scénáře), aby šla rozšiřovat o validace, perms a multi-user toky v budoucnu.

## Out of scope (v této iteraci)

- Validace prázdného title (button už je `disabled` — testovat až s lepším error message).
- Permission gate (Member vs Viewer) — vyžaduje druhého test usera.
- Nahrání obrázku v popisu — komplexní (blob URLs + attachments API).
- Network error handling.
- Otevření modalu z command palette / globální shortcut — modal aktuálně otevírá jen tlačítko `Nový task` v `project-topbar.tsx`. Otestujeme tu jednu cestu.

---

## Architektura

```
stride-fe/
├── e2e/
│   ├── .auth/                       # gitignored: storage-state.json se session
│   ├── fixtures/
│   │   └── auth.setup.ts            # 1× login přes UI, uloží storageState
│   ├── create-task.spec.ts          # TS-001, TS-002, TS-003
│   ├── tsconfig.json                # extends ../tsconfig.json, include: ["./**/*"]
│   └── .gitignore                   # .auth/
├── playwright.config.ts             # baseURL, projects: setup + chromium s storageState
├── docs/
│   └── test-scenarios/
│       └── create-task.md           # lidsky čitelné scénáře (mirror Playwright spec)
└── package.json                     # +@playwright/test, +scripty e2e / e2e:ui
```

### Závislosti

- **`@playwright/test`** — dev dependency, instaluje se přes `yarn add -D @playwright/test`.
- Browser binárky: jednorázově `yarn playwright install chromium`. Přidám do README.

### Scripts

```json
{
  "scripts": {
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui"
  }
}
```

### Web server

**Nestartujeme z Playwrightu.** Testy předpokládají, že BE (`:8080`) i FE (`:5173`) už běží — soulad s `stride-fe/CLAUDE.md` ("nespouštěj `yarn dev` sám"). `playwright.config.ts` má pre-check, který fail-fast vypíše hlášku, když některý server neodpovídá.

---

## Auth strategie

**Login přes UI, jednou na celou suitu, sdílený storageState** (varianta 2A z brainstormingu).

### Setup (`e2e/fixtures/auth.setup.ts`)

1. Goto `/login`
2. Pole jsou předvyplněna (`tomas.vesely@acme.cz` / `password`) — jen klikne na submit.
3. Počká na redirect z `/login` (signál úspěchu).
4. `page.context().storageState({ path: 'e2e/.auth/storage-state.json' })`

### Použití v testech

V `playwright.config.ts`:
```ts
projects: [
  { name: 'setup', testMatch: /auth\.setup\.ts/ },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/storage-state.json' },
    dependencies: ['setup'],
  },
]
```

Důsledek: setup proběhne jednou, každý další test startuje přihlášený.

### Storage state je gitignored

`.auth/` v `e2e/.gitignore` — obsahuje JWT.

---

## Test data — izolace

Tasky se v dev DB nemažou (per `CLAUDE.md`). Aby šly testy pouštět opakovaně:

- **Title obsahuje timestamp + scenario id**: `[E2E TS-001] Minimal ${Date.now()}`
- Po vytvoření nečistíme — kumulace v dev DB je explicitně povolena.

## Volba projektu pro test

Testy otevírají **první projekt v sidebaru** (přes `await page.getByRole('navigation').getByRole('link').first().click()`). To vyžaduje, že test user má alespoň jeden projekt s rolí Member+. **Předpoklad**, ne setup krok — pokud nesplněno, test fail-fast s jasným messagem.

---

## Scénáře

Všechny tři scénáře sdílí stejný **arrange**:
1. Goto `/` (přihlášený díky storageState)
2. Otevři první projekt
3. V topbaru klikni `Nový task` (button name regex `/Nový task|New Task|Task/`)
4. Modal je vidět: `await expect(page.getByRole('dialog')).toBeVisible()` — *poznámka: modal aktuálně není `<Dialog>`, je to `<Card>` v overlay `<Stack>`. Selektor řešíme přes heading "Nový task v ..." nebo přes title `placeholder="Title…"` input.*

### TS-001 — Vytvoření minimálního tasku přes tlačítko

**Act:**
1. Do title fieldu napiš `[E2E TS-001] Minimal ${ts}`.
2. Klikni button `Vytvořit task`.

**Assert:**
- Modal už není vidět (title input nemá v DOM existovat).
- Snackbar s textem `Task vytvořen` je vidět (role=alert, MUI Snackbar).
- URL obsahuje query param `task=` s hodnotou matching `/^[A-Z]+-\d+$/`.
- V detail panelu je viditelný zadaný title.

### TS-002 — Vytvoření plného tasku přes ⌘↵

**Act:**
1. Klikni type chip `Bug`.
2. Do title fieldu napiš `[E2E TS-002] Full ${ts}`.
3. Do editoru popisu (`[contenteditable="true"]`) napiš `Popis testovacího tasku.`.
4. Klikni priority chip `High`.
5. Stiskni `Control+Enter` (Playwright `page.keyboard.press('Control+Enter')` — handler v modalu reaguje na `metaKey || ctrlKey`).

**Assert:**
- Modal už není vidět.
- Snackbar `Task vytvořen` viditelný.
- URL `?task=<KEY>` matching `/^[A-Z]+-\d+$/`.
- Detail panel: title, type=Bug ikona, priority=High chip, description text "Popis testovacího tasku."

### TS-003 — Esc zavře modal beze změny

**Arrange extra:** zaznamenej současné URL jako `urlBefore`.

**Act:**
1. Do title fieldu napiš `[E2E TS-003] Should not be created`.
2. Stiskni `Escape`.

**Assert:**
- Modal už není vidět.
- URL = `urlBefore` (žádný `?task=` parameter nepřibyl).
- Žádný snackbar `Task vytvořen` se nezobrazil (`await expect(page.getByText('Task vytvořen')).not.toBeVisible()` s krátkým timeoutem).

> **Regression rationale:** v `create-task-modal.tsx` je Escape handler navázaný na TextField (`onKeyDown={e => e.key === 'Escape' && closeCreateModal()}`), zatímco ⌘↵ je na Cardu. Pokud někdo přesune handler na Card a zapomene na TextField (nebo naopak), tato regrese se chytne.

---

## Selektory — pravidla

- **Žádné `data-testid`** — v repu zatím neexistují, nechceme zavádět novou konvenci ve scoped PR. Vystačíme si s rolemi a viditelným textem.
- **Role-based first** (`getByRole('button', { name: /.../ })`).
- **i18n-tolerant**: button names jako regex přijímající CZ/EN variantu (`/Nový task|New Task|Task/`).
- **Editor**: TipTap renderuje `<div contenteditable="true">` — selektor `page.locator('[contenteditable="true"]')` v rámci modalu.

---

## Markdown scénáře vs. Playwright spec

Pro každý scénář existuje:
1. **Lidsky čitelný popis** v `docs/test-scenarios/create-task.md` — Given/When/Then, používá business jazyk.
2. **Spustitelný Playwright spec** v `e2e/create-task.spec.ts` — odkazuje na ID scénáře v komentáři u `test('TS-001: ...', ...)`.

Markdown žije jako reference pro PM/QA review, Playwright je single source of truth pro CI.

---

## CI

**V této iteraci nedoplňujeme CI workflow.** GitHub Actions / GitLab CI přidáme až bude jasné, jak se v projektu pouští BE container pro testy. Lokální `yarn e2e` proti běžícímu stacku stačí jako MVP.

---

## Definition of Done

- [ ] `@playwright/test` v `package.json` (devDep).
- [ ] `playwright.config.ts` s setup projektem + chromium projektem.
- [ ] `e2e/fixtures/auth.setup.ts` přihlašuje a ukládá storageState.
- [ ] `e2e/create-task.spec.ts` obsahuje TS-001, TS-002, TS-003.
- [ ] `e2e/.gitignore` skrývá `.auth/`.
- [ ] `docs/test-scenarios/create-task.md` obsahuje lidsky čitelné Given/When/Then.
- [ ] `yarn e2e` lokálně proti běžícímu stacku projde 3/3 testy.
- [ ] Krátká zmínka v `stride-fe/README.md`: "E2E testy — viz `e2e/`".
