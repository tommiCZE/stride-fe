import { useState } from 'react';
import { Box, Tooltip } from '@mui/material';
import type { JSONContent } from '@tiptap/core';
import RichContent from '../rich-content';
import type { RichBlock } from '../../types';
import { PencilIcon } from '../icons/icons';
import EditorBody from './editor-body';
import { blocksToDoc } from './blocks-to-doc';

interface Props {
  blocks: RichBlock[] | string | JSONContent;
  editable?: boolean;
  placeholder?: string;
  onSave?: (json: JSONContent) => void;
  onCancel?: () => void;
  showToggle?: boolean;
  compact?: boolean;
}

export default function RichEditor({
  blocks,
  editable: initialEditable = false,
  placeholder = 'Napiš popis…',
  onSave,
  onCancel,
  showToggle = true,
  compact = false,
}: Readonly<Props>) {
  const [editing, setEditing] = useState(initialEditable);

  if (editing) {
    return (
      <EditorBody
        initialContent={blocksToDoc(blocks)}
        placeholder={placeholder}
        compact={compact}
        onSave={json => { onSave?.(json); setEditing(false); }}
        onCancel={() => { setEditing(false); onCancel?.(); }}
      />
    );
  }

  return (
    <Box sx={{ position: 'relative', '&:hover .flux-edit-pencil': { opacity: 1 } }}>
      <RichContent blocks={blocks} />
      {showToggle && (
        <Tooltip title="Upravit">
          <Box className="flux-edit-pencil" onClick={() => setEditing(true)}
            sx={{ position: 'absolute', top: 0, right: 0, width: 26, height: 26,
              borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'background.paper', border: 1, borderColor: 'divider',
              color: 'text.secondary', cursor: 'default',
              opacity: 0, transition: 'opacity 0.15s',
              '&:hover': { color: 'primary.main', borderColor: 'primary.main' } }}>
            <PencilIcon />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
}
