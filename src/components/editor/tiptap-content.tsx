import { useEditor, Tiptap } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Highlight } from '@tiptap/extension-highlight';
import { Underline } from '@tiptap/extension-underline';
import { TableKit } from '@tiptap/extension-table';
import { Mention } from '@tiptap/extension-mention';
import { Box, useTheme } from '@mui/material';
import { CalloutNode } from './callout-extension';
import { IssueLink } from './extensions/issue-link';
import { IssueLinkLayer } from './extensions/issue-link-handlers';
import { editorContentSx } from './editor-content-styles';

const MentionReadOnly = Mention.configure({
  HTMLAttributes: { 'data-mention': 'true', class: 'mention' },
  renderHTML: ({ options, node }) => [
    'span',
    {
      ...options.HTMLAttributes,
      'data-mention-user-id': node.attrs.id ?? '',
    },
    `@${node.attrs.label ?? node.attrs.id}`,
  ],
});

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
      IssueLink,
      MentionReadOnly,
    ],
  });

  if (!editor) return null;

  return (
    <IssueLinkLayer>
      <Box sx={{
        ...editorContentSx(theme),
        '& .tiptap': { outline: 'none', padding: 0, minHeight: 0, fontSize: 13.5, lineHeight: 1.6 },
      }}>
        <Tiptap editor={editor}>
          <Tiptap.Content />
        </Tiptap>
      </Box>
    </IssueLinkLayer>
  );
}
