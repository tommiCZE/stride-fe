import { useState } from 'react';
import { useCurrentEditor, useEditorState, posToDOMRect } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { Box, useTheme, Portal, Paper, Menu, MenuItem, ListItemIcon, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { TBtn, Sep } from './t-btn';
import type { CalloutTone } from './callout-extension';
import {
  CodeBlockIcon, InfoIcon, WarnIcon, ErrorIcon, LinkIcon, ImageIcon, TaskListIcon,
  TableIcon, HighlightIcon, AddRowAfterIcon, AddRowBeforeIcon, DeleteRowIcon,
  AddColumnAfterIcon, AddColumnBeforeIcon, DeleteColumnIcon, DeleteTableIcon,
  BlockquoteIcon, BulletListIcon, OrderedListIcon, CaretDownIcon,
} from '../icons/editor-icons';
import * as React from 'react';

// ─── shared helpers ─────────────────────────────────────────────────────────

const run = (e: React.MouseEvent, fn: () => unknown) => { e.preventDefault(); fn(); };

function blockTexts(editor: Editor, from: number, to: number): string[] {
  const p: string[] = [];
  editor.state.doc.nodesBetween(from, to, n => { if (n.isTextblock) { p.push(n.textContent); return false; } });
  return p;
}

function promptLink(editor: Editor) {
  const prevUrl = editor.getAttributes('link').href as string | undefined;
  const url = globalThis.prompt('URL odkazu:', prevUrl ?? '');
  if (url === null) return;
  if (url === '') editor.chain().focus().unsetLink().run();
  else editor.chain().focus().setLink({ href: url }).run();
}

// ─── bubble toolbar ─────────────────────────────────────────────────────────

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

  const handleLink = (e: React.MouseEvent) => run(e, () => promptLink(editor));

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
          <Box component="span" sx={{ textDecoration: 'line-through', fontSize: 13 }}>S</Box>
        </TBtn>
        <TBtn title="Zvýraznění" active={sel.highlight}
          onMouseDown={e => run(e, () => editor.chain().focus().toggleHighlight().run())}>
          <HighlightIcon />
        </TBtn>
        <Sep />
        <TBtn title="Inline kód" active={sel.code}
          onMouseDown={e => run(e, () => editor.chain().focus().toggleCode().run())}>
          <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 13 }}>{`</>`}</Box>
        </TBtn>
        <TBtn title="Link (⌘K)" active={sel.link} onMouseDown={handleLink}>
          <LinkIcon />
        </TBtn>
      </Paper>
    </Portal>
  );
}

// ─── dropdown trigger button ────────────────────────────────────────────────

interface DropdownTriggerProps {
  active: boolean;
  title: string;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  children: React.ReactNode;
}

function DropdownTrigger({ active, title, onClick, children }: DropdownTriggerProps) {
  const theme = useTheme();
  return (
    <Tooltip title={title} enterDelay={600} enterNextDelay={600}>
      <Box
        onMouseDown={e => e.preventDefault()}
        onClick={onClick}
        sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.25,
          height: 26, px: 0.75, borderRadius: 0.75,
          cursor: 'default', userSelect: 'none',
          fontSize: 13, fontWeight: 600,
          color: active ? theme.palette.primary.main : theme.palette.text.secondary,
          bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : undefined,
          '&:hover': { bgcolor: active ? alpha(theme.palette.primary.main, 0.18) : theme.palette.action.hover },
        }}
      >
        {children}
        <Box sx={{ display: 'flex', opacity: 0.7 }}><CaretDownIcon /></Box>
      </Box>
    </Tooltip>
  );
}

// ─── heading dropdown ───────────────────────────────────────────────────────

interface HeadingDropdownProps {
  editor: Editor;
  state: { h1: boolean; h2: boolean; h3: boolean };
}

function HeadingDropdown({ editor, state }: HeadingDropdownProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchor);
  const close = () => setAnchor(null);

  const active = state.h1 || state.h2 || state.h3;
  const label = state.h1 ? 'H1' : state.h2 ? 'H2' : state.h3 ? 'H3' : 'Text';

  const setHeading = (level: 1 | 2 | 3 | null) => {
    close();
    if (level === null) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  return (
    <>
      <DropdownTrigger title="Nadpis" active={active} onClick={e => setAnchor(e.currentTarget)}>
        {label}
      </DropdownTrigger>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem selected={!active} onClick={() => setHeading(null)} sx={{ fontSize: 14 }}>
          Normální text
        </MenuItem>
        <MenuItem selected={state.h1} onClick={() => setHeading(1)} sx={{ fontSize: 18, fontWeight: 700 }}>
          Nadpis 1
        </MenuItem>
        <MenuItem selected={state.h2} onClick={() => setHeading(2)} sx={{ fontSize: 16, fontWeight: 700 }}>
          Nadpis 2
        </MenuItem>
        <MenuItem selected={state.h3} onClick={() => setHeading(3)} sx={{ fontSize: 14, fontWeight: 700 }}>
          Nadpis 3
        </MenuItem>
      </Menu>
    </>
  );
}

// ─── insert dropdown ────────────────────────────────────────────────────────

interface InsertDropdownProps {
  editor: Editor;
  state: { codeBlock: boolean; blockquote: boolean; link: boolean };
  onUploadImage?: (file: File) => Promise<string>;
}

function InsertDropdown({ editor, state, onUploadImage }: InsertDropdownProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchor);
  const close = () => setAnchor(null);

  const handleLink = () => { close(); promptLink(editor); };

  const handleImage = () => {
    close();
    if (onUploadImage) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/gif,image/webp';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        void onUploadImage(file).then(url => {
          editor.chain().focus().setImage({ src: url }).run();
        });
      };
      input.click();
    } else {
      const url = globalThis.prompt('URL obrázku:');
      if (!url) return;
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleTable = () => {
    close();
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const handleCodeBlock = () => {
    close();
    if (state.codeBlock) { editor.chain().focus().toggleCodeBlock().run(); return; }
    const { state: editorState } = editor;
    const { from, to } = editorState.selection;
    const parts = blockTexts(editor, from, to);
    if (parts.length <= 1) { editor.chain().focus().toggleCodeBlock().run(); return; }
    const type = editorState.schema.nodes['codeBlock'];
    if (!type) return;
    const text = parts.filter(Boolean).join('\n');
    const node = text ? type.create({}, editorState.schema.text(text)) : type.create({});
    editor.view.dispatch(editorState.tr.replaceWith(
      editorState.doc.resolve(from).before(1),
      editorState.doc.resolve(to).after(1),
      node,
    ));
  };

  const handleQuote = () => {
    close();
    editor.chain().focus().toggleBlockquote().run();
  };

  return (
    <>
      <DropdownTrigger title="Vložit" active={false} onClick={e => setAnchor(e.currentTarget)}>
        + Vložit
      </DropdownTrigger>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem selected={state.link} onClick={handleLink} sx={{ fontSize: 14, gap: 1 }}>
          <ListItemIcon sx={{ minWidth: 26, color: 'text.secondary' }}><LinkIcon /></ListItemIcon>
          Odkaz
          <Box sx={{ ml: 'auto', pl: 2, fontSize: 11, fontFamily: 'ui-monospace, monospace', color: 'text.disabled' }}>⌘K</Box>
        </MenuItem>
        <MenuItem onClick={handleImage} sx={{ fontSize: 14, gap: 1 }}>
          <ListItemIcon sx={{ minWidth: 26, color: 'text.secondary' }}><ImageIcon /></ListItemIcon>
          Obrázek
        </MenuItem>
        <MenuItem onClick={handleTable} sx={{ fontSize: 14, gap: 1 }}>
          <ListItemIcon sx={{ minWidth: 26, color: 'text.secondary' }}><TableIcon /></ListItemIcon>
          Tabulka
        </MenuItem>
        <MenuItem selected={state.codeBlock} onClick={handleCodeBlock} sx={{ fontSize: 14, gap: 1 }}>
          <ListItemIcon sx={{ minWidth: 26, color: 'text.secondary' }}><CodeBlockIcon /></ListItemIcon>
          Blok kódu
        </MenuItem>
        <MenuItem selected={state.blockquote} onClick={handleQuote} sx={{ fontSize: 14, gap: 1 }}>
          <ListItemIcon sx={{ minWidth: 26, color: 'text.secondary' }}><BlockquoteIcon /></ListItemIcon>
          Citace
        </MenuItem>
      </Menu>
    </>
  );
}

// ─── callout dropdown ───────────────────────────────────────────────────────

interface CalloutDropdownProps {
  editor: Editor;
  state: { calloutInfo: boolean; calloutWarn: boolean; calloutError: boolean };
}

function CalloutDropdown({ editor, state }: CalloutDropdownProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchor);
  const close = () => setAnchor(null);
  const theme = useTheme();

  const active = state.calloutInfo || state.calloutWarn || state.calloutError;

  const toggleCallout = (tone: CalloutTone) => {
    close();
    if (editor.isActive('callout', { tone })) {
      editor.chain().focus().setNode('paragraph').run();
      return;
    }
    const { state: editorState } = editor;
    const { from, to } = editorState.selection;
    const parts = blockTexts(editor, from, to);
    if (parts.length <= 1) { editor.chain().focus().setNode('callout', { tone }).run(); return; }
    const type = editorState.schema.nodes['callout'];
    const br   = editorState.schema.nodes['hardBreak'];
    if (!type) return;
    const filtered = parts.filter(Boolean);
    const inline = filtered.flatMap((p, i) => [
      ...(i > 0 && br ? [br.create()] : []),
      ...(p            ? [editorState.schema.text(p)] : []),
    ]);
    const node = inline.length ? type.create({ tone }, inline) : type.create({ tone });
    editor.view.dispatch(editorState.tr.replaceWith(
      editorState.doc.resolve(from).before(1),
      editorState.doc.resolve(to).after(1),
      node,
    ));
  };

  const tones: Array<{ key: CalloutTone; label: string; icon: React.ReactNode; color: string; active: boolean }> = [
    { key: 'info',  label: 'Info',        icon: <InfoIcon />,  color: theme.palette.info.main,    active: state.calloutInfo },
    { key: 'warn',  label: 'Upozornění',  icon: <WarnIcon />,  color: theme.palette.warning.main, active: state.calloutWarn },
    { key: 'error', label: 'Chyba',       icon: <ErrorIcon />, color: theme.palette.error.main,   active: state.calloutError },
  ];

  return (
    <>
      <DropdownTrigger title="Callout" active={active} onClick={e => setAnchor(e.currentTarget)}>
        Callout
      </DropdownTrigger>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {tones.map(t => (
          <MenuItem
            key={t.key}
            selected={t.active}
            onClick={() => toggleCallout(t.key)}
            sx={{ fontSize: 14, gap: 1, color: t.active ? t.color : undefined }}
          >
            <ListItemIcon sx={{ minWidth: 26, color: t.color }}>{t.icon}</ListItemIcon>
            {t.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

// ─── main menu bar ──────────────────────────────────────────────────────────

export default function MenuBar({ onUploadImage }: { onUploadImage?: (file: File) => Promise<string> }) {
  const { editor } = useCurrentEditor();

  const s = useEditorState({
    editor,
    selector: ctx => {
      if (!ctx.editor) return null;
      return {
        bold:         ctx.editor.isActive('bold'),
        italic:       ctx.editor.isActive('italic'),
        underline:    ctx.editor.isActive('underline'),
        link:         ctx.editor.isActive('link'),
        h1:           ctx.editor.isActive('heading', { level: 1 }),
        h2:           ctx.editor.isActive('heading', { level: 2 }),
        h3:           ctx.editor.isActive('heading', { level: 3 }),
        bullet:       ctx.editor.isActive('bulletList'),
        ordered:      ctx.editor.isActive('orderedList'),
        taskList:     ctx.editor.isActive('taskList'),
        blockquote:   ctx.editor.isActive('blockquote'),
        codeBlock:    ctx.editor.isActive('codeBlock'),
        calloutInfo:  ctx.editor.isActive('callout', { tone: 'info' }),
        calloutWarn:  ctx.editor.isActive('callout', { tone: 'warn' }),
        calloutError: ctx.editor.isActive('callout', { tone: 'error' }),
        table:        ctx.editor.isActive('table'),
      };
    },
  });

  if (!editor || !s) return null;

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, px: 1, py: 0.5, flexWrap: 'wrap' }}>

        {/* Skupina: inline formátování */}
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

        <Sep/>

        {/* Heading dropdown nahrazuje H1/H2/H3 buttony */}
        <HeadingDropdown editor={editor} state={{ h1: s.h1, h2: s.h2, h3: s.h3 }}/>

        <Sep/>

        {/* Skupina: seznamy */}
        <TBtn title="Bullet list" active={s.bullet}
          onMouseDown={e => run(e, () => editor.chain().focus().toggleBulletList().run())}>
          <BulletListIcon/>
        </TBtn>
        <TBtn title="Numbered list" active={s.ordered}
          onMouseDown={e => run(e, () => editor.chain().focus().toggleOrderedList().run())}>
          <OrderedListIcon/>
        </TBtn>
        <TBtn title="Task list (checkboxy)" active={s.taskList}
          onMouseDown={e => run(e, () => editor.chain().focus().toggleTaskList().run())}>
          <TaskListIcon />
        </TBtn>

        <Sep/>

        {/* Insert dropdown — link / image / table / code block / quote */}
        <InsertDropdown
          editor={editor}
          state={{ codeBlock: s.codeBlock, blockquote: s.blockquote, link: s.link }}
          onUploadImage={onUploadImage}
        />

        {/* Callout dropdown — info / warn / error */}
        <CalloutDropdown
          editor={editor}
          state={{ calloutInfo: s.calloutInfo, calloutWarn: s.calloutWarn, calloutError: s.calloutError }}
        />

        {/* Shortcut hint vpravo */}
        <Box sx={{ ml: 'auto', pl: 1 }}>
          <Typography sx={{ fontSize: 11, color: 'text.disabled', fontFamily: 'ui-monospace, monospace' }}>
            ⌘B · ⌘I · / pro víc
          </Typography>
        </Box>
      </Box>

      {s.table && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, px: 1, py: 0.5,
          borderTop: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
          <Box sx={{ fontSize: 14, fontWeight: 600, color: 'text.disabled', mr: 0.5, userSelect: 'none' }}>
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
