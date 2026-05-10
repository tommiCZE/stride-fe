---
name: stride-editor
description: TipTap v3 rich text editor patterns for Stride. Use this skill whenever modifying or extending the editor (menu-bar, editor-body, callout extension, editor styles), adding new toolbar buttons, new TipTap extensions, or handling paste/drop events. Invoke it for tasks like "add button to toolbar", "add new extension", "change editor styles", "handle file drop", "add mention", "fix editor state".
---

# Stride TipTap Editor – Patterns & Conventions

## Architektura editoru

```
src/components/editor/
├── rich-editor.tsx          # Public wrapper – view/edit toggle s pencil ikonou
├── editor-body.tsx          # Samotný TipTap editor (extensions, toolbar, attachments)
├── menu-bar.tsx             # Toolbar tlačítka, useEditorState, ikony
├── t-btn.tsx                # TBtn a Sep – primitives pro toolbar tlačítka
├── callout-extension.ts     # Custom CalloutNode (info / warn / error)
├── editor-content-styles.ts # Všechny CSS selektory pro .tiptap obsah
└── blocks-to-html.ts        # Konverze RichBlock[] → HTML pro initialContent
```

Veřejné API: `<RichEditor blocks={...} onSave={...} />` — nepoužívej `EditorBody` přímo mimo tuto složku.

---

## TipTap v3 – kritické breaking changes

### 1. `useEditorState` selector — `ctx.editor` může být `null`

```tsx
// SPRÁVNĚ – vždy guard
const s = useEditorState({
  editor,
  selector: ctx => {
    if (!ctx.editor) return null;   // ← MUSÍ BÝT
    return {
      bold: ctx.editor.isActive('bold'),
      // ...
    };
  },
});

if (!editor || !s) return null;  // ← guard ve výsledku
```

### 2. `BubbleMenu` NENÍ React komponenta v TipTap v3

`@tiptap/extension-bubble-menu` exportuje Extension, ne JSX komponentu.  
**Nepoužívej `<BubbleMenu>` jako JSX** — způsobí `TS2604`.  
`@tiptap/react` v3 neexportuje žádný `BubbleMenu` ani `FloatingMenu` React wrapper.  
Místo toho je v projektu vlastní `BubbleToolbar` — viz sekce níže.

### 3. Yarn PnP (Berry) – direct dependency

Každý importovaný `@tiptap/*` balíček musí být přímá závislost v `package.json`.  
Transitivní závislosti nelze importovat. Při přidávání nového rozšíření vždy:

```bash
yarn add @tiptap/extension-xxx
```

---

## Aktuálně nainstalovaná rozšíření

| Rozšíření | Balíček | Status |
|-----------|---------|--------|
| StarterKit (bold, italic, strike, heading, lists, blockquote, code, codeBlock, history) | `@tiptap/starter-kit` | ✅ |
| Placeholder | `@tiptap/extension-placeholder` | ✅ |
| Link (autolink, openOnClick: false) | `@tiptap/extension-link` | ✅ |
| Image (inline: false, allowBase64: true) | `@tiptap/extension-image` | ✅ |
| TaskList + TaskItem (nested: true) | `@tiptap/extension-task-list` + `task-item` | ✅ |
| Highlight | `@tiptap/extension-highlight` | ✅ |
| Underline | `@tiptap/extension-underline` | ✅ |
| CharacterCount | `@tiptap/extension-character-count` | ✅ |
| TableKit (Table, Row, Cell, Header) | `@tiptap/extension-table` | ✅ |
| CalloutNode (info/warn/error) | vlastní (`callout-extension.ts`) | ✅ |
| Mention (@tagging uživatelů) | `@tiptap/extension-mention` | ❌ naimplementováno |
| FloatingMenu (slash `/` menu) | `@tiptap/extension-floating-menu` | ❌ naimplementováno |

---

## `TBtn` a `Sep` – toolbar primitives

Oba jsou v `t-btn.tsx`. Používej je pro všechna toolbar tlačítka — nikdy nevytvářej vlastní Box ručně.

```tsx
import { TBtn, Sep } from './t-btn';

// Tlačítko s textem
<TBtn title="Tučné (⌘B)" active={s.bold}
  onMouseDown={e => run(e, () => editor.chain().focus().toggleBold().run())}>
  B
</TBtn>

// Tlačítko s ikonou
<TBtn title="Link" active={s.link} onMouseDown={handleSetLink}>
  <LinkIcon />
</TBtn>

// Oddělovač skupin
<Sep />
```

**Props `TBtn`:**
| Prop | Typ | Popis |
|------|-----|-------|
| `title` | `string` | Tooltip text (zobrazí se po 600 ms) |
| `active` | `boolean?` | Zvýraznění aktivního stavu (primary barva + alfa pozadí) |
| `onMouseDown` | `(e: React.MouseEvent) => void` | Handler — vždy `e.preventDefault()` uvnitř |
| `children` | `React.ReactNode` | Obsah — text nebo SVG ikona |

Callout tlačítka používají přímo `Box` (ne `TBtn`) kvůli barevné logice per-tón — viz sekce _Callout tlačítka_.

---

## Serialization – datový tok

```
RichBlock[] | string
      ↓  blocksToHtml()
   HTML string  ←── initialContent editoru
      ↓  editor.getHTML()
   HTML string  ──→ onSave(html) → backend / store
```

### `blocksToHtml(blocks)` — vstup editoru

```ts
// blocks-to-html.ts
blocksToHtml(blocks: RichBlock[] | string): string
```

- Pokud `blocks` je `string` začínající `<` → vrátí as-is (je to HTML)
- Pokud je to prostý string → obalí do `<p>text</p>`
- Pokud je to `RichBlock[]` → konvertuje každý blok na odpovídající HTML tag

### `editor.getHTML()` — výstup při uložení

```tsx
<Button onClick={() => onSave(editor.getHTML())}>Uložit</Button>
```

Vždy ukládej HTML. Backend nebo store dostane string, který `blocksToHtml` umí přijmout zpět při dalším otevření editoru.

---

## Přidání nového toolbar tlačítka

### 1. Přidej stav do `useEditorState` selektoru (`menu-bar.tsx`)

```tsx
const s = useEditorState({
  editor,
  selector: ctx => {
    if (!ctx.editor) return null;
    return {
      // ... stávající
      superscript: ctx.editor.isActive('superscript'),  // ← nové
    };
  },
});
```

### 2. Přidej `TBtn` do JSX

```tsx
<TBtn title="Horní index" active={s.superscript}
  onMouseDown={e => run(e, () => editor.chain().focus().toggleSuperscript().run())}>
  <SuperscriptIcon />
</TBtn>
```

### 3. Pattern pro `onMouseDown` (ne `onClick`)

```tsx
const run = (e: React.MouseEvent, fn: () => unknown) => { e.preventDefault(); fn(); };
```

Vždy `e.preventDefault()` — zabrání ztrátě focusu editoru při kliknutí na toolbar.

### 4. Callout tlačítka – vzor pro toggle node

```tsx
const toggleCallout = (e: React.MouseEvent, tone: CalloutTone) => run(e, () => {
  const isActive = editor.isActive('callout', { tone });
  if (isActive) {
    editor.chain().focus().setNode('paragraph').run();
  } else {
    editor.chain().focus().setNode('callout', { tone }).run();
  }
});
```

---

## Přidání nového TipTap rozšíření

1. Nainstaluj: `yarn add @tiptap/extension-xxx`
2. Přidej do `extensions` array v `editor-body.tsx`:
   ```tsx
   import { Superscript } from '@tiptap/extension-superscript';
   // ...
   extensions: [
     StarterKit,
     // ... stávající
     Superscript,   // ← přidej
   ],
   ```
3. Přidej CSS do `editor-content-styles.ts` (žádné hardcoded barvy — vždy `theme.palette.*`)
4. Přidej tlačítko do `menu-bar.tsx`

---

## Paste a Drop handlery (`editor-body.tsx`)

### Paste obrázku z clipboardu

```tsx
handlePaste: (view, event) => {
  const items = Array.from(event.clipboardData?.items ?? []);
  const imageItem = items.find(item => item.type.startsWith('image/'));
  if (!imageItem) return false;
  const file = imageItem.getAsFile();
  if (!file) return false;
  event.preventDefault();
  const reader = new FileReader();
  reader.onload = loadEvent => {
    const src = loadEvent.target?.result;
    if (typeof src !== 'string') return;
    const imageNode = view.state.schema.nodes['image']?.create({ src });
    if (imageNode) view.dispatch(view.state.tr.replaceSelectionWith(imageNode));
  };
  reader.readAsDataURL(file);
  return true;
},
```

### Drop souborů do editoru

```tsx
handleDrop: (view, event, _slice, moved) => {
  if (moved) return false;
  const files = Array.from(event.dataTransfer?.files ?? []);
  if (!files.length) return false;
  event.preventDefault();

  const imageFiles = files.filter(f => f.type.startsWith('image/'));
  const docFiles   = files.filter(f => !f.type.startsWith('image/'));

  // Obrázky → vložit inline na pozici dropu
  if (imageFiles.length > 0) {
    const dropPos = view.posAtCoords({ left: event.clientX, top: event.clientY });
    imageFiles.forEach(imgFile => {
      const reader = new FileReader();
      reader.onload = e => {
        const src = e.target?.result;
        if (typeof src !== 'string' || !dropPos) return;
        const node = view.state.schema.nodes['image']?.create({ src });
        if (node) view.dispatch(view.state.tr.insert(dropPos.pos, node));
      };
      reader.readAsDataURL(imgFile);
    });
  }

  // Dokumenty → přidat do state příloh (zobrazit jako chips pod editorem)
  if (docFiles.length > 0) {
    setAttachments(prev => [
      ...prev,
      ...docFiles.map(f => ({ id: makeId(), name: f.name, size: f.size, mimeType: f.type })),
    ]);
  }
  return true;
},
```

---

## Styly editoru (`editor-content-styles.ts`)

Všechny styly jdou do `editorContentSx(theme, compact?)` — nikdy inline styly ani hardcoded barvy.

```tsx
// Vzor pro nový blok
'& .tiptap sup': {
  fontSize: '0.75em',
  lineHeight: 0,
  verticalAlign: 'super',
},
```

Funkce vrací `as const` objekt — TypeScript kontroluje klíče.

---

## Custom Node extension – vzor

Viz `callout-extension.ts` jako referenční implementace:

```ts
import { Node, mergeAttributes } from '@tiptap/core';

export const MyNode = Node.create({
  name: 'myNode',   // unikátní jméno, musí odpovídat isActive('myNode')
  group: 'block',   // 'block' nebo 'inline'
  content: 'inline*',  // co může obsahovat

  addAttributes() {
    return {
      myProp: {
        default: 'defaultValue',
        parseHTML: element => element.getAttribute('data-my-prop') ?? 'defaultValue',
        renderHTML: attributes => ({ 'data-my-prop': attributes.myProp }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-my-node]' }];  // jak rozpoznat z HTML
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-my-node': 'true' }), 0];
    // 0 = slot pro children (content)
  },
});
```

Po vytvoření:
1. Přidej do `extensions` array v `editor-body.tsx`
2. Přidej CSS selektor do `editor-content-styles.ts`
3. Přidej toolbar tlačítko (nebo toggle přes `setNode` / `toggleNode`)

---

## BubbleToolbar – floating popup nad výběrem

Exportovaná komponenta v `menu-bar.tsx`. Renderuje se uvnitř `<Tiptap>` kontextu v `editor-body.tsx`.

### Jak funguje

```
výběr textu (from ≠ to)
    ↓  useEditorState selector
  { from, to, bold, italic, ... }
    ↓  posToDOMRect(editor.view, from, to)
  DOMRect (viewport souřadnice výběru)
    ↓  MUI Popper (anchorEl = virtualEl)
  floating Paper nad výběrem
```

### Kdy se zobrazí / skryje

- **Zobrazí se:** výběr textu s nenulovou délkou (`from !== to`)
- **Skryje se:** prázdný kurzor, kliknutí jinam, výběr uvnitř code bloku
- **Neinteraguje:** `e.preventDefault()` na každém tlačítku zachová fokus a výběr

### Obsah toolbaru

B · I · U · S · Zvýraznění `|` Inline kód · Link

### Přidání tlačítka do BubbleToolbar

1. Přidej klíč do selektoru v `BubbleToolbar`:
   ```tsx
   superscript: ctx.editor.isActive('superscript'),
   ```
2. Přidej `TBtn` do JSX `BubbleToolbar` (stejný pattern jako v `MenuBar`)

### Render v `editor-body.tsx`

```tsx
<Tiptap editor={editor}>
  <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper' }}>
    <MenuBar />
  </Box>
  <Box sx={editorContentSx(theme, compact)}>
    <Tiptap.Content />
  </Box>
  <BubbleToolbar />   {/* musí být uvnitř <Tiptap> pro useCurrentEditor() */}
</Tiptap>
```

### Klíčové detaily implementace

```tsx
// posToDOMRect z @tiptap/react — vrací viewport DOMRect pro daný rozsah
const rect = posToDOMRect(editor.view, sel.from, sel.to);
const virtualEl = { getBoundingClientRect: () => rect };

// Popper s virtual element — anchorEl musí být cast jako HTMLElement
<Popper open anchorEl={virtualEl as unknown as HTMLElement} placement="top"
  modifiers={[{ name: 'offset', options: { offset: [0, 6] } }]}
  sx={{ zIndex: theme.zIndex.tooltip }}>
```

`as unknown as HTMLElement` je nutný cast — MUI Popper v9 přijímá virtual elementy, ale TypeScript typ to nevyžaduje.

---

## Sticky toolbar

MenuBar je obalený v `position: sticky` v `editor-body.tsx`, takže při scrollování dlouhého textu zůstane toolbar viditelný:

```tsx
<Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper' }}>
  <MenuBar />
</Box>
```

`bgcolor: 'background.paper'` zabrání průsvitnosti při překryvu textem.

---

## Undo / Redo

`StarterKit` zahrnuje `History` extension automaticky — Ctrl+Z / Ctrl+Y fungují bez konfigurace.

Pokud chceš tlačítka v toolbaru:

```tsx
// useEditorState selector
canUndo: ctx.editor.can().undo(),
canRedo: ctx.editor.can().redo(),

// TBtn v MenuBar
<TBtn title="Zpět (⌘Z)" active={false}
  onMouseDown={e => run(e, () => editor.chain().focus().undo().run())}>
  ↩
</TBtn>
<TBtn title="Znovu (⌘⇧Z)" active={false}
  onMouseDown={e => run(e, () => editor.chain().focus().redo().run())}>
  ↪
</TBtn>
```

---

## `AttachmentFile` typ

```ts
// src/types/index.ts
export interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
}
```

---

## Drag-over vizuální feedback

```tsx
// theme je dostupný přes useTheme() v editor-body.tsx
boxShadow: isDragOver
  ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.3)}`
  : `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
```

`isDragOver` se nastavuje v `handleDragOver` (pouze pokud `kind === 'file'`), resetuje v `onDragLeave` a `onDrop`.

---

## CharacterCount

```tsx
// Čtení počtu znaků
const charCount = (editor.storage.characterCount?.characters?.() as number | undefined) ?? 0;
```

---

## Checklist před dokončením

- [ ] `useEditorState` selector má `if (!ctx.editor) return null` guard
- [ ] Toolbar `onMouseDown` handlers volají `e.preventDefault()`
- [ ] Žádné hardcoded hex barvy — ani v `editor-content-styles.ts`, ani v `t-btn.tsx`, ani v `editor-body.tsx`
- [ ] Nové rozšíření přidáno jako přímá závislost (`yarn add`)
- [ ] Nový Node extension přidán do `extensions` array, má CSS v `editor-content-styles.ts`
- [ ] `yarn tsc --noEmit` bez chyb
