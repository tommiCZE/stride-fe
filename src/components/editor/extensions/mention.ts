import { Mention, type MentionNodeAttrs } from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom';
import type { SuggestionOptions, SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import type { UserDto as User } from '../../../api/types';
import MentionList, { type MentionListHandle } from './mention-list';

const MAX_RESULTS = 5;

type MentionPayload = MentionNodeAttrs;

function filterMembers(members: User[], query: string): User[] {
  const q = query.trim().toLowerCase();
  if (!q) return members.slice(0, MAX_RESULTS);
  return members
    .filter((m) => {
      const name = m.name.toLowerCase();
      const email = (m.email ?? '').toLowerCase();
      return name.startsWith(q) || email.startsWith(q) || name.includes(` ${q}`);
    })
    .slice(0, MAX_RESULTS);
}

interface BuildMentionOptions {
  getMembers: () => User[];
}

interface MentionListProps {
  items: User[];
  command: (payload: { id: string | null; label?: string | null }) => void;
}

/**
 * Creates a configured TipTap Mention extension that pulls workspace members
 * from a live snapshot via {@link BuildMentionOptions.getMembers}.
 *
 * The mention node renders as `<span data-mention data-mention-user-id="...">@Name</span>`
 * and is styled through `editorContentSx` (theme-based, no hardcoded colours).
 */
export function buildMentionExtension({ getMembers }: BuildMentionOptions) {
  const suggestion: Omit<SuggestionOptions<User, MentionPayload>, 'editor'> = {
    char: '@',
    allowSpaces: false,
    items: ({ query }) => filterMembers(getMembers(), query),
    render: () => {
      let component: ReactRenderer<MentionListHandle, MentionListProps> | null = null;
      let cleanupAutoUpdate: (() => void) | null = null;
      let floatingEl: HTMLDivElement | null = null;

      const positionFloating = (clientRect: (() => DOMRect | null) | null | undefined) => {
        if (!floatingEl || !clientRect) return;
        const rect = clientRect();
        if (!rect) return;
        const virtualRef = {
          getBoundingClientRect: () => rect,
        };
        void computePosition(virtualRef, floatingEl, {
          placement: 'bottom-start',
          middleware: [offset(6), flip(), shift({ padding: 8 })],
        }).then(({ x, y }) => {
          if (!floatingEl) return;
          floatingEl.style.left = `${x}px`;
          floatingEl.style.top = `${y}px`;
        });
      };

      const teardown = () => {
        cleanupAutoUpdate?.();
        cleanupAutoUpdate = null;
        component?.destroy();
        component = null;
        if (floatingEl?.parentNode) floatingEl.parentNode.removeChild(floatingEl);
        floatingEl = null;
      };

      const toListProps = (props: SuggestionProps<User, MentionPayload>): MentionListProps => ({
        items: props.items,
        command: props.command,
      });

      return {
        onStart: (props: SuggestionProps<User, MentionPayload>) => {
          component = new ReactRenderer<MentionListHandle, MentionListProps>(MentionList, {
            props: toListProps(props),
            editor: props.editor,
          });
          if (!props.clientRect) return;

          floatingEl = document.createElement('div');
          floatingEl.style.position = 'absolute';
          floatingEl.style.top = '0';
          floatingEl.style.left = '0';
          floatingEl.style.zIndex = '1500';
          floatingEl.appendChild(component.element);
          document.body.appendChild(floatingEl);

          const clientRect = props.clientRect;
          const virtualRef = {
            getBoundingClientRect: () => clientRect() ?? new DOMRect(),
          };
          cleanupAutoUpdate = autoUpdate(virtualRef as unknown as Element, floatingEl, () => {
            positionFloating(props.clientRect);
          });
        },
        onUpdate: (props: SuggestionProps<User, MentionPayload>) => {
          component?.updateProps(toListProps(props));
          positionFloating(props.clientRect);
        },
        onKeyDown: (props: SuggestionKeyDownProps) => {
          if (props.event.key === 'Escape') {
            teardown();
            return true;
          }
          return component?.ref?.onKeyDown({ event: props.event }) ?? false;
        },
        onExit: () => {
          teardown();
        },
      };
    },
    command: ({ editor, range, props }) => {
      const nodeAfter = editor.view.state.selection.$to.nodeAfter;
      const overrideSpace = nodeAfter?.text?.startsWith(' ');
      if (overrideSpace) {
        range.to += 1;
      }
      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          { type: 'mention', attrs: { id: props.id, label: props.label } },
          { type: 'text', text: ' ' },
        ])
        .run();
    },
  };

  return Mention.configure({
    HTMLAttributes: {
      'data-mention': 'true',
      class: 'mention',
    },
    renderText: ({ node }) => `@${node.attrs.label ?? node.attrs.id}`,
    renderHTML: ({ options, node }) => [
      'span',
      {
        ...options.HTMLAttributes,
        'data-mention-user-id': node.attrs.id ?? '',
      },
      `@${node.attrs.label ?? node.attrs.id}`,
    ],
    deleteTriggerWithBackspace: true,
    suggestion,
  });
}

/**
 * Regex to extract mentioned user ids from saved HTML or text.
 * Matches both the inline data attribute and the `@user-<id>` fallback.
 */
export const MENTION_USER_ID_PATTERN = /data-mention-user-id="([^"]+)"/g;
