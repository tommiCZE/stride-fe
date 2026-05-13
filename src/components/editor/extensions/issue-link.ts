import { Mark, mergeAttributes, InputRule, markPasteRule } from '@tiptap/core';

/**
 * Issue link mark – matches patterns like `#WEB-123`, `#API-7`.
 *
 * Renders as `<a class="issue-link" data-issue-key="WEB-123">#WEB-123</a>`.
 *
 * Click + hover behaviour is implemented at the editor container level
 * (see `issue-link-handlers.tsx`) so we can use MUI components (Tooltip, navigate).
 */

// Input rule: triggers after the user types a delimiter (space, newline, punctuation),
// so we don't grab an in-progress key while still typing.
// The trigger character is preserved (not consumed) by our custom handler.
const INPUT_RULE_PATTERN = /(#[A-Z][A-Z0-9]*-\d+)(\s|[.,;:!?])$/;

// Paste rule: match any occurrence in pasted text (global flag).
const PASTE_RULE_PATTERN = /#[A-Z][A-Z0-9]*-\d+/g;

export interface IssueLinkAttributes {
  issueKey: string;
}

export const IssueLink = Mark.create({
  name: 'issueLink',

  inclusive: false,

  exitable: true,

  addAttributes() {
    return {
      issueKey: {
        default: null as string | null,
        parseHTML: element => element.getAttribute('data-issue-key'),
        renderHTML: attributes => {
          if (!attributes.issueKey) return {};
          return { 'data-issue-key': attributes.issueKey };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-issue-key]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        class: 'issue-link',
        // href is purely decorative — click is intercepted by the React handler.
        // We still set it so the link is selectable / copyable as plain text.
        href: HTMLAttributes['data-issue-key']
          ? `#${HTMLAttributes['data-issue-key']}`
          : '#',
        rel: 'noopener',
      }),
      0,
    ];
  },

  addInputRules() {
    return [
      new InputRule({
        find: INPUT_RULE_PATTERN,
        handler: ({ range, match, chain }) => {
          const fullMatch = match[0];
          const issueText = match[1]; // e.g. "#WEB-123"
          const trigger = match[2]; // delimiter that triggered the rule
          if (!issueText || !trigger) return null;

          const issueKey = issueText.slice(1); // strip leading "#"
          // Range of the marked text within the document. The full match
          // includes the trailing trigger char (space / punctuation); we mark
          // only the captured `#KEY-NUM` portion.
          const startOfIssue = range.from + fullMatch.indexOf(issueText);
          const endOfIssue = startOfIssue + issueText.length;

          chain()
            .setTextSelection({ from: startOfIssue, to: endOfIssue })
            .setMark(this.type, { issueKey })
            // Move caret back to the natural end (just before the trigger char
            // that's already in the document) and clear stored mark so the
            // delimiter (space, comma, etc.) does NOT inherit the mark.
            .setTextSelection(range.to)
            .unsetMark(this.type)
            .run();
        },
      }),
    ];
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: PASTE_RULE_PATTERN,
        type: this.type,
        getAttributes: match => {
          const text = match[0]; // e.g. "#WEB-123"
          return { issueKey: text.slice(1) };
        },
      }),
    ];
  },
});

export { INPUT_RULE_PATTERN, PASTE_RULE_PATTERN };
