# Stride – Issue Manager | Claude Code Prompt

## Kontext projektu
Implementuj frontend aplikaci **Stride** – moderní alternativu k Jiře pro správu projektů a tasků.
Vycházej z handoff bundle v `./stride-issue-manager/project/` – přečti všechny soubory tam obsažené
a implementuj design pixel-perfectly v níže definovaném tech stacku.

---

## Tech stack

- **React 19** + **TypeScript** (strict mode) + **Vite**
- **MUI (Material UI) v9** – komponenty a theming
- **@mui/x-date-pickers v9** – DatePicker pro due dates a sprinty (community edition, MIT)
- **dayjs** – práce s datumy, adaptér pro MUI DatePicker
- **TanStack Query v5** – server state, API fetching, caching
- **Zustand** – globální app state (UI state, přihlášený uživatel apod.)
- **Axios** – HTTP klient pro volání BE API
- **React Router v7** – navigace a routování
- **React Hook Form + Zod** – formuláře a validace
- **dnd kit** – drag & drop pro Kanban board (MIT)
- **TipTap** – WYSIWYG editor pro popis tasků a komentáře (MIT, headless)

---

## Backend integrace

- REST API běží na `http://localhost:8080` (Spring Boot)
- Autentizace přes **JWT tokeny** (Bearer token v Authorization headeru)
- Kde API ještě není k dispozici, použij **mock data** (oddělená složka `src/mocks/`)

---

## Struktura projektu

```
src/
├── api/          # Axios instance, API klienti (soubor per resource)
├── components/   # Sdílené znovupoužitelné komponenty
├── layouts/      # Layout wrappery (AppLayout, AuthLayout)
├── pages/        # Stránky mapované na routes
├── store/        # Zustand slices
├── types/        # TypeScript typy a interfaces
├── mocks/        # Mock data pro vývoj bez BE
├── theme.ts      # MUI theme (createTheme)
└── main.tsx      # Entry point
```

---

## Styling pravidla

- **VEŠKERÉ globální styly** (barvy, typografie, border-radius, shadows, spacing scale)
  definuj v `theme.ts` pomocí `createTheme()` a `components` overrides
- **`sx` prop** používej POUZE pro:
    - jednorázový layout (display, flex, gap, mt, mb apod.)
    - skutečné výjimky které nemají smysl v theme
- **Zakázáno**: inline `style={{ }}` atributy
- **Zakázáno**: hardcoded hex barvy v komponentách – vždy `theme.palette.*`
- **Zakázáno**: `sx={{ borderRadius: 8, textTransform: 'none' }}` opakované na každém tlačítku
  → tohle patří do `theme.components.MuiButton.styleOverrides`

---

## Layout & styling patterns — preferuj nativní MUI

Cílem je **omezit `<Box>` + `sx` redundanci**. ESLint warnuje na typické regresivní patterny (`eslint.config.js`). Vždy preferuj nativní MUI komponenty + theme tokens před vlastními wrappery.

### Cheat sheet — co místo čeho

| Místo… | …použij |
|---|---|
| `<Box sx={{display:'flex', alignItems:'center', gap:1}}>` | `<Stack direction="row" spacing={1} sx={{alignItems:'center'}}>` |
| `<Box sx={{display:'flex', flexDirection:'column', gap:2}}>` | `<Stack spacing={2}>` |
| `<Box sx={{border:1, borderColor:'divider', borderRadius:1.5, p:2}}>` | `<Card><CardContent>` (Card má v theme default border, rounded 12) |
| `<Box sx={{display:'flex', alignItems:'center', gap:1, p:1, border:1, borderColor:'divider'}}>` (řádek s avatarem + textem + akcí, opakovaně) | `<List>` + `<ListItem secondaryAction={...}>` + `<ListItemAvatar>` + `<ListItemText primary secondary>` |
| `<Typography sx={{fontSize:13, fontWeight:600}}>` | `<Typography variant="label">` |
| `<Typography sx={{fontSize:13, color:'text.secondary'}}>` | `<Typography variant="caption" color="text.secondary">` |
| `<Typography sx={{fontSize:14, fontWeight:600}}>` | `<Typography variant="subtitle2">` |
| `<Box sx={{flex:1}}>` jako spacer | nech `sx={{flex:1}}` přímo na Stack childu — žádný extra wrapper |

V MUI v9 musí `alignItems` / `justifyContent` jít skrz `sx` (ne jako Stack top-level prop). `useFlexGap: true` je v theme default — moderní gap-based spacing fungs out-of-the-box.

### Kdy extrahovat doménovou komponentu

Vlastní komponenta v `src/components/` má smysl pouze když:
1. Stejný **víceřádkový blok** se opakuje **3× a víc**, nebo
2. Má **smysluplné doménové jméno** (`TaskRow`, `IntegrationListItem`, `FieldRow`), ne jen layout.

**Nevytvářej** layout primitivy typu `Row`/`Column`/`Surface`/`Cluster` — MUI Stack/Card to už řeší a zdvojeně by to konkurovalo MUI standardu.

### Nové Typography varianty

Pokud potřebuješ opakovaně specifický text styling (např. další "label-like" velikost), **přidej variantu do `theme.ts`** (s module augmentation v `src/types/mui-augment.d.ts`) místo opakovaného `sx={{fontSize, fontWeight}}`.

### Příklad refaktoru

Vzor MUI-nativního přístupu: `src/pages/workspace-settings/sections/integrations.tsx` (před: 19 sx + 11 Box; po: 3 sx + 0 Box, vizuálně shodné).

---

## Skill mapa — vždy invokuj před prací

| Situace | Skill |
|---|---|
| Implementuji nebo upravuji React komponentu | `stride-component` |
| Přidávám API volání, TanStack Query hook nebo mutaci | `stride-query` |
| Stavím formulář, validaci (Zod) nebo nový Zustand store | `stride-form` |
| Přidávám nebo rozšiřuji mock data v `src/mocks/` | `frontend-mock-data` |
| Navrhuji nebo implementuji novou stránku/screen | `jira-like-frontend` |
| Pracuji na `theme.ts`, design tokenech nebo MUI override | `mui-design-system` |
| Vytvářím složitější komponentu (compound, headless hook) | `react-component-patterns` |
| Refaktoruji architekturu nebo navrhuji strukturu složek | `react-ts-architecture` |
| Provádím review kódu nebo kontrolu kvality | `frontend-quality-review` |
| Upravuji editor (toolbar, rozšíření, paste/drop, styly) | `stride-editor` |

Každý skill obsahuje checklist — projdi ho před odesláním kódu.

---

## Kvalita kódu

- TypeScript strict mode – žádné `any`
- Každá komponenta má vlastní soubor
- API klienti jsou oddělení od komponent (volání přes TanStack Query hooks)
- Formuláře výhradně přes React Hook Form + Zod schéma
- Responzivní design – mobile-first

---

## Co implementovat

Přečti handoff bundle a implementuj všechny obrazovky které tam najdeš.
Typicky to bude:

1. **Dashboard** – přehled projektů, statistiky
2. **Kanban board** – sloupce (To Do / In Progress / Done), drag & drop karet
3. **Task detail** – panel s popisem (TipTap editor), assignee, priorita, due date, komentáře
4. **Project list** – sidebar nebo stránka se seznamem projektů
5. **Autentizace** – login stránka (JWT)

Pokud handoff obsahuje další obrazovky, implementuj je všechny.

---

## Poznámky

- Dodržuj barvy, fonty a rozložení z handoff bundle – neupravuj design svévolně
- Kde design není jednoznačný, zeptej se před implementací
- Generuj realistická mock data (jména, tasky, projekty) – ne "Lorem ipsum"

---

## Dev-time verifikace přes Playwright MCP

V repu je nakonfigurován **Playwright MCP server** (`.mcp.json` v rootu). Použij ho POUZE když tě uživatel výslovně požádá frází typu „ověř / proklikni / zkontroluj že [feature] funguje". Nezahajuj verifikaci spontánně po každé změně kódu.

### Pre-condition check (před každou verifikací)

1. **FE běží na `http://localhost:5173`** — ověř přes `curl -s http://localhost:5173 -o /dev/null -w "%{http_code}"`. Pokud ne, **nespouštěj `yarn dev` sám** — řekni uživateli, ať ho pustí.
2. **BE běží na `http://localhost:8080`** — `curl -s http://localhost:8080/actuator/health` nebo libovolný známý endpoint. Pokud ne, řekni uživateli, ať v `../stride-be/` pustí `docker-compose up`.

### Auth

- Výchozí testovací účet: `tomas.vesely@acme.cz` / `password` (je už předvyplněn v `src/pages/login.tsx`).
- Token se ukládá do `localStorage` pod klíčem `stride-auth` (viz `src/store/auth-store.ts`).
- API base URL: `http://localhost:8080` (`src/api/axios.ts`).

### Pravidla pro verifikaci

- **Neresetuj DB** mezi verifikacemi — testovací data se kumulují, je to v pořádku pro dev-time check.
- **Multi-user scénáře** (notifikace, mention) nelze ověřit jedním účtem. Pokud na to narazíš, nahlas limitaci a navrhni vytvoření druhého test usera.
- **Závěr verifikace**: stručný report **pass / fail**, klíčové screenshoty (`browser_screenshot`), popis co se reálně ověřilo a co BE odpověděl (případně mrkni do Network requests přes MCP).
- **Negeneruj automaticky regresní Playwright testy** — pokud uživatel chce trvalý test, vygeneruj ho na vyžádání jako samostatný krok.