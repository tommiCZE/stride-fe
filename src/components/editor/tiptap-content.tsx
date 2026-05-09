import { useEditor, EditorContent } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Highlight } from '@tiptap/extension-highlight';
import { Underline } from '@tiptap/extension-underline';
import { TableKit } from '@tiptap/extension-table';
import { Box, useTheme } from '@mui/material';
import { CalloutNode } from './callout-extension';
import { editorContentSx } from './editor-content-styles';

interface Props {
  json: JSONContent;
}

export default function TipTapContent({ json }: Props) {
  const theme = useTheme();

  const editor = useEditor({
    editable: false,
    content: json,
    extensions: [
      StarterKit,
      CalloutNode,
      Link.configure({ openOnClick: true }),
      Image,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      Underline,
      TableKit,
    ],
  });

  return (
    <Box sx={{
      ...editorContentSx(theme),
      '& .tiptap': { outline: 'none', padding: 0, minHeight: 0, fontSize: 13.5, lineHeight: 1.6 },
    }}>
      <EditorContent editor={editor} />
    </Box>
  );
}
