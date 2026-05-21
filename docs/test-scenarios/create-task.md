# Test scénáře — Vytvoření tasku

> Lidsky čitelný mirror pro `e2e/create-task.spec.ts`. Když se některý scénář v Playwright spec změní, uprav i tento dokument.

## Předpoklady (pre-conditions)

- BE běží na `http://localhost:8080`.
- FE běží na `http://localhost:5173`.
- Test user existuje: `tomas.vesely@acme.cz` / `password`.
- Test user má alespoň jeden **neaktivovaný** projekt s rolí Member+ (Playwright klikne první projekt ze sidebaru).

## Spuštění

```bash
# jednorázově (instalace browser binárky)
yarn playwright install chromium

# regulérní run
yarn e2e

# debug s Playwright UI
yarn e2e:ui
```

---

## Společné kroky (background) pro všechny scénáře

**Given** uživatel je přihlášený (řeší `auth.setup.ts` → storageState)
**And** otevře první projekt ze sidebaru
**Then** URL odpovídá `/projects/<KEY>/board`

---

## TS-001 — Vytvoření minimálního tasku přes tlačítko

**When** klikne na tlačítko `Nový task` v topbaru projektu
**And** vyplní pole `Title…` textem `[E2E TS-001] Minimal {timestamp}`
**And** klikne na tlačítko `Vytvořit task`

**Then** modal zmizí
**And** zobrazí se snackbar `Task vytvořen`
**And** URL obsahuje `?task=<KEY-NUM>` (kde KEY-NUM matchuje `/[A-Z]+-\d+/`)
**And** v detail panelu je vidět nadpis odpovídající zadanému title

## TS-002 — Plný task (type Bug, popis, priority High) přes ⌘↵

**When** klikne na tlačítko `Nový task` v topbaru projektu
**And** vybere type **Bug**
**And** vyplní pole `Title…` textem `[E2E TS-002] Full {timestamp}`
**And** do popisu (TipTap editor) napíše `Popis testovacího tasku {timestamp}.`
**And** vybere priority **High**
**And** stiskne `Ctrl+Enter` (na macOS `⌘+Enter`)

**Then** modal zmizí
**And** zobrazí se snackbar `Task vytvořen`
**And** URL obsahuje `?task=<KEY-NUM>`
**And** v detail panelu je vidět nadpis odpovídající zadanému title
**And** v detail panelu je vidět popis odpovídající zadanému description

## TS-003 — Esc zavře modal beze změny

**When** klikne na tlačítko `Nový task` v topbaru projektu
**And** vyplní pole `Title…` textem `[E2E TS-003] Should not be created {timestamp}`
**And** stiskne klávesu `Escape`

**Then** modal zmizí
**And** URL se nezměnila (žádný `?task=` parameter nepřibyl)
**And** snackbar `Task vytvořen` se NEzobrazil

> **Smysl scénáře:** Escape handler je v `create-task-modal.tsx` navázaný na TextField (`onKeyDown`), zatímco ⌘↵ je na Cardu. Tento test chytí regresi, kdyby někdo handler přesunul a zapomněl na druhý.

---

## Out of scope (pro budoucí rozšíření)

| ID | Scénář | Důvod odkladu |
|----|--------|---------------|
| TS-101 | Validace prázdného title | Button je `disabled` — nejdřív zlepšit error message |
| TS-102 | Permission gate (Viewer vidí warning) | Vyžaduje druhého test usera |
| TS-103 | Nahrání obrázku do popisu | Komplexní (blob URLs + attachments API) |
| TS-104 | Network error při create | Vyžaduje mock/route intercept |
| TS-105 | Otevření modalu z command palette | Modal aktuálně otevírá jen topbar tlačítko |
