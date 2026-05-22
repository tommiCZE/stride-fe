import { Extension, type Editor, type Range } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion from '@tiptap/suggestion';
import { createRoot, type Root } from 'react-dom/client';
import { createElement, createRef, type ReactNode } from 'react';
import SlashMenuList, { type SlashMenuListHandle } from './slash-menu-list';

/**
 * A selectable entry in the slash command menu.
 */
export interface SlashMenuItem {
  id: string;
  label: string;
  description: string;
  icon: ReactNode;
  /** Aliases the user can type after `/` to filter (lowercase). */
  keywords: string[];
  /**
   * Executed when the user selects the item. The Suggestion plugin already
   * deletes the `/query` text by calling `deleteRange(range)` for us before
   * invoking the wrapping `command` (see `slashMenuPluginKey`).
   */
  command: (props: { editor: Editor; range: Range }) => void;
}

// ─── Inline SVG icons ────────────────────────────────────────────────────────
// We use plain SVG elements so the extension is decoupled from MUI / icon
// libraries. Stroke uses `currentColor` so the icon inherits text color.

const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const HeadingIcon = (level: 1 | 2 | 3) =>
  createElement(
    'svg',
    iconProps,
    createElement('path', { d: 'M3 3v10M11 3v10M3 8h8', key: 'h' }),
    createElement(
      'text',
      { x: 12.5, y: 13, fontSize: '6px', fill: 'currentColor', stroke: 'none', key: 't' },
      String(level),
    ),
  );

const BulletListIcon = () =>
  createElement(
    'svg',
    iconProps,
    createElement('circle', { cx: 3, cy: 4, r: 1, fill: 'currentColor', stroke: 'none', key: 'd1' }),
    createElement('circle', { cx: 3, cy: 8, r: 1, fill: 'currentColor', stroke: 'none', key: 'd2' }),
    createElement('circle', { cx: 3, cy: 12, r: 1, fill: 'currentColor', stroke: 'none', key: 'd3' }),
    createElement('path', { d: 'M6.5 4h7M6.5 8h7M6.5 12h7', key: 'l' }),
  );

const OrderedListIcon = () =>
  createElement(
    'svg',
    iconProps,
    createElement(
      'text',
      { x: 1, y: 5.5, fontSize: 4.5, fill: 'currentColor', stroke: 'none', key: 't1' },
      '1.',
    ),
    createElement(
      'text',
      { x: 1, y: 9.5, fontSize: 4.5, fill: 'currentColor', stroke: 'none', key: 't2' },
      '2.',
    ),
    createElement(
      'text',
      { x: 1, y: 13.5, fontSize: 4.5, fill: 'currentColor', stroke: 'none', key: 't3' },
      '3.',
    ),
    createElement('path', { d: 'M6.5 4h7M6.5 8h7M6.5 12h7', key: 'l' }),
  );

const TaskListIcon = () =>
  createElement(
    'svg',
    iconProps,
    createElement('rect', { x: 2, y: 2.5, width: 4, height: 4, rx: 0.5, key: 'b1' }),
    createElement('rect', { x: 2, y: 9.5, width: 4, height: 4, rx: 0.5, key: 'b2' }),
    createElement('path', { d: 'M8 4.5h6M8 11.5h6', key: 'l' }),
    createElement('path', { d: 'M2.8 4.5l1 1 1.4-1.5', key: 'c' }),
  );

const CodeBlockIcon = () =>
  createElement(
    'svg',
    iconProps,
    createElement('rect', { x: 1.5, y: 2.5, width: 13, height: 11, rx: 1.5, key: 'r' }),
    createElement('path', { d: 'M4.5 6.5L3 8.5l1.5 2M7.5 6.5L9 8.5l-1.5 2M11 8.5h3', key: 'p' }),
  );

const QuoteIcon = () =>
  createElement(
    'svg',
    iconProps,
    createElement('path', {
      d: 'M3 5c0-1 1-2 2-2v2c-.5 0-1 .5-1 1v2h2v4H2V6c0-.4 0-.7 1-1zM10 5c0-1 1-2 2-2v2c-.5 0-1 .5-1 1v2h2v4H9V6c0-.4 0-.7 1-1z',
      fill: 'currentColor',
      stroke: 'none',
      key: 'q',
    }),
  );

const DividerIcon = () =>
  createElement(
    'svg',
    iconProps,
    createElement('path', { d: 'M2 8h12', key: 'l' }),
  );

const CalloutIcon = () =>
  createElement(
    'svg',
    iconProps,
    createElement('rect', { x: 1.5, y: 2.5, width: 13, height: 11, rx: 1.5, key: 'r' }),
    createElement('circle', { cx: 5, cy: 8, r: 1.2, fill: 'currentColor', stroke: 'none', key: 'd' }),
    createElement('path', { d: 'M7.5 6.5h5M7.5 9.5h4', key: 'l' }),
  );

const ImageIcon = () =>
  createElement(
    'svg',
    iconProps,
    createElement('rect', { x: 1.5, y: 2.5, width: 13, height: 11, rx: 1.5, key: 'r' }),
    createElement('circle', { cx: 5.5, cy: 6.5, r: 1.2, key: 'c' }),
    createElement('path', { d: 'M2 12l3.5-3.5 2.5 2.5L11 8l3 3', key: 'p' }),
  );

const TableIcon = () =>
  createElement(
    'svg',
    iconProps,
    createElement('rect', { x: 1.5, y: 2.5, width: 13, height: 11, rx: 1.5, key: 'r' }),
    createElement('path', { d: 'M1.5 6.5h13M1.5 10.5h13M5.5 2.5v11M10.5 2.5v11', key: 'g' }),
  );

// ─── Items ───────────────────────────────────────────────────────────────────

const SLASH_ITEMS: SlashMenuItem[] = [
  {
    id: 'heading-1',
    label: 'Heading 1',
    description: 'Velký nadpis',
    icon: HeadingIcon(1),
    keywords: ['h1', 'heading', 'nadpis', 'title'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
    },
  },
  {
    id: 'heading-2',
    label: 'Heading 2',
    description: 'Střední nadpis',
    icon: HeadingIcon(2),
    keywords: ['h2', 'heading', 'nadpis', 'subtitle'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
    },
  },
  {
    id: 'heading-3',
    label: 'Heading 3',
    description: 'Malý nadpis',
    icon: HeadingIcon(3),
    keywords: ['h3', 'heading', 'nadpis'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
    },
  },
  {
    id: 'bullet-list',
    label: 'Bullet list',
    description: 'Odrážkový seznam',
    icon: BulletListIcon(),
    keywords: ['ul', 'bullet', 'list', 'seznam', 'odrazka'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    id: 'numbered-list',
    label: 'Numbered list',
    description: 'Číslovaný seznam',
    icon: OrderedListIcon(),
    keywords: ['ol', 'numbered', 'ordered', 'list', 'seznam', 'cislovany'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    id: 'task-list',
    label: 'Task list',
    description: 'Seznam úkolů s checkboxy',
    icon: TaskListIcon(),
    keywords: ['task', 'todo', 'check', 'ukol'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    id: 'code-block',
    label: 'Code block',
    description: 'Blok kódu s monospace fontem',
    icon: CodeBlockIcon(),
    keywords: ['code', 'kod', 'pre', 'snippet'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run();
    },
  },
  {
    id: 'quote',
    label: 'Quote',
    description: 'Citace nebo odsazený text',
    icon: QuoteIcon(),
    keywords: ['quote', 'citace', 'blockquote'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setBlockquote().run();
    },
  },
  {
    id: 'divider',
    label: 'Divider',
    description: 'Vodorovný oddělovač',
    icon: DividerIcon(),
    keywords: ['divider', 'hr', 'separator', 'oddelovac', 'rule'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    id: 'callout-info',
    label: 'Callout info',
    description: 'Modré upozornění',
    icon: CalloutIcon(),
    keywords: ['callout', 'info', 'note', 'upozorneni'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({ type: 'callout', attrs: { tone: 'info' } })
        .run();
    },
  },
  {
    id: 'callout-warning',
    label: 'Callout warning',
    description: 'Žluté varování',
    icon: CalloutIcon(),
    keywords: ['callout', 'warn', 'warning', 'varovani', 'pozor'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({ type: 'callout', attrs: { tone: 'warn' } })
        .run();
    },
  },
  {
    id: 'callout-error',
    label: 'Callout error',
    description: 'Červená chyba',
    icon: CalloutIcon(),
    keywords: ['callout', 'error', 'danger', 'chyba'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({ type: 'callout', attrs: { tone: 'error' } })
        .run();
    },
  },
  {
    id: 'image',
    label: 'Image',
    description: 'Vložit obrázek z URL',
    icon: ImageIcon(),
    keywords: ['image', 'img', 'picture', 'obrazek'],
    command: ({ editor, range }) => {
      const url = globalThis.prompt('URL obrázku:');
      const chain = editor.chain().focus().deleteRange(range);
      if (url) {
        chain.setImage({ src: url }).run();
      } else {
        chain.run();
      }
    },
  },
  {
    id: 'table',
    label: 'Table',
    description: 'Tabulka 3×3',
    icon: TableIcon(),
    keywords: ['table', 'tabulka', 'grid'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
];

function filterItems(query: string): SlashMenuItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return SLASH_ITEMS;
  return SLASH_ITEMS.filter(item => {
    if (item.label.toLowerCase().startsWith(q)) return true;
    if (item.label.toLowerCase().includes(q)) return true;
    return item.keywords.some(k => k.startsWith(q));
  });
}

export const slashMenuPluginKey = new PluginKey('slashMenu');

// ─── Extension ───────────────────────────────────────────────────────────────

/**
 * Slash command menu extension. Triggers on `/` at the start of an empty line
 * and renders a Linear/Notion-style dropdown via React.
 *
 * The dropdown component (`SlashMenuList`) is rendered into a detached div
 * appended to `document.body`. We tear it down in `onExit`.
 */
export const SlashMenu = Extension.create({
  name: 'slashMenu',

  addProseMirrorPlugins() {
    return [
      Suggestion<SlashMenuItem, SlashMenuItem>({
        editor: this.editor,
        pluginKey: slashMenuPluginKey,
        char: '/',
        startOfLine: true,
        allowSpaces: false,
        items: ({ query }) => filterItems(query),
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        render: () => {
          let container: HTMLDivElement | null = null;
          let root: Root | null = null;
          const componentRef = createRef<SlashMenuListHandle>();
          let latestProps:
            | { items: SlashMenuItem[]; command: (item: SlashMenuItem) => void; clientRect?: (() => DOMRect | null) | null }
            | null = null;

          const renderDropdown = () => {
            if (!container || !root || !latestProps) return;
            root.render(
              createElement(SlashMenuList, {
                ref: componentRef,
                items: latestProps.items,
                command: latestProps.command,
                clientRect: latestProps.clientRect,
              }),
            );
          };

          return {
            onStart: props => {
              container = document.createElement('div');
              container.setAttribute('data-slash-menu-root', 'true');
              document.body.appendChild(container);
              root = createRoot(container);
              latestProps = {
                items: props.items,
                command: props.command,
                clientRect: props.clientRect,
              };
              renderDropdown();
            },
            onUpdate: props => {
              latestProps = {
                items: props.items,
                command: props.command,
                clientRect: props.clientRect,
              };
              renderDropdown();
            },
            onKeyDown: props => {
              if (props.event.key === 'Escape') {
                // Bubble Escape up so Suggestion clears decoration / dismisses.
                return false;
              }
              return componentRef.current?.onKeyDown(props.event) ?? false;
            },
            onExit: () => {
              const r = root;
              const c = container;
              root = null;
              container = null;
              latestProps = null;
              if (r) {
                // Unmount async — React forbids unmounting during render commit.
                queueMicrotask(() => {
                  r.unmount();
                  if (c?.parentNode) c.parentNode.removeChild(c);
                });
              } else if (c?.parentNode) {
                c.parentNode.removeChild(c);
              }
            },
          };
        },
      }),
    ];
  },
});

export default SlashMenu;
