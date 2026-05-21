# Test scénáře — Cross-cutting flows (iterace 4)

> Lidsky čitelný mirror pro `e2e/auth.spec.ts`, `e2e/nav.spec.ts`, `e2e/theme-and-help.spec.ts`, `e2e/profile.spec.ts`, `e2e/list-view.spec.ts`.

## Spuštění

```bash
yarn e2e --grep "TS-6"     # auth (logout, wrong password)
yarn e2e --grep "TS-7"     # sidebar nav
yarn e2e --grep "TS-80"    # theme + keyboard help
yarn e2e --grep "TS-90"    # profile
yarn e2e --grep "TS-10"    # list view
```

## Auth (TS-601, TS-602)

### TS-601 — Logout přes avatar menu
**Given** uživatel je přihlášený
**When** klikne na avatar v pravém horním rohu (initials "TV")
**And** v menu zvolí „Odhlásit se"

**Then** je redirect na `/login`

### TS-602 — Chybné heslo zobrazí chybu
**Given** test začíná s prázdným storage state (vynucený přes `test.use({ storageState: ... })`)
**When** otevře `/login` a vyplní heslo `wrong-password`
**And** klikne `Sign in / Přihlásit`

**Then** zobrazí se Alert (role=alert) s chybovou hláškou
**And** zůstává na `/login`

---

## Sidebar navigace (TS-701..705)

Pro každou položku (Dashboard, Inbox, My Work, Reports, Calendar):
**When** uživatel klikne v sidebaru na položku
**Then** URL se změní na odpovídající route (`/dashboard`, `/inbox`, `/my-work`, `/reports`, `/calendar`)

> Selektory používají regex i18n (CZ + EN) — `Inbox|Doručené`, `My Work|Moje práce`, atd.

---

## Theme & Keyboard help (TS-801, TS-802)

### TS-801 — Toggle theme
**When** klikne na icon button „Toggle theme / Přepnout téma" v hlavičce

**Then** computed background color body elementu se změní

### TS-802 — Keyboard help dialog
**Given** uživatel je v aplikaci
**When** stiskne klávesu `?` (Shift+Slash)

**Then** otevře se dialog s heading „Klávesové zkratky"

**When** stiskne `Escape`

**Then** dialog se zavře

---

## Profile (TS-901)

### TS-901 — Edit profile name
**Given** uživatel je na `/profile`
**When** změní hodnotu pole `Jméno` na `${original} (E2E)`
**And** klikne `Uložit změny`
**And** stránku načte znovu (reload)

**Then** pole `Jméno` má novou hodnotu

**Cleanup**: test vrátí původní jméno na konci (idempotentnost).

---

## List view (TS-1001)

### TS-1001 — Klik na řádek v list view otevře task detail
**Given** task je vytvořen (přes UI v setup) a detail je dočasně zavřený
**When** uživatel přejde na `/projects/{KEY}/list`
**And** klikne na task key v řádku

**Then** URL obsahuje `?task={KEY}`
**And** detail panel s heading h3 je viditelný

---

## Pokryté oblasti — souhrn po 4 iteracích

| Oblast | Testů |
|--------|-------|
| Create task | 3 |
| Task field edity | 8 |
| Task content (popis, komentáře, subtasky, reply) | 4 |
| Attachments | 1 |
| Lifecycle (delete) | 1 |
| Board | 3 (+ 1 skip) |
| Backlog / sprinty | 3 |
| Releases | 3 |
| Auth | 2 |
| Sidebar nav | 5 |
| Theme + Keyboard help | 2 |
| Profile | 1 |
| List view | 1 |
| Command palette | 0 (3 blocked — bug) |

**Total: 37 active + 4 skipped = 41 scénářů.**
