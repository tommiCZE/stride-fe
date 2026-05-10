import { useState, forwardRef, useImperativeHandle } from 'react';
import { useEditor, Tiptap } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Highlight } from '@tiptap/extension-highlight';
import { Underline } from '@tiptap/extension-underline';
import { CharacterCount } from '@tiptap/extension-character-count';
import { TableKit } from '@tiptap/extension-table';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { AttachmentFile } from '../../types';
import MenuBar, { BubbleToolbar } from './menu-bar';
import { CalloutNode } from './callout-extension';
import { editorContentSx } from './editor-content-styles';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function makeId(): string {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── sub-components ─────────────────────────────────────────────────────────

function FileTypeLabel({ mimeType }: { mimeType: string }) {
  if (mimeType === 'application/pdf') {
    return <Box component="span" sx={{ fontSize: 9, fontWeight: 700, color: 'error.main', lineHeight: 1 }}>PDF</Box>;
  }
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed') || mimeType.includes('x-rar')) {
    return <Box component="span" sx={{ fontSize: 9, fontWeight: 700, color: 'warning.main', lineHeight: 1 }}>ZIP</Box>;
  }
  return (
    <Box component="span" sx={{ color: 'text.secondary', display: 'flex' }}>
      <svg width="11" height="12" viewBox="0 0 11 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
        <path d="M1.5 1h6l2 2v8h-8V1z"/>
        <path d="M7.5 1v2h2"/>
      </svg>
    </Box>
  );
}

function AttachmentChip({ file, onRemove }: { file: AttachmentFile; onRemove: () => void }) {
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.75,
      border: 1, borderColor: 'divider', borderRadius: 1,
      px: 1, py: 0.5, bgcolor: 'action.hover', maxWidth: 260,
    }}>
      <FileTypeLabel mimeType={file.mimeType} />
      <Box sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
        {file.name}
      </Box>
      <Box component="span" sx={{ fontSize: 11, color: 'text.disabled', flexShrink: 0 }}>
        {formatBytes(file.size)}
      </Box>
      <Box
        component="span"
        onMouseDown={e => { e.preventDefault(); onRemove(); }}
        sx={{ fontSize: 15, lineHeight: 1, color: 'text.disabled', cursor: 'default', flexShrink: 0,
          '&:hover': { color: 'error.main' } }}
      >
        ×
      </Box>
    </Box>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export interface EditorBodyHandle {
  getJSON: () => JSONContent;
}

interface Props {
  initialContent: string | JSONContent;
  placeholder: string;
  compact?: boolean;
  hideActions?: boolean;
  onSave?: (json: JSONContent) => void;
  onCancel?: () => void;
}

const EditorBody = forwardRef<EditorBodyHandle, Props>(function EditorBody(
  { initialContent, placeholder, compact, hideActions, onSave, onCancel }: Readonly<Props>,
  ref,
) {
  const theme = useTheme();
  const [isDragOver, setIsDragOver] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      CalloutNode,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false, allowBase64: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      Underline,
      CharacterCount,
      TableKit,
    ],
    content: initialContent,
    autofocus: 'end',
    editorProps: {
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
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;

        const files = Array.from(event.dataTransfer?.files ?? []);
        if (!files.length) return false;

        event.preventDefault();

        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        const docFiles = files.filter(f => !f.type.startsWith('image/'));

        // Images → vložit inline na pozici dropu
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

        // Dokumenty → přidat do seznamu příloh
        if (docFiles.length > 0) {
          setAttachments(prev => [
            ...prev,
            ...docFiles.map(f => ({ id: makeId(), name: f.name, size: f.size, mimeType: f.type })),
          ]);
        }

        return true;
      },
    },
  });

  useImperativeHandle(ref, () => ({
    getJSON: () => editor?.getJSON() ?? { type: 'doc', content: [] },
  }), [editor]);

  if (!editor) {
    return <Box sx={{ p: 2, color: 'text.disabled', fontSize: 13 }}>Načítám editor…</Box>;
  }

  const charCount = (editor.storage.characterCount?.characters?.() as number | undefined) ?? 0;

  const handleDragOver = (e: { preventDefault: () => void; dataTransfer: DataTransfer }) => {
    if (Array.from(e.dataTransfer.items).some(i => i.kind === 'file')) {
      e.preventDefault();
      setIsDragOver(true);
    }
  };

  return (
    <Box
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={() => setIsDragOver(false)}
      sx={{
        border: 1, borderColor: 'primary.main', borderRadius: 1.5,
        bgcolor: 'background.paper',
        boxShadow: isDragOver
          ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.3)}`
          : `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
        transition: 'box-shadow 0.15s',
      }}>

      <Tiptap editor={editor}>
        <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper' }}>
          <MenuBar />
        </Box>
        <Box sx={editorContentSx(theme, compact)}>
          <Tiptap.Content />
        </Box>
        <BubbleToolbar />
      </Tiptap>

      {attachments.length > 0 && (
        <Box sx={{ px: 2, py: 1, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.disabled', letterSpacing: 0.5 }}>
            PŘÍLOHY ({attachments.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.75 }}>
            {attachments.map(att => (
              <AttachmentChip
                key={att.id}
                file={att}
                onRemove={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
              />
            ))}
          </Box>
        </Box>
      )}

      {!hideActions && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1,
          borderTop: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
          <Box sx={{ fontSize: 11, color: 'text.disabled' }}>⌘B · ⌘I · ⌘K · Ctrl+V nebo drag obrázek/soubor</Box>
          <Box sx={{ flex: 1 }} />
          {charCount > 0 && (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>{charCount} znaků</Typography>
          )}
          <Button size="small" onClick={onCancel}>Zrušit</Button>
          <Button size="small" variant="contained" onClick={() => onSave?.(editor.getJSON())}>Uložit</Button>
        </Box>
      )}
    </Box>
  );
});

export default EditorBody;
