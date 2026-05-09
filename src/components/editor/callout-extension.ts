import { Node, mergeAttributes } from '@tiptap/core';

export type CalloutTone = 'info' | 'warn' | 'error';

export const CalloutNode = Node.create({
  name: 'callout',
  group: 'block',
  content: 'inline*',

  addAttributes() {
    return {
      tone: {
        default: 'info' as CalloutTone,
        parseHTML: element =>
          (element.getAttribute('data-tone') ?? 'info') as CalloutTone,
        renderHTML: attributes => ({ 'data-tone': attributes.tone as CalloutTone }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-callout': 'true' }), 0];
  },
});
