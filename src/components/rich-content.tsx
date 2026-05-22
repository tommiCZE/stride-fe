import type { ReactElement } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { JSONContent, RichBlock } from '../types';
import TipTapContent from './editor/tiptap-content';

function renderInline(text: string) {
  const re = /(@\w+|#[A-Z]+-\d+)/g;
  const parts: (string | ReactElement)[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('@')) {
      parts.push(
        <Box key={m.index} component="span"
          sx={{ color: 'primary.main', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
          {tok}
        </Box>
      );
    } else {
      parts.push(
        <Box key={m.index} component="span"
          sx={{ color: 'info.main', fontWeight: 600, fontFamily: 'ui-monospace, monospace', bgcolor: alpha('#0ea5e9', 0.1), px: 0.5, borderRadius: 0.5 }}>
          {tok}
        </Box>
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function highlightLine(line: string) {
  const KW = /\b(const|let|var|function|return|if|else|import|from|export|default|new|class|interface|type|extends|async|await)\b/g;
  const STR = /(['"`])(?:\\.|(?!\1).)*\1/g;
  const NUM = /\b\d+(\.\d+)?\b/g;
  const COM = /\/\/.*$/g;
  const FN  = /(\w+)(?=\()/g;

  type Mark = { start: number; end: number; cls: string; text: string };
  const marks: Mark[] = [];
  const push = (re: RegExp, cls: string) => {
    const r = new RegExp(re.source, re.flags);
    let m: RegExpExecArray | null;
    while ((m = r.exec(line)) !== null)
      marks.push({ start: m.index, end: m.index + m[0].length, cls, text: m[0] });
  };
  push(COM, 'com'); push(STR, 'str'); push(KW, 'kw'); push(NUM, 'num'); push(FN, 'fn');
  marks.sort((a, b) => a.start - b.start);

  const out: { text: string; cls?: string }[] = [];
  let last = 0;
  for (const m of marks) {
    if (m.start < last) continue;
    if (m.start > last) out.push({ text: line.slice(last, m.start) });
    out.push(m);
    last = m.end;
  }
  if (last < line.length) out.push({ text: line.slice(last) });

  const colors: Record<string, string> = { kw: '#a855f7', str: '#10b981', num: '#f59e0b', com: '#94a3b8', fn: '#0ea5e9' };
  return out.map((p, i) =>
    p.cls
      ? <Box component="span" key={i} sx={{ color: colors[p.cls], fontStyle: p.cls === 'com' ? 'italic' : 'normal' }}>{p.text}</Box>
      : <span key={i}>{p.text}</span>
  );
}

function RenderBlock({ block: b }: { block: RichBlock }) {
  if (b.type === 'h2') return <Typography variant="h5" sx={{ fontSize: '17px', fontWeight: 700, mt: 0.5 }}>{b.text}</Typography>;
  if (b.type === 'h3') return <Typography variant="h6" sx={{ fontSize: 14.5, fontWeight: 700, mt: 0.5 }}>{b.text}</Typography>;
  if (b.type === 'p')  return <Typography sx={{ fontSize: 13.5, lineHeight: 1.6 }}>{renderInline(b.text)}</Typography>;
  if (b.type === 'ul') return (
    <Stack spacing={0.4} component="ul" sx={{ m: 0, pl: 2.5 }}>
      {b.items.map((it, i) => <Box component="li" key={i} sx={{ fontSize: 13.5, lineHeight: 1.55 }}>{renderInline(it)}</Box>)}
    </Stack>
  );
  if (b.type === 'callout') {
    const tone = { info: '#0ea5e9', warn: '#f59e0b', error: '#ef4444' }[b.tone];
    return (
      <Stack direction="row" spacing={1} sx={{ p: 1.25, borderRadius: 1.2, bgcolor: alpha(tone, 0.08), border: 1, borderColor: alpha(tone, 0.25) }}>
        <Box sx={{ color: tone, fontSize: '14px', fontWeight: 700 }}>ℹ</Box>
        <Typography sx={{ fontSize: '13px', lineHeight: 1.55 }}>{b.text}</Typography>
      </Stack>
    );
  }
  if (b.type === 'code') {
    const lines = b.text.split('\n');
    return (
      <Box sx={{ borderRadius: 1.2, overflow: 'hidden', border: 1, borderColor: 'divider',
        bgcolor: 'background.default', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between',
          px: 1.25, py: 0.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.secondary' }}>{b.lang || 'text'}</Typography>
          <Typography sx={{ fontSize: '14px', color: 'text.disabled', cursor: 'default' }}>Copy</Typography>
        </Stack>
        <Box sx={{ p: 1.25, fontSize: '14px', lineHeight: 1.55, overflowX: 'auto', whiteSpace: 'pre' }}>
          {lines.map((l, i) => (
            <Stack direction="row" key={i} >
              <Box sx={{ width: 22, color: 'text.disabled', userSelect: 'none', pr: 1, textAlign: 'right' }}>{i + 1}</Box>
              <Box sx={{ flex: 1 }}>{highlightLine(l)}</Box>
            </Stack>
          ))}
        </Box>
      </Box>
    );
  }
  return null;
}

function tryParseJson(raw: string): JSONContent | null {
  try {
    return JSON.parse(raw) as JSONContent;
  } catch {
    return null;
  }
}

interface Props {
  blocks: RichBlock[] | string | JSONContent;
}

export default function RichContent({ blocks }: Props) {
  if (typeof blocks === 'object' && !Array.isArray(blocks)) {
    return <TipTapContent json={blocks} />;
  }

  if (typeof blocks === 'string' && blocks.trimStart().startsWith('{')) {
    const parsed = tryParseJson(blocks);
    if (parsed && typeof parsed === 'object') {
      return <TipTapContent json={parsed} />;
    }
  }

  const items: RichBlock[] = typeof blocks === 'string'
    ? [{ type: 'p', text: blocks }]
    : blocks;

  return (
    <Stack spacing={1.25} sx={{ '& p': { m: 0 } }}>
      {items.map((b, i) => <RenderBlock key={i} block={b}/>)}
    </Stack>
  );
}
