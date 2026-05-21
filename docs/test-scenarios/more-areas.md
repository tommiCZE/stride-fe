# Test scénáře — Rozšíření (iterace 3)

> Lidsky čitelný mirror pro `e2e/edit-task-fields.spec.ts` (TS-114, TS-115), `e2e/edit-task-content.spec.ts` (TS-119), `e2e/board.spec.ts`, `e2e/backlog-sprints.spec.ts`, `e2e/releases.spec.ts`, `e2e/command-palette.spec.ts`.

## Předpoklady

- BE běží na `:8080`, FE na `:5173`.
- Test user `tomas.vesely@acme.cz` / `password` s aspoň 1 projektem (Member+).
- Pro TS-202 (Moje úkoly chip) — žádný požadavek, test jen ověřuje toggle.

## Spuštění

```bash
yarn e2e                                  # vše (~60–90s)
yarn e2e --grep "TS-2"                    # board
yarn e2e --grep "TS-3"                    # backlog/sprint
yarn e2e --grep "TS-4"                    # releases
yarn e2e --grep "TS-5"                    # command palette (skipped — bug)
```

---

## Task fields (rozšíření)

### TS-114 — Sprint picker
**Given** task je vytvořený a otevřený v detail panelu
**When** v sidebaru klikne na řádek Sprint (text „Nastavit sprint" nebo aktuální sprint name)
**And** v menu zvolí „Backlog"

**Then** menu zmizí

### TS-115 — Edit estimate
**Given** task je vytvořený a otevřený v detail panelu
**When** v sidebaru klikne na em-dash v řádku Estimate
**And** do inputu napíše `4`
**And** stiskne Enter

**Then** řádek Estimate obsahuje `4 h`

### TS-119 — Reply na komentář
**Given** task je vytvořený a otevřený
**When** přidá komentář (klik na placeholder + napsat + Uložit)
**And** v komentáři klikne na odkaz „Odpovědět"
**And** napíše text odpovědi a klikne Uložit

**Then** zobrazí se snackbar `Odpověď přidána`
**And** text odpovědi je viditelný

---

## Board

### TS-201 — Inline vytvoření tasku v sloupci
**Given** uživatel je na board prvního projektu
**When** klikne na tlačítko `+ Přidat úkol do sloupce {status}` (např. To Do)
**And** vyplní input `Název úkolu…`
**And** stiskne Enter

**Then** zobrazí se snackbar `Task vytvořen`
**And** input se zavře

> Poznámka: ověření že nová karta je viditelná v sloupci vyžaduje reload — TanStack Query invalidate nemá deterministicky čas dokončit. Test ověřuje pouze snackbar + zavření inputu.

### TS-202 — Filter „Moje úkoly" toggle
**Given** uživatel je na boardu
**When** klikne na chip „Moje úkoly"
**And** klikne na chip znovu (toggle zpět)

**Then** chip je viditelný v obou stavech (test stability triggeru)

### TS-203 — Uložit vlastní filtr
**Given** uživatel je na boardu
**When** klikne na chip „Uložená zobrazení"
**And** v menu klikne na „Uložit aktuální filtr…"
**And** v dialogu vyplní název filtru
**And** klikne na tlačítko `Uložit`

**Then** zobrazí se snackbar `Filtr uložen`

### TS-204 — Drag-drop status change (skip)
**Given** task je v sloupci To Do
**When** se pokusíme přetáhnout kartu do sloupce In Progress

**Then** pokud @dnd-kit neodpoví na synthetic events, test se sám skipne s vysvětlivkou

---

## Backlog & Sprint mgmt

### TS-301 — Vytvoření sprintu
**Given** uživatel je na backlog stránce prvního projektu
**When** vyplní pole `Název nového sprintu…` unikátním názvem
**And** klikne na tlačítko `Nový sprint`

**Then** nový sprint Card s daným názvem je viditelný v listu
**And** Card má status badge „Plánovaný"

### TS-302 — Spuštění sprintu
**Given** sprint je vytvořený a má status PLANNED
**When** v Card sprintu klikne na tlačítko `Spustit sprint`

**Then** zobrazí se snackbar `Sprint "{name}" aktivován`
**And** status badge se změní na „Aktivní"

### TS-303 — Dokončení sprintu
**Given** sprint je vytvořený a spuštěný (ACTIVE)
**When** v Card sprintu klikne na tlačítko `Dokončit sprint`

**Then** zobrazí se snackbar `Sprint "{name}" dokončen`
**And** status badge se změní na „Hotový"

---

## Releases

### TS-401 — Vytvoření release
**Given** uživatel je na stránce releases
**When** klikne na tlačítko `Nová verze`

**Then** zobrazí se snackbar `Release vytvořen`
**And** URL se změní na `/releases/{id}` (detail)

### TS-402 — Označit release jako vydaný
**Given** release je vytvořený a otevřený v detailu (status `unreleased`)
**When** klikne na tlačítko `Označit jako vydané`

**Then** tlačítko `Označit jako vydané` zmizí (status změněn)

### TS-403 — Smazání release
**Given** release je vytvořený a otevřený v detailu
**When** klikne na tlačítko `Smazat verzi`
**And** v native confirm dialogu potvrdí

**Then** zobrazí se snackbar `Verze smazána`
**And** redirect zpět na `/releases`

---

## Command Palette (skipped — bug)

**Status: BLOCKED na úrovni implementace.** Všechny 3 testy (TS-501..503) jsou označené `test.skip()`.

**Bug:** `CommandPalette` je v `App.tsx:103` rendered jako **sibling** `<RouterProvider>`, takže nemá Router context. Při Ctrl+K otevření padá:
```
useNavigate() may be used only in the context of a <Router> component.
```

**Fix:** Přesunout `<CommandPalette>` dovnitř `ProtectedLayout` (mezi `<Outlet/>` a `{createModalOpen && ...}` na App.tsx:52) nebo zalomit do vnitřního Router-aware portalu. Až bude fix, smazat `test.skip(true, ...)` v `command-palette.spec.ts`.

### TS-501 — Ctrl+K otevře, Esc zavře
Plán: keyboard.press('Control+KeyK') → palette dialog visible → Esc → hidden.

### TS-502 — Vyhledání tasku po klíči
Plán: otevři palette → vyplň task.key → klik na role=option → URL obsahuje `?task=KEY`.

### TS-503 — Navigace přes palette
Plán: otevři palette → vyplň „Dashboard" → klik na první option → URL `/dashboard`.

---

## Out of scope (pro budoucí rozšíření)

| ID | Scénář | Důvod odkladu |
|----|--------|---------------|
| TS-118 | Edit komentáře (UI button neexistuje) | UI implementace chybí |
| TS-118a | Delete komentáře | UI implementace chybí |
| TS-120 | Permission gate (Viewer) | Vyžaduje druhého test usera |
| TS-117 | Worklog dialog (timer) | Komplexní časové výpočty |
| TS-204 | Drag-drop status (@dnd-kit) | Skip — synthetic events nefungují spolehlivě |
| TS-501..503 | Command palette | Blocked: bug v App.tsx |
