import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

export function editorContentSx(theme: Theme, compact?: boolean) {
  const isDark = theme.palette.mode === 'dark';

  // Code surfaces are intentionally split per mode:
  //  - dark: deeper than `paper` so the block "sinks" into the page
  //  - light: subtle slate tint that still reads as code, not as a callout
  const codeInlineBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)';
  const codeBlockBg  = isDark ? '#0a0c12' : '#f3f4f8';
  const codeBlockFg  = isDark ? '#e6e8ef' : '#0f172a';
  const codeBorder   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';

  // atom-one-dark / atom-one-light inspired token palette. Applied via
  // `.hljs-*` classes that lowlight / highlight.js emit when a language is
  // detected. Without lowlight wired in these rules are simply inert, so
  // there is no runtime cost and the moment we plug it in code blocks light
  // up correctly in both modes.
  const tokens = isDark
    ? {
        comment:  '#7c8597',
        keyword:  '#c678dd',
        string:   '#98c379',
        number:   '#d19a66',
        function: '#61afef',
        variable: '#e06c75',
        type:     '#56b6c2',
        attr:     '#e5c07b',
        builtin:  '#56b6c2',
        deletion: '#e06c75',
        addition: '#98c379',
      }
    : {
        comment:  '#a0a1a7',
        keyword:  '#a626a4',
        string:   '#50a14f',
        number:   '#986801',
        function: '#4078f2',
        variable: '#e45649',
        type:     '#0184bb',
        attr:     '#c18401',
        builtin:  '#0184bb',
        deletion: '#e45649',
        addition: '#50a14f',
      };

  return {
    '& .tiptap': {
      outline: 'none', padding: '16px',
      minHeight: compact ? 80 : 160, fontSize: 13.5, lineHeight: 1.6,
    },
    '& .tiptap h2': { fontSize: 17, fontWeight: 700, margin: '8px 0 4px' },
    '& .tiptap h3': { fontSize: 14.5, fontWeight: 700, margin: '6px 0 2px' },
    '& .tiptap p':  { margin: '4px 0' },
    '& .tiptap ul, & .tiptap ol': { paddingLeft: '24px', margin: '4px 0' },
    '& .tiptap blockquote': {
      borderLeft: `3px solid ${theme.palette.primary.main}`,
      paddingLeft: '12px', marginLeft: 0,
      color: theme.palette.text.secondary, fontStyle: 'italic',
    },
    '& .tiptap code': {
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      backgroundColor: codeInlineBg,
      color: theme.palette.text.primary,
      padding: '0 4px', borderRadius: '4px', fontSize: '12px',
    },
    '& .tiptap pre': {
      backgroundColor: codeBlockBg,
      color: codeBlockFg,
      padding: '12px', borderRadius: '6px',
      border: `1px solid ${codeBorder}`,
      overflowX: 'auto', margin: '8px 0',
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: '12px', lineHeight: 1.55,
    },
    '& .tiptap pre code': {
      backgroundColor: 'transparent', padding: 0, color: 'inherit',
    },

    // Syntax tokens (highlight.js / lowlight class names)
    '& .tiptap pre code .hljs-comment, & .tiptap pre code .hljs-quote': {
      color: tokens.comment, fontStyle: 'italic',
    },
    '& .tiptap pre code .hljs-keyword, & .tiptap pre code .hljs-selector-tag, & .tiptap pre code .hljs-literal, & .tiptap pre code .hljs-section, & .tiptap pre code .hljs-link': {
      color: tokens.keyword,
    },
    '& .tiptap pre code .hljs-string, & .tiptap pre code .hljs-regexp, & .tiptap pre code .hljs-meta-string': {
      color: tokens.string,
    },
    '& .tiptap pre code .hljs-number, & .tiptap pre code .hljs-meta': {
      color: tokens.number,
    },
    '& .tiptap pre code .hljs-title, & .tiptap pre code .hljs-title.function_, & .tiptap pre code .hljs-function .hljs-title': {
      color: tokens.function,
    },
    '& .tiptap pre code .hljs-variable, & .tiptap pre code .hljs-template-variable, & .tiptap pre code .hljs-name, & .tiptap pre code .hljs-selector-id, & .tiptap pre code .hljs-tag': {
      color: tokens.variable,
    },
    '& .tiptap pre code .hljs-type, & .tiptap pre code .hljs-class .hljs-title, & .tiptap pre code .hljs-symbol, & .tiptap pre code .hljs-bullet': {
      color: tokens.type,
    },
    '& .tiptap pre code .hljs-attr, & .tiptap pre code .hljs-attribute, & .tiptap pre code .hljs-selector-attr, & .tiptap pre code .hljs-selector-pseudo, & .tiptap pre code .hljs-params': {
      color: tokens.attr,
    },
    '& .tiptap pre code .hljs-built_in, & .tiptap pre code .hljs-builtin-name': {
      color: tokens.builtin,
    },
    '& .tiptap pre code .hljs-deletion': {
      color: tokens.deletion,
      backgroundColor: alpha(theme.palette.error.main, isDark ? 0.18 : 0.12),
    },
    '& .tiptap pre code .hljs-addition': {
      color: tokens.addition,
      backgroundColor: alpha(theme.palette.success.main, isDark ? 0.18 : 0.12),
    },
    '& .tiptap pre code .hljs-emphasis': { fontStyle: 'italic' },
    '& .tiptap pre code .hljs-strong':   { fontWeight: 700 },

    // Callout bloky
    '& .tiptap div[data-callout]': {
      display: 'flex', alignItems: 'flex-start', gap: '8px',
      padding: '10px 12px', borderRadius: '6px', margin: '6px 0',
      fontSize: '13px', lineHeight: 1.55, borderLeft: '3px solid',
    },
    '& .tiptap div[data-callout]::before': {
      flexShrink: 0, fontWeight: 700, fontSize: '14px', lineHeight: 1.4, marginTop: '1px',
    },
    '& .tiptap div[data-callout][data-tone="info"]': {
      backgroundColor: alpha(theme.palette.info.main, 0.08),
      borderColor: theme.palette.info.main,
      '&::before': { content: '"ℹ"', color: theme.palette.info.main },
    },
    '& .tiptap div[data-callout][data-tone="warn"]': {
      backgroundColor: alpha(theme.palette.warning.main, 0.08),
      borderColor: theme.palette.warning.main,
      '&::before': { content: '"⚠"', color: theme.palette.warning.main },
    },
    '& .tiptap div[data-callout][data-tone="error"]': {
      backgroundColor: alpha(theme.palette.error.main, 0.08),
      borderColor: theme.palette.error.main,
      '&::before': { content: '"✕"', color: theme.palette.error.main },
    },

    // Placeholder
    '& .tiptap p.is-editor-empty:first-child::before': {
      content: 'attr(data-placeholder)', float: 'left', height: 0,
      pointerEvents: 'none', color: theme.palette.text.disabled,
    },

    // Task list (checkboxy)
    '& .tiptap ul[data-type="taskList"]': {
      listStyle: 'none', paddingLeft: '4px', margin: '4px 0',
    },
    '& .tiptap ul[data-type="taskList"] li': {
      display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '3px 0',
    },
    '& .tiptap ul[data-type="taskList"] li > label': {
      flexShrink: 0, marginTop: '2px', cursor: 'pointer',
    },
    '& .tiptap ul[data-type="taskList"] li > label input[type="checkbox"]': {
      width: '14px', height: '14px', cursor: 'pointer',
      accentColor: theme.palette.primary.main,
    },
    '& .tiptap ul[data-type="taskList"] li > div': {
      flex: 1,
    },
    '& .tiptap ul[data-type="taskList"] li[data-checked="true"] > div': {
      color: theme.palette.text.disabled,
      textDecoration: 'line-through',
    },

    // Obrázky
    '& .tiptap img': {
      maxWidth: '100%', height: 'auto',
      borderRadius: '6px', margin: '8px 0',
      border: `1px solid ${theme.palette.divider}`,
      display: 'block',
    },
    '& .tiptap img.ProseMirror-selectednode': {
      outline: `2px solid ${theme.palette.primary.main}`,
    },

    // Linky
    '& .tiptap a': {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
      textUnderlineOffset: '2px',
      cursor: 'pointer',
    },
    '& .tiptap a:hover': {
      color: theme.palette.primary.dark,
    },

    // Issue link – #KEY-NUM
    '& .tiptap a.issue-link': {
      display: 'inline-block',
      padding: '0 4px',
      borderRadius: '4px',
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: '0.92em',
      fontWeight: 600,
      textDecoration: 'none',
      color: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      cursor: 'pointer',
      lineHeight: 1.3,
      verticalAlign: 'baseline',
      transition: 'background-color 0.12s, border-color 0.12s',
    },
    '& .tiptap a.issue-link:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.18),
      borderColor: alpha(theme.palette.primary.main, 0.4),
      color: theme.palette.primary.dark,
    },
    // @mentions
    '& .tiptap span[data-mention]': {
      display: 'inline-block',
      padding: '0 6px',
      borderRadius: '10px',
      fontWeight: 600,
      fontSize: '12.5px',
      lineHeight: 1.5,
      color: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
      cursor: 'default',
      whiteSpace: 'nowrap',
    },
    '& .tiptap span[data-mention]:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.18),
    },
    // Suggestion decoration (visible while typing `@foo`)
    '& .tiptap span.suggestion': {
      color: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      borderRadius: '4px',
      padding: '0 2px',
    },

    // Zvýraznění (Highlight)
    '& .tiptap mark': {
      backgroundColor: alpha(theme.palette.warning.main, 0.35),
      color: 'inherit',
      borderRadius: '2px',
      padding: '0 2px',
    },

    // Tabulky
    '& .tiptap table': {
      borderCollapse: 'collapse', width: '100%',
      margin: '10px 0', fontSize: '13px',
      tableLayout: 'fixed',
    },
    '& .tiptap table td, & .tiptap table th': {
      border: `1px solid ${theme.palette.divider}`,
      padding: '6px 10px', verticalAlign: 'top',
      minWidth: '60px', position: 'relative',
    },
    '& .tiptap table th': {
      backgroundColor: alpha(theme.palette.primary.main, 0.06),
      fontWeight: 600, textAlign: 'left',
    },
    '& .tiptap table .selectedCell:after': {
      zIndex: 2, position: 'absolute',
      content: '""', left: 0, right: 0, top: 0, bottom: 0,
      background: alpha(theme.palette.primary.main, 0.1),
      pointerEvents: 'none',
    },
    '& .tiptap .tableWrapper': {
      overflowX: 'auto', margin: '8px 0',
    },
  } as const;
}
