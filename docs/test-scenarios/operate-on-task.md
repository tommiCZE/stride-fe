# Test scénáře — Operace nad taskem

> Lidsky čitelný mirror pro `e2e/edit-task-fields.spec.ts`, `e2e/edit-task-content.spec.ts`, `e2e/task-attachments.spec.ts`, `e2e/task-lifecycle.spec.ts`.
> Když se některý scénář v Playwright spec změní, uprav i tento dokument.

## Předpoklady (pre-conditions)

- BE běží na `http://localhost:8080`.
- FE běží na `http://localhost:5173`.
- Test user existuje: `tomas.vesely@acme.cz` / `password`.
- Test user má alespoň 1 neaktivovaný projekt s rolí Member+ a v projektu existuje alespoň jeden další uživatel pro přiřazení (TS-105).

## Spuštění

```bash
yarn e2e --grep "TS-1[01][0-9]"    # všech 11 operace-scénářů
yarn e2e --grep "TS-10[1-6]"       # jen fieldy (101..106)
yarn e2e --grep "TS-10[789]"       # jen obsah (107..109)
yarn e2e --grep "TS-11[01]"        # přílohy + delete (110..111)
```

## Společné kroky (background) pro všechny scénáře

**Given** uživatel je přihlášený (řeší `auth.setup.ts` → storageState)
**And** otevře první projekt ze sidebaru
**And** vytvoří task přes UI (`createTaskViaUI` helper) — title `[E2E TS-XYZ] {timestamp}`
**Then** detail panel je otevřený s vytvořeným taskem

---

## TS-101 — Změna title přes inline edit

**When** klikne na heading h3 s aktuálním title
**And** vyplní textarea novým textem `${title} (renamed)`
**And** stiskne Enter

**Then** h3 zobrazuje nový title
**And** původní title není v DOM jako heading h3

## TS-102 — Změna statusu přes picker

**When** klikne na status pill „To Do" (vedle title)
**And** v menu zvolí „In Progress"

**Then** pill zobrazuje „In Progress"
**And** zobrazí se snackbar `Status změněn na "In Progress"`

## TS-103 — Změna priority

**When** v sidebaru klikne na priority řádek („Priorita: Medium")
**And** v menu zvolí „High"

**Then** sidebar Priorita zobrazuje „High"

## TS-104 — Změna type

**When** v sidebaru klikne na type řádek („Typ: Task")
**And** v menu zvolí „Bug"

**Then** sidebar Typ zobrazuje „Bug"

## TS-105 — Přiřazení assignee

**When** v sidebaru klikne na „Přiřadit" (řádek Assignee)
**And** v menu zvolí prvního usera (ne „Nepřiřazeno")

**Then** „Přiřadit" zmizí z řádku Assignee

## TS-106 — Nastavení due date

**When** v sidebaru klikne na em-dash v řádku Due
**And** do date inputu vyplní `2026-06-15`

**Then** date input zmizí
**And** řádek Due obsahuje den `15`

## TS-107 — Edit popisu (TipTap)

**When** najede myší na popis a klikne na pencil ikonu
**And** vyplní contenteditable popisem `Popis tasku pro TS107 ${marker}`
**And** klikne na tlačítko `Uložit`

**Then** Uložit button zmizí
**And** po reload stránky je popis viditelný v detail panelu

> **Poznámka:** Bez reload nemusí TanStack Query stihnout invalidate popisu před asercí. Reload je explicitní workaround. Pokud `useUpdateTask` přidá optimistic update pro `description`, reload půjde odstranit.

## TS-108 — Přidání komentáře

**When** v Aktivita tabu klikne na placeholder Box „Napiš komentář…"
**And** v contenteditable napíše komentář
**And** klikne na tlačítko `Uložit`

**Then** zobrazí se snackbar `Komentář přidán`
**And** text komentáře je viditelný v detail panelu

## TS-109 — Přidání subtasku a toggle done

**When** klikne na button `+ Přidat podúkol`
**And** do inputu napíše název podúkolu
**And** stiskne Enter
**And** klikne na checkbox v řádku podúkolu

**Then** řádek podúkolu je viditelný v seznamu Podúkoly
**And** checkbox je zaškrtnutý
**And** title podúkolu má CSS `text-decoration-line: line-through`

## TS-110 — Upload + smazání přílohy

**When** přepne na tab `Přílohy`
**And** nahraje soubor `e2e/fixtures/files/sample.txt` přes hidden file input
**And** počká, až se objeví řádek se souborem `sample.txt`
**And** klikne na tlačítko `Smazat přílohu`

**Then** zobrazí se snackbar `Soubor smazán`
**And** řádek se souborem `sample.txt` zmizí

## TS-111 — Smazání tasku (delete + confirm)

**When** klikne na ikonu `Více akcí` v hlavičce detail panelu
**And** v menu zvolí `Smazat task`
**And** v confirm dialogu `Smazat úkol ${KEY}?` klikne na `Smazat`

**Then** zobrazí se snackbar `Úkol ${KEY} smazán`
**And** heading h3 s původním title není v DOM
**And** URL neobsahuje `?task=`

---

## Out of scope (pro budoucí rozšíření)

| ID | Scénář | Důvod odkladu |
|----|--------|---------------|
| TS-112 | Drag-drop change statusu na boardu | Komplexní @dnd-kit interakce |
| TS-113 | Drag-drop subtask reorder | Komplexní @dnd-kit interakce |
| TS-114 | Set sprint / epic / fix version (sidebar) | Logika identická s TS-103/104 — zbytečně repetitivní |
| TS-115 | Labels editor (multi-select) | Vyžaduje setup štítků v projektu |
| TS-116 | Estimate edit + progress | Vyžaduje worklog data |
| TS-117 | Worklog (timer + dialog) | Worklog flow je samostatná doména |
| TS-118 | Edit + delete existujícího komentáře | Vyžaduje stabilní lookup komentáře přes sequence |
| TS-119 | Reply na komentář (vlákno) | Multi-step flow s nested CommentEditor |
| TS-120 | Permission gate (Viewer) | Vyžaduje druhého test usera |
