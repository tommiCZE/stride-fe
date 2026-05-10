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