import { useCurrentEditor, useEditorState, posToDOMRect } from '@tiptap/react';
import { Box, useTheme, Portal, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { TBtn, Sep } from './t-btn';
import type { CalloutTone } from './callout-extension';
import * as React from "react";

function CodeBlockIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/>
      <path d="M4.5 6.5L3 8.5l1.5 2M7.5 6.5L9 8.5l-1.5 2M11 8.5h3"/>
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12">
      <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="8" cy="5.5" r="0.9" fill="currentColor"/>
      <line x1="8" y1="7.5" x2="8" y2="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13">
      <path d="M8 2L14.5 13.5H1.5L8 2Z" fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinejoin="round"/>
      <line x1="8" y1="6.5" x2="8" y2="9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="8" cy="11.5" r="0.9" fill="currentColor"/>
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12">
      <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="5.5" y1="5.5" x2="10.5" y2="10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="10.5" y1="5.5" x2="5.5" y2="10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1.5 1.5"/>
      <path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1.5-1.5"/>
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/>
      <circle cx="5.5" cy="6" r="1.3"/>
      <path d="M1.5 11L5 7.5L7.5 10L10 8L14.5 13.5"/>
    </svg>
  );
}

function TaskListIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3.5" width="4" height="4" rx="0.75"/>
      <path d="M3.2 5.5L4.2 6.5L5.5 4.5" strokeWidth="1.3"/>
      <path d="M8 5.5h6M8 10.5h6"/>
      <rect x="2" y="8.5" width="4" height="4" rx="0.75"/>
    </svg>
  );
}

function TableIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/>
      <path d="M1.5 6.5h13M6 2.5v11"/>
    </svg>
  );
}

function HighlightIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 2.5L13.5 5.5L6 13H3V10L10.5 2.5Z"/>
      <path d="M8 5L11 8"/>
    </svg>
  );
}

function AddRowAfterIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="1.5" width="13" height="8" rx="1"/>
      <path d="M1.5 5.5h13"/>
      <path d="M8 12v2.5M6.5 13.25h3"/>
    </svg>
  );
}

function AddRowBeforeIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="6.5" width="13" height="8" rx="1"/>
      <path d="M1.5 10.5h13"/>
      <path d="M8 1v2.5M6.5 2.25h3"/>
    </svg>
  );
}

function DeleteRowIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="3.5" width="13" height="9" rx="1"/>
      <path d="M1.5 8h13"/>
      <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5"/>
    </svg>
  );
}

function AddColumnAfterIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="1.5" width="8" height="13" rx="1"/>
      <path d="M5.5 1.5v13"/>
      <path d="M12 6v4M10 8h4"/>
    </svg>
  );
}

function AddColumnBeforeIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6.5" y="1.5" width="8" height="13" rx="1"/>
      <path d="M10.5 1.5v13"/>
      <path d="M4 6v4M2 8h4"/>
    </svg>
  );
}

function DeleteColumnIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="1.5" width="8" height="13" rx="1"/>
      <path d="M5.5 5L10.5 11M10.5 5L5.5 11"/>
    </svg>
  );
}

function DeleteTableIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h10M6 4V2.5h4V4M5 4v8.5a1 1 0 001 1h4a1 1 0 001-1V4"/>
      <path d="M6.5 7v3.5M9.5 7v3.5"/>
    </svg>
  );
}

export function BubbleToolbar() {
  const { editor } = useCurrentEditor();
  const theme = useTheme();

  const sel = useEditorState({
    editor,
    selector: ctx => {
      if (!ctx.editor) return null;
      const { from, to } = ctx.editor.state.selection;
      if (from === to) return null;
      if (ctx.editor.isActive('codeBlock')) return null;
      return {
        from, to,
        bold:      ctx.editor.isActive('bold'),
        italic:    ctx.editor.isActive('italic'),
        underline: ctx.editor.isActive('underline'),
        strike:    ctx.editor.isActive('strike'),
        highlight: ctx.editor.isActive('highlight'),
        code:      ctx.editor.isActive('code'),
        link:      ctx.editor.isActive('link'),
      };
    },
  });

  if (!editor || !sel) return null;

  const rect = posToDOMRect(editor.view, sel.from, sel.to);
  const left = rect.left + rect.width / 2;
  const top = rect.top - 6;

  const run = (e: React.MouseEvent, fn: () => unknown) => { e.preventDefault(); fn(); };

  const handleLink = (e: React.MouseEvent) => run(e, () => {
    const prevUrl = editor.getAttributes('link').href as string | undefined;
    const url = globalThis.prompt('URL odkazu:', prevUrl ?? '');
    if (url === null) return;
    if (url === '') editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url }).run();
  });

  return (
    <Portal>
      <Paper elevation={4} sx={{
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        transform: 'translate(-50%, -100%)',
        zIndex: theme.zIndex.tooltip,
        display: 'flex', alignItems: 'center', gap: 0.25, px: 0.75, py: 0.5,
        borderRadius: 1.5, border: 1, borderColor: 'divider',
        pointerEvents: 'auto',
      }}>
        <TBtn title="Tučné (⌘B)" active={sel.bold}
          onMouseDown={e => run(e, () => editor.chain().focus().toggleBold().run())}>B</TBtn>
        <TBtn title="Kurzíva (⌘I)" active={sel.italic}
          onMouseDown={e => run(e, () => editor.chain().focus().toggleItalic().run())}>
          <Box component="span" sx={{ fontStyle: 'italic' }}>I</Box>
        </TBtn>
        <TBtn title="Podtržení" active={sel.underline}
          onMouseDown={e => run(e, () => editor.chain().focus().toggleUnderline().run())}>
          <Box component="span" sx={{ textDecoration: 'underline' }}>U</Box>
        </TBtn>
        <TBtn title="Přeškrtnuté" active={sel.strike}
          onMouseDown={e => run(e, () => editor.chain().focus().toggleStrike().run())}>
          <Box component="span" sx={{ textDecoration: 'line-through', fontSize: 11 }}>S</Box>
        </TBtn>
        <TBtn title="Zvýraznění" active={sel.highlight}
          onMouseDown={e => run(e, () => editor.chain().focus().toggleHighlight().run())}>
          <HighlightIcon />
        </TBtn>
        <Sep />
        <TBtn title="Inline kód" active={sel.code}
          onMouseDown={e => run(e, () => editor.chain().focus().toggleCode().run())}>
          <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{`</>`}</Box>
        </TBtn>
        <TBtn title="Link (⌘K)" active={sel.link} onMouseDown={handleLink}>
          <LinkIcon />
        </TBtn>
      </Paper>
    </Portal>
  );
}

export default function MenuBar() {
  const { editor } = useCurrentEditor();
  const theme = useTheme();

  const s = useEditorState({
    editor,
    selector: ctx => {
      if (!ctx.editor) return null;
      return {
        bold:         ctx.editor.isActive('bold'),
        italic:       ctx.editor.isActive('italic'),
        strike:       ctx.editor.isActive('strike'),
        underline:    ctx.editor.isActive('underline'),
        highlight:    ctx.editor.isActive('highlight'),
        link:         ctx.editor.isActive('link'),
        h1:           ctx.editor.isActive('heading', { level: 1 }),
        h2:           ctx.editor.isActive('heading', { level: 2 }),
        h3:           ctx.editor.isActive('heading', { level: 3 }),
        bullet:       ctx.editor.isActive('bulletList'),
        ordered:      ctx.editor.isActive('orderedList'),
        taskList:     ctx.editor.isActive('taskList'),
        blockquote:   ctx.editor.isActive('blockquote'),
        code:         ctx.editor.isActive('code'),
        codeBlock:    ctx.editor.isActive('codeBlock'),
        calloutInfo:  ctx.editor.isActive('callout', { tone: 'info' }),
        calloutWarn:  ctx.editor.isActive('callout', { tone: 'warn' }),
        calloutError: ctx.editor.isActive('callout', { tone: 'error' }),
        table:        ctx.editor.isActive('table'),
      };
    },
  });

  if (!editor || !s) return null;
  const run = (e: React.MouseEvent, fn: () => unknown) => { e.preventDefault(); fn(); };

  const blockTexts = (from: number, to: number): string[] => {
    const p: string[] = [];
    editor.state.doc.nodesBetween(from, to, n => { if (n.isTextblock) { p.push(n.textContent); return false; } });
    return p;
  };

  const toggleCallout = (e: React.MouseEvent, tone: CalloutTone) => run(e, () => {
    if (editor.isActive('callout', { tone })) { editor.chain().focus().setNode('paragraph').run(); return; }
    const { state } = editor;
    const { from, to } = state.selection;
    const parts = blockTexts(from, to);
    if (parts.length <= 1) { editor.chain().focus().setNode('callout', { tone }).run(); return; }
    const type = state.schema.nodes['callout'];
    const br   = state.schema.nodes['hardBreak'];
    if (!type) return;
    const filtered = parts.filter(Boolean);
    const inline = filtered.flatMap((p, i) => [
      ...(i > 0 && br ? [br.create()] : []),
      ...(p            ? [state.schema.text(p)] : []),
    ]);
    const node = inline.length ? type.create({ tone }, inline) : type.create({ tone });
    editor.view.dispatch(state.tr.replaceWith(state.doc.resolve(from).before(1), state.doc.resolve(to).after(1), node));
  });

  const handleToggleCodeBlock = (e: React.MouseEvent) => run(e, () => {
    if (s.codeBlock) { editor.chain().focus().toggleCodeBlock().run(); return; }
    const { state } = editor;
    const { from, to } = state.selection;
    const parts = blockTexts(from, to);
    if (parts.length <= 1) { editor.chain().focus().toggleCodeBlock().run(); return; }
    const type = state.schema.nodes['codeBlock'];
    if (!type) return;
    const text = parts.filter(Boolean).join('\n');
    const node = text ? type.create({}, state.schema.text(text)) : type.create({});
    editor.view.dispatch(state.tr.replaceWith(state.doc.resolve(from).before(1), state.doc.resolve(to).after(1), node));
  });

  const calloutColor = (active: boolean, palette: string) => ({
    color: active ? palette : undefined,
    bgcolor: active ? alpha(palette, 0.12) : undefined,
    '&:hover': active ? { bgcolor: alpha(palette, 0.2) } : undefined,
  });

  const handleSetLink = (e: React.MouseEvent) => {
    run(e, () => {
      const prevUrl = editor.getAttributes('link').href as string | undefined;
      const url = globalThis.prompt('URL odkazu:', prevUrl ?? '');
      if (url === null) return;
      if (url === '') {
        editor.chain().focus().unsetLink().run();
      } else {
        editor.chain().focus().setLink({ href: url }).run();
      }
    });
  };

  const handleInsertImage = (e: React.MouseEvent) => {
    run(e, () => {
      const url = globalThis.prompt('URL obrázku:');
      if (!url) return;
      editor.chain().focus().setImage({ src: url }).run();
    });
  };

  const handleInsertTable = (e: React.MouseEvent) => {
    run(e, () => {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    });
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, px: 1, py: 0.5, flexWrap: 'wrap' }}>

      {/* Skupna: text formátování */}
      <TBtn title="Tučné (⌘B)" active={s.bold}
        onMouseDown={e => run(e, () => editor.chain().focus().toggleBold().run())}>B</TBtn>
      <TBtn title="Kurzíva (⌘I)" active={s.italic}
        onMouseDown={e => run(e, () => editor.chain().focus().toggleItalic().run())}>
        <Box component="span" sx={{ fontStyle: 'italic' }}>I</Box>
      </TBtn>
      <TBtn title="Podtržení" active={s.underline}
        onMouseDown={e => run(e, () => editor.chain().focus().toggleUnderline().run())}>
        <Box component="span" sx={{ textDecoration: 'underline' }}>U</Box>
      </TBtn>
      <TBtn title="Přeškrtnuté" active={s.strike}
        onMouseDown={e => run(e, () => editor.chain().focus().toggleStrike().run())}>
        <Box component="span" sx={{ textDecoration: 'line-through', fontSize: 11 }}>S</Box>
      </TBtn>
      <TBtn title="Zvýraznění" active={s.highlight}
        onMouseDown={e => run(e, () => editor.chain().focus().toggleHighlight().run())}>
        <HighlightIcon />
      </TBtn>

      <Sep/>

      {/* Skupina: nadpisy */}
      <TBtn title="Heading 1" active={s.h1}
            onMouseDown={e => run(e, () => editor.chain().focus().toggleHeading({ level: 1 }).run())}>H1</TBtn>
      <TBtn title="Heading 2" active={s.h2}
        onMouseDown={e => run(e, () => editor.chain().focus().toggleHeading({ level: 2 }).run())}>H2</TBtn>
      <TBtn title="Heading 3" active={s.h3}
        onMouseDown={e => run(e, () => editor.chain().focus().toggleHeading({ level: 3 }).run())}>H3</TBtn>

      <Sep/>

      {/* Skupina: seznamy */}
      <TBtn title="Bullet list" active={s.bullet}
        onMouseDown={e => run(e, () => editor.chain().focus().toggleBulletList().run())}>
        <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M6 4h8M6 8h8M6 12h8"/>
          <circle cx="2.5" cy="4" r="1.2" fill="currentColor" stroke="none"/>
          <circle cx="2.5" cy="8" r="1.2" fill="currentColor" stroke="none"/>
          <circle cx="2.5" cy="12" r="1.2" fill="currentColor" stroke="none"/>
        </svg>
      </TBtn>
      <TBtn title="Numbered list" active={s.ordered}
        onMouseDown={e => run(e, () => editor.chain().focus().toggleOrderedList().run())}>
        <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M6 4h8M6 8h8M6 12h8"/>
          <path d="M2 3h1.5v3" strokeLinejoin="round"/>
          <path d="M2 10.5c0-1 1.5-1 1.5 0s-1.5 1-1.5 1.5H4" strokeLinejoin="round"/>
        </svg>
      </TBtn>
      <TBtn title="Task list (checkboxy)" active={s.taskList}
        onMouseDown={e => run(e, () => editor.chain().focus().toggleTaskList().run())}>
        <TaskListIcon />
      </TBtn>

      <Sep/>

      {/* Skupina: bloky */}
      <TBtn title="Citace" active={s.blockquote}
        onMouseDown={e => run(e, () => editor.chain().focus().toggleBlockquote().run())}>
        <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" opacity={0.75}>
          <path d="M2 5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2H3v1h3v1H2v-2h1a1 1 0 0 0 1-1V6H2V5zm7 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2H9v1h3v1H8v-2h1a1 1 0 0 0 1-1V6H9V5z"/>
        </svg>
      </TBtn>
      <TBtn title="Inline kód" active={s.code}
        onMouseDown={e => run(e, () => editor.chain().focus().toggleCode().run())}>
        <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{`</>`}</Box>
      </TBtn>
      <TBtn title="Blok kódu (⌘⌥C)" active={s.codeBlock} onMouseDown={handleToggleCodeBlock}>
        <CodeBlockIcon/>
      </TBtn>

      <Sep/>

      {/* Skupina: linky a média */}
      <TBtn title="Link (vyber text → ⌘K)" active={s.link} onMouseDown={handleSetLink}>
        <LinkIcon />
      </TBtn>
      <TBtn title="Vložit obrázek (URL nebo Ctrl+V)" active={false} onMouseDown={handleInsertImage}>
        <ImageIcon />
      </TBtn>
      <TBtn title="Vložit tabulku (3×3)" active={false} onMouseDown={handleInsertTable}>
        <TableIcon />
      </TBtn>

      <Sep/>

      {/* Skupina: callout bloky */}
      <Box onMouseDown={e => toggleCallout(e, 'info')} sx={{
        width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 0.75, cursor: 'default', userSelect: 'none',
        ...calloutColor(s.calloutInfo, theme.palette.info.main),
        ...(!s.calloutInfo && { color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }),
      }}>
        <InfoIcon/>
      </Box>
      <Box onMouseDown={e => toggleCallout(e, 'warn')} sx={{
        width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 0.75, cursor: 'default', userSelect: 'none',
        ...calloutColor(s.calloutWarn, theme.palette.warning.main),
        ...(!s.calloutWarn && { color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }),
      }}>
        <WarnIcon/>
      </Box>
      <Box onMouseDown={e => toggleCallout(e, 'error')} sx={{
        width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 0.75, cursor: 'default', userSelect: 'none',
        ...calloutColor(s.calloutError, theme.palette.error.main),
        ...(!s.calloutError && { color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }),
      }}>
        <ErrorIcon/>
      </Box>
    </Box>

    {s.table && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, px: 1, py: 0.5,
        borderTop: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
        <Box sx={{ fontSize: 10, fontWeight: 600, color: 'text.disabled', mr: 0.5, userSelect: 'none' }}>
          Tabulka
        </Box>
        <TBtn title="Přidat řádek níže" active={false}
          onMouseDown={e => run(e, () => editor.chain().focus().addRowAfter().run())}>
          <AddRowAfterIcon />
        </TBtn>
        <TBtn title="Přidat řádek výše" active={false}
          onMouseDown={e => run(e, () => editor.chain().focus().addRowBefore().run())}>
          <AddRowBeforeIcon />
        </TBtn>
        <TBtn title="Smazat řádek" active={false}
          onMouseDown={e => run(e, () => editor.chain().focus().deleteRow().run())}>
          <DeleteRowIcon />
        </TBtn>
        <Sep />
        <TBtn title="Přidat sloupec vpravo" active={false}
          onMouseDown={e => run(e, () => editor.chain().focus().addColumnAfter().run())}>
          <AddColumnAfterIcon />
        </TBtn>
        <TBtn title="Přidat sloupec vlevo" active={false}
          onMouseDown={e => run(e, () => editor.chain().focus().addColumnBefore().run())}>
          <AddColumnBeforeIcon />
        </TBtn>
        <TBtn title="Smazat sloupec" active={false}
          onMouseDown={e => run(e, () => editor.chain().focus().deleteColumn().run())}>
          <DeleteColumnIcon />
        </TBtn>
        <Sep />
        <TBtn title="Smazat tabulku" active={false}
          onMouseDown={e => run(e, () => editor.chain().focus().deleteTable().run())}>
          <DeleteTableIcon />
        </TBtn>
      </Box>
    )}
    </Box>
  );
}
