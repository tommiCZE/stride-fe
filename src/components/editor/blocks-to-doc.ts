import type { JSONContent } from '@tiptap/core';
import type { RichBlock } from '../../types';

function isJsonDoc(v: unknown): v is JSONContent {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function blocksToDoc(blocks: RichBlock[] | string | JSONContent): string | JSONContent {
  if (isJsonDoc(blocks)) return blocks;

  if (typeof blocks === 'string') {
    return blocks.trimStart().startsWith('<') ? blocks : `<p>${blocks}</p>`;
  }

  return {
    type: 'doc',
    content: blocks.map(b => {
      if (b.type === 'h2') return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: b.text }] };
      if (b.type === 'h3') return { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: b.text }] };
      if (b.type === 'p')  return { type: 'paragraph', content: b.text ? [{ type: 'text', text: b.text }] : [] };
      if (b.type === 'ul') return {
        type: 'bulletList',
        content: b.items.map(item => ({
          type: 'listItem',
          content: [{ type: 'paragraph', content: item ? [{ type: 'text', text: item }] : [] }],
        })),
      };
      if (b.type === 'callout') return {
        type: 'callout',
        attrs: { tone: b.tone },
        content: b.text ? [{ type: 'text', text: b.text }] : [],
      };
      if (b.type === 'code') return {
        type: 'codeBlock',
        attrs: { language: b.lang || null },
        content: b.text ? [{ type: 'text', text: b.text }] : [],
      };
      return { type: 'paragraph', content: [] };
    }),
  };
}
