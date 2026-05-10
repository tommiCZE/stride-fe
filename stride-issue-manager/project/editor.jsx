// editor.jsx — WYSIWYG-style rich text renderer + slash menu mock

const ME = window.MaterialUI;
const { Box: EBox, Typography: ETypography, IconButton: EIconButton,
        Tooltip: ETooltip, Divider: EDivider, TextField: ETextField,
        Button: EButton } = ME;
const { alpha: eAlpha } = ME;
const { useState: eUse, useRef: eRef, useEffect: eEff } = React;

// Toolbar buttons
function ToolbarBtn({ icon, label, active, onClick, disabled }) {
  return (
    <ETooltip title={label}>
      <EBox onClick={() => !disabled && onClick && onClick()}
        sx={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 0.8, cursor: disabled ? 'not-allowed' : 'default',
              color: disabled ? 'text.disabled' : (active ? 'primary.main' : 'text.secondary'),
              bgcolor: active ? 'action.selected' : 'transparent',
              '&:hover': { bgcolor: disabled ? 'transparent' : 'action.hover' } }}>
        {icon}
      </EBox>
    </ETooltip>
  );
}

const EI = {
  bold: <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3h4.2c1.7 0 3 1 3 2.6 0 1-.5 1.8-1.4 2.2 1.2.4 1.9 1.3 1.9 2.5 0 1.8-1.4 2.7-3.3 2.7H5V3zm2 4h2c.8 0 1.3-.4 1.3-1.1 0-.7-.5-1.1-1.3-1.1H7v2.2zm0 4.2h2.2c.9 0 1.5-.4 1.5-1.2s-.6-1.2-1.5-1.2H7v2.4z"/></svg>,
  italic: <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 3h5v1.5H10L8 11.5h1.5V13h-5v-1.5H6L8 4.5H6.5z"/></svg>,
  strike: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2.5 8h11M5 4h6M6 12h4" strokeLinecap="round"/></svg>,
  code: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 5-3 3 3 3M10 5l3 3-3 3"/></svg>,
  h1: <span style={{ fontSize: 11, fontWeight: 700 }}>H1</span>,
  h2: <span style={{ fontSize: 11, fontWeight: 700 }}>H2</span>,
  h3: <span style={{ fontSize: 11, fontWeight: 700 }}>H3</span>,
  ul: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="3" cy="4.5" r=".8" fill="currentColor"/><circle cx="3" cy="8" r=".8" fill="currentColor"/><circle cx="3" cy="11.5" r=".8" fill="currentColor"/><path d="M6 4.5h7M6 8h7M6 11.5h7"/></svg>,
  ol: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M6 4.5h7M6 8h7M6 11.5h7"/><text x="1" y="6" fontSize="4.5" fontWeight="700" fill="currentColor" stroke="none">1</text><text x="1" y="9.5" fontSize="4.5" fontWeight="700" fill="currentColor" stroke="none">2</text><text x="1" y="13" fontSize="4.5" fontWeight="700" fill="currentColor" stroke="none">3</text></svg>,
  todo: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="3" width="4" height="4" rx="1"/><path d="M2.8 5 3.7 5.9 5.2 4.4" strokeLinecap="round" strokeLinejoin="round"/><rect x="2" y="9" width="4" height="4" rx="1"/><path d="M8 5h6M8 11h6" strokeLinecap="round"/></svg>,
  quote: <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M3 11V8c0-2 1-3 3-3.5L5.5 5.5C4.5 5.7 4 6.3 4 7.5V8h1.5v3H3zm6 0V8c0-2 1-3 3-3.5L11.5 5.5c-1 .2-1.5.8-1.5 2V8h1.5v3H9z"/></svg>,
  link: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M7 9.5 9 7.5M6 4.5 7.5 3a2.5 2.5 0 0 1 3.5 3.5L9.5 8M6.5 8 5 9.5A2.5 2.5 0 0 0 8.5 13L10 11.5"/></svg>,
  image: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="10" rx="1.5"/><circle cx="6" cy="7" r="1.2"/><path d="m2.5 12 3.5-3 3 2.5L11 9l2.5 2"/></svg>,
  table: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="3" width="12" height="10" rx="1"/><path d="M2 6.5h12M2 9.5h12M6 3v10M10 3v10"/></svg>,
  divider: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 8h12" strokeLinecap="round"/></svg>,
  mention: <span style={{ fontSize: 12, fontWeight: 700 }}>@</span>,
  task: <span style={{ fontSize: 11, fontWeight: 700 }}>#</span>,
  callout: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5M8 11v.1" strokeLinecap="round"/></svg>,
};

// ── Toolbar ─────────────────────────────────────────────────────────────────
function EditorToolbar({ onInsert, onCmd }) {
  const cmd = onCmd || (() => {});
  const [active, setActive] = eUse({ bold: false, italic: false });
  // Each group has a left border that acts as a separator (no flex item that can wrap)
  const grp = (children, first = false) => (
    <EBox sx={{ display: 'flex', gap: 0.25, alignItems: 'center', flexShrink: 0,
                pl: first ? 0 : 0.75, ml: first ? 0 : 0.5,
                borderLeft: first ? 0 : 1, borderColor: 'divider' }}>
      {children}
    </EBox>
  );

  return (
    <EBox sx={{ position: 'sticky', top: 0, zIndex: 2,
                display: 'flex', alignItems: 'center', gap: 0.25,
                p: 0.6, borderBottom: 1, borderColor: 'divider',
                bgcolor: 'background.paper',
                overflowX: 'auto', overflowY: 'hidden',
                scrollbarWidth: 'thin',
                '&::-webkit-scrollbar': { height: 6 },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 } }}>
      {grp(<>
        <ToolbarBtn label="Heading 2" icon={EI.h2} onClick={() => onInsert && onInsert('h2')}/>
        <ToolbarBtn label="Heading 3" icon={EI.h3} onClick={() => onInsert && onInsert('h3')}/>
      </>, true)}
      {grp(<>
        <ToolbarBtn label="Bold (⌘B)" icon={EI.bold} onClick={() => cmd('bold')}/>
        <ToolbarBtn label="Italic (⌘I)" icon={EI.italic} onClick={() => cmd('italic')}/>
        <ToolbarBtn label="Strikethrough" icon={EI.strike} onClick={() => cmd('strikeThrough')}/>
        <ToolbarBtn label="Underline" icon={<span style={{fontSize:11,fontWeight:700,textDecoration:'underline'}}>U</span>} onClick={() => cmd('underline')}/>
      </>)}
      {grp(<>
        <ToolbarBtn label="Bullet list" icon={EI.ul} onClick={() => cmd('insertUnorderedList')}/>
        <ToolbarBtn label="Numbered list" icon={EI.ol} onClick={() => cmd('insertOrderedList')}/>
        <ToolbarBtn label="Todo list" icon={EI.todo} onClick={() => onInsert && onInsert('todo')}/>
        <ToolbarBtn label="Quote" icon={EI.quote} onClick={() => onInsert && onInsert('quote')}/>
      </>)}
      {grp(<>
        <ToolbarBtn label="Link" icon={EI.link} onClick={() => { const u = prompt('URL:'); if (u) cmd('createLink', u); }}/>
        <ToolbarBtn label="Image" icon={EI.image} onClick={() => onInsert && onInsert('image')}/>
        <ToolbarBtn label="Table" icon={EI.table} onClick={() => onInsert && onInsert('table')}/>
        <ToolbarBtn label="Divider" icon={EI.divider} onClick={() => onInsert && onInsert('divider')}/>
        <ToolbarBtn label="Code block" icon={EI.code} onClick={() => onInsert && onInsert('code')}/>
      </>)}
      {grp(<>
        <ToolbarBtn label="Mention (@)" icon={EI.mention} onClick={() => onInsert && onInsert('mention')}/>
        <ToolbarBtn label="Issue link (#)" icon={EI.task} onClick={() => onInsert && onInsert('issue')}/>
        <ToolbarBtn label="Callout" icon={EI.callout} onClick={() => onInsert && onInsert('callout')}/>
      </>)}
    </EBox>
  );
}

// ── Slash menu (visual mock) ────────────────────────────────────────────────
function SlashMenu({ x, y, onPick, onClose }) {
  const items = [
    { id: 'h1', icon: 'H1', label: 'Heading 1', desc: 'Velký nadpis sekce', kbd: '#' },
    { id: 'h2', icon: 'H2', label: 'Heading 2', desc: 'Středně velký nadpis', kbd: '##' },
    { id: 'h3', icon: 'H3', label: 'Heading 3', desc: 'Malý nadpis', kbd: '###' },
    { id: 'ul', icon: '•', label: 'Bullet list', desc: 'Odrážkový seznam', kbd: '-' },
    { id: 'todo', icon: '☐', label: 'Todo list', desc: 'Checklist s checkboxy', kbd: '[]' },
    { id: 'quote', icon: '"', label: 'Quote', desc: 'Citace', kbd: '>' },
    { id: 'image', icon: '🖼', label: 'Image', desc: 'Vložit obrázek', kbd: 'paste' },
    { id: 'code', icon: '<>', label: 'Code block', desc: 'Code s syntax highlightem', kbd: '```' },
    { id: 'table', icon: '⊞', label: 'Table', desc: 'Tabulka', kbd: '/table' },
    { id: 'callout', icon: 'ℹ', label: 'Callout', desc: 'Info / warning blok' },
    { id: 'mention', icon: '@', label: 'Mention', desc: 'Zmínit uživatele' },
    { id: 'issue', icon: '#', label: 'Issue link', desc: 'Odkaz na jiný task' },
  ];
  const [sel, setSel] = eUse(0);

  return (
    <EBox sx={{ position: 'absolute', left: x, top: y, zIndex: 10, width: 280,
      bgcolor: 'background.paper', borderRadius: 1.5,
      boxShadow: 6, border: 1, borderColor: 'divider',
      maxHeight: 320, overflowY: 'auto', py: 0.5 }}>
      <EBox sx={{ px: 1.25, py: 0.75, borderBottom: 1, borderColor: 'divider',
        display: 'flex', alignItems: 'center', gap: 1 }}>
        <ETypography sx={{ fontSize: 11, color: 'text.secondary', fontFamily: 'ui-monospace, monospace' }}>/</ETypography>
        <ETypography sx={{ fontSize: 12, color: 'text.disabled' }}>vybrat blok…</ETypography>
      </EBox>
      {items.map((it, i) => (
        <EBox key={it.id} onClick={() => onPick(it.id)} onMouseEnter={() => setSel(i)}
          sx={{ px: 1.25, py: 0.75, display: 'flex', alignItems: 'center', gap: 1,
            cursor: 'default', bgcolor: sel === i ? 'action.selected' : 'transparent' }}>
          <EBox sx={{ width: 26, height: 26, borderRadius: 0.8, bgcolor: 'action.hover',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{it.icon}</EBox>
          <EBox sx={{ flex: 1, minWidth: 0 }}>
            <ETypography sx={{ fontSize: 12.5, fontWeight: 600 }}>{it.label}</ETypography>
            <ETypography sx={{ fontSize: 11, color: 'text.secondary' }}>{it.desc}</ETypography>
          </EBox>
          {it.kbd && (
            <ETypography sx={{ fontSize: 10.5, color: 'text.disabled', fontFamily: 'ui-monospace, monospace',
              bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5 }}>{it.kbd}</ETypography>
          )}
        </EBox>
      ))}
    </EBox>
  );
}

// ── Block renderers ─────────────────────────────────────────────────────────
function richBlocks() { return window.FLUX_RICH_DESC_1; }

function RenderBlocks({ blocks, allowEdit = true }) {
  return (
    <EBox sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, '& p': { m: 0 } }}>
      {blocks.map((b, i) => <RenderBlock key={i} block={b}/>)}
    </EBox>
  );
}

function RenderBlock({ block: b }) {
  if (b.type === 'h2') return <ETypography variant="h5" sx={{ fontSize: 17, fontWeight: 700, mt: 0.5 }}>{b.text}</ETypography>;
  if (b.type === 'h3') return <ETypography variant="h6" sx={{ fontSize: 14.5, fontWeight: 700, mt: 0.5 }}>{b.text}</ETypography>;
  if (b.type === 'p')  return <ETypography sx={{ fontSize: 13.5, lineHeight: 1.6 }}>{renderInline(b.text)}</ETypography>;
  if (b.type === 'ul') return (
    <EBox component="ul" sx={{ m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
      {b.items.map((it, i) => <EBox component="li" key={i} sx={{ fontSize: 13.5, lineHeight: 1.55 }}>{renderInline(it)}</EBox>)}
    </EBox>
  );
  if (b.type === 'callout') {
    const tone = { info: '#0ea5e9', warn: '#f59e0b', error: '#ef4444' }[b.tone || 'info'];
    return (
      <EBox sx={{ display: 'flex', gap: 1, p: 1.25, borderRadius: 1.2,
        bgcolor: eAlpha(tone, 0.08), border: 1, borderColor: eAlpha(tone, 0.25) }}>
        <EBox sx={{ color: tone, fontSize: 14, fontWeight: 700 }}>ℹ</EBox>
        <ETypography sx={{ fontSize: 13, lineHeight: 1.55 }}>{b.text}</ETypography>
      </EBox>
    );
  }
  if (b.type === 'code') {
    const lines = b.text.split('\n');
    return (
      <EBox sx={{ borderRadius: 1.2, overflow: 'hidden', border: 1, borderColor: 'divider',
        bgcolor: 'mode' === 'dark' ? '#0a0c11' : '#f6f7f9', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>
        <EBox sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 1.25, py: 0.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
          <ETypography sx={{ fontSize: 10.5, fontWeight: 600, color: 'text.secondary' }}>{b.lang || 'text'}</ETypography>
          <ETypography sx={{ fontSize: 10.5, color: 'text.disabled', cursor: 'default' }}>Copy</ETypography>
        </EBox>
        <EBox sx={{ p: 1.25, fontSize: 12, lineHeight: 1.55, overflowX: 'auto', whiteSpace: 'pre' }}>
          {lines.map((l, i) => (
            <EBox key={i} sx={{ display: 'flex' }}>
              <EBox sx={{ width: 22, color: 'text.disabled', userSelect: 'none', pr: 1, textAlign: 'right' }}>{i + 1}</EBox>
              <EBox sx={{ flex: 1 }}>{highlightTsx(l)}</EBox>
            </EBox>
          ))}
        </EBox>
      </EBox>
    );
  }
  return null;
}

// Tiny tsx/js syntax tinter
function highlightTsx(line) {
  const KW = /\b(const|let|var|function|return|if|else|import|from|export|default|new|class|interface|type|extends|implements|async|await)\b/g;
  const STR = /(['"`])(?:\\.|(?!\1).)*\1/g;
  const NUM = /\b\d+(\.\d+)?\b/g;
  const COM = /\/\/.*$/g;
  const FN = /(\w+)(?=\()/g;

  // Build mark array
  const marks = [];
  const push = (re, cls) => {
    let m; const r = new RegExp(re.source, re.flags);
    while ((m = r.exec(line)) !== null) marks.push({ start: m.index, end: m.index + m[0].length, cls, text: m[0] });
  };
  push(COM, 'com'); push(STR, 'str'); push(KW, 'kw'); push(NUM, 'num'); push(FN, 'fn');
  marks.sort((a,b) => a.start - b.start);
  // resolve overlaps (keep first)
  const out = []; let last = 0;
  for (const m of marks) {
    if (m.start < last) continue;
    if (m.start > last) out.push({ text: line.slice(last, m.start) });
    out.push(m); last = m.end;
  }
  if (last < line.length) out.push({ text: line.slice(last) });
  const colors = { kw: '#a855f7', str: '#10b981', num: '#f59e0b', com: '#94a3b8', fn: '#0ea5e9' };
  return <>{out.map((p, i) => p.cls
    ? <span key={i} style={{ color: colors[p.cls], fontStyle: p.cls === 'com' ? 'italic' : 'normal' }}>{p.text}</span>
    : <span key={i}>{p.text}</span>
  )}</>;
}

function renderInline(text) {
  // Highlight @mentions and #TASK-xx
  const re = /(@\w+|#[A-Z]+-\d+)/g;
  const parts = []; let last = 0; let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('@')) {
      parts.push(<EBox key={m.index} component="span" sx={{ color: 'primary.main', fontWeight: 600,
        bgcolor: eAlpha('#5A5BFF', 0.1), px: 0.5, borderRadius: 0.5 }}>{tok}</EBox>);
    } else {
      parts.push(<EBox key={m.index} component="span" sx={{ color: 'info.main', fontWeight: 600,
        fontFamily: 'ui-monospace, monospace', bgcolor: eAlpha('#0ea5e9', 0.1), px: 0.5, borderRadius: 0.5 }}>{tok}</EBox>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ── Convert blocks to HTML for contentEditable ─────────────────────────────
function blocksToHtml(blocks) {
  if (!blocks) return '';
  const inline = (s) => (s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(@\w+)/g, '<span class="flux-mention">$1</span>')
    .replace(/(#[A-Z]+-\d+)/g, '<span class="flux-issue">$1</span>');
  return blocks.map(b => {
    if (b.type === 'h2') return `<h2>${inline(b.text)}</h2>`;
    if (b.type === 'h3') return `<h3>${inline(b.text)}</h3>`;
    if (b.type === 'p')  return `<p>${inline(b.text)}</p>`;
    if (b.type === 'ul') return `<ul>${b.items.map(i => `<li>${inline(i)}</li>`).join('')}</ul>`;
    if (b.type === 'callout') {
      return `<div class="flux-callout" data-tone="${b.tone||'info'}"><span class="flux-callout-icon">ℹ</span><div>${inline(b.text)}</div></div>`;
    }
    if (b.type === 'code') {
      const esc = (b.text||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<pre class="flux-code" data-lang="${b.lang||'text'}"><code>${esc}</code></pre>`;
    }
    return '';
  }).join('');
}

// ── Editor surface (real contentEditable, with edit toggle) ────────────────
function RichEditor({ blocks, editable: initialEditable = false, autoFocus = false,
                     placeholder = 'Napiš popis…', onSave, onCancel,
                     showToggle = true, compact = false }) {
  const [editing, setEditing] = eUse(initialEditable);
  const [showSlash, setShowSlash] = eUse(false);
  const [slashPos, setSlashPos] = eUse({ x: 16, y: 40 });
  const ref = eRef(null);
  const initialHtml = eRef(blocksToHtml(blocks));

  eEff(() => {
    if (editing && ref.current) {
      if (autoFocus) {
        ref.current.focus();
        // place caret at end
        const r = document.createRange();
        r.selectNodeContents(ref.current);
        r.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges(); sel.addRange(r);
      }
    }
  }, [editing]);

  const exec = (cmd, val = null) => {
    if (ref.current) ref.current.focus();
    document.execCommand(cmd, false, val);
  };

  const insertHtml = (html) => {
    if (ref.current) ref.current.focus();
    document.execCommand('insertHTML', false, html);
  };

  const onKey = (e) => {
    // Shortcuts
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') { e.preventDefault(); exec('bold'); }
    else if ((e.metaKey || e.ctrlKey) && e.key === 'i') { e.preventDefault(); exec('italic'); }
    else if (e.key === '/') {
      // Show slash menu near caret on next tick (after the / is inserted)
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;
        const r = sel.getRangeAt(0).getBoundingClientRect();
        const wrap = ref.current.getBoundingClientRect();
        setSlashPos({ x: r.left - wrap.left, y: r.bottom - wrap.top + 4 });
        setShowSlash(true);
      }, 0);
    } else if (e.key === 'Escape') {
      setShowSlash(false);
    }
  };

  const handlePaste = (e) => {
    // Image paste → insert as data URL preview
    const items = e.clipboardData?.items || [];
    for (const it of items) {
      if (it.type && it.type.startsWith('image/')) {
        e.preventDefault();
        const file = it.getAsFile();
        const reader = new FileReader();
        reader.onload = (ev) => {
          insertHtml(`<img class="flux-img" src="${ev.target.result}" alt="" />`);
        };
        reader.readAsDataURL(file);
        return;
      }
    }
    // Plain text fallback so we don't pull in styled HTML
    const text = e.clipboardData?.getData('text/plain');
    if (text != null) {
      e.preventDefault();
      document.execCommand('insertText', false, text);
    }
  };

  const handleDrop = (e) => {
    const f = e.dataTransfer?.files?.[0];
    if (f && f.type.startsWith('image/')) {
      e.preventDefault();
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ref.current) ref.current.focus();
        insertHtml(`<img class="flux-img" src="${ev.target.result}" alt="" />`);
      };
      reader.readAsDataURL(f);
    }
  };

  const pickSlash = (id) => {
    setShowSlash(false);
    if (!ref.current) return;
    ref.current.focus();
    // Remove the trailing "/" the user typed
    const sel = window.getSelection();
    if (sel.rangeCount) {
      const r = sel.getRangeAt(0);
      const node = r.startContainer;
      if (node.nodeType === Node.TEXT_NODE && r.startOffset > 0 && node.textContent[r.startOffset-1] === '/') {
        const range = document.createRange();
        range.setStart(node, r.startOffset - 1);
        range.setEnd(node, r.startOffset);
        range.deleteContents();
      }
    }
    if (id === 'h1' || id === 'h2') exec('formatBlock', '<h2>');
    else if (id === 'h3') exec('formatBlock', '<h3>');
    else if (id === 'ul') exec('insertUnorderedList');
    else if (id === 'todo') insertHtml('<div class="flux-todo"><input type="checkbox"/>&nbsp;Todo položka</div><p></p>');
    else if (id === 'quote') exec('formatBlock', '<blockquote>');
    else if (id === 'image') {
      const url = prompt('URL obrázku (nebo zruš a použij paste/drag):');
      if (url) insertHtml(`<img class="flux-img" src="${url}" alt="" />`);
    }
    else if (id === 'code') insertHtml('<pre class="flux-code" data-lang="text"><code>// code…</code></pre><p></p>');
    else if (id === 'table') insertHtml('<table class="flux-table"><tbody><tr><th>Sloupec A</th><th>Sloupec B</th></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table><p></p>');
    else if (id === 'callout') insertHtml('<div class="flux-callout" data-tone="info"><span class="flux-callout-icon">ℹ</span><div>Důležitá poznámka…</div></div><p></p>');
    else if (id === 'mention') insertHtml('<span class="flux-mention">@JN</span>&nbsp;');
    else if (id === 'issue') insertHtml('<span class="flux-issue">#WEB-148</span>&nbsp;');
    else if (id === 'divider') insertHtml('<hr class="flux-hr"/>');
  };

  const save = () => {
    if (onSave && ref.current) onSave(ref.current.innerHTML);
    setEditing(false);
  };
  const cancel = () => {
    if (ref.current) ref.current.innerHTML = initialHtml.current;
    setEditing(false);
    if (onCancel) onCancel();
  };

  // Read-only view
  if (!editing) {
    return (
      <EBox sx={{ position: 'relative', '&:hover .flux-edit-pencil': { opacity: 1 } }}>
        <EBox sx={{ p: compact ? 0 : 0, '& *': { color: 'inherit' } }}>
          <RenderBlocks blocks={blocks}/>
        </EBox>
        {showToggle && (
          <ETooltip title="Upravit">
            <EBox className="flux-edit-pencil"
              onClick={() => setEditing(true)}
              sx={{ position: 'absolute', top: 0, right: 0,
                width: 26, height: 26, borderRadius: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'background.paper', border: 1, borderColor: 'divider',
                color: 'text.secondary', cursor: 'default',
                opacity: 0, transition: 'opacity 0.15s',
                '&:hover': { color: 'primary.main', borderColor: 'primary.main' } }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m11 2 3 3-9 9H2v-3z"/><path d="m9 4 3 3"/>
              </svg>
            </EBox>
          </ETooltip>
        )}
      </EBox>
    );
  }

  // Editable
  return (
    <EBox sx={{ border: 1, borderColor: 'primary.main', borderRadius: 1.5,
                bgcolor: 'background.paper', position: 'relative',
                boxShadow: '0 0 0 3px ' + eAlpha('#5A5BFF', 0.12) }}>
      <EditorToolbar onInsert={(id) => pickSlash(id)} onCmd={exec}/>
      <EBox sx={{ position: 'relative' }}>
        <EBox
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onKeyDown={onKey}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          dangerouslySetInnerHTML={{ __html: initialHtml.current }}
          sx={{
            p: 2, fontSize: 13.5, lineHeight: 1.6, minHeight: compact ? 80 : 160,
            outline: 'none',
            '& h2': { fontSize: 17, fontWeight: 700, m: '8px 0 4px', letterSpacing: '-0.01em' },
            '& h3': { fontSize: 14.5, fontWeight: 700, m: '6px 0 2px', letterSpacing: '-0.005em' },
            '& p':  { m: '4px 0' },
            '& ul, & ol': { pl: 3, m: '4px 0' },
            '& li': { mb: 0.25 },
            '& blockquote': { borderLeft: 3, borderColor: 'primary.main',
              pl: 1.5, ml: 0, color: 'text.secondary', fontStyle: 'italic' },
            '& code': { fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5, fontSize: 12 },
            '& pre.flux-code': { bgcolor: 'action.hover', p: 1.5, borderRadius: 1,
              border: 1, borderColor: 'divider', overflowX: 'auto',
              fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 12,
              lineHeight: 1.55, m: '8px 0' },
            '& pre.flux-code code': { bgcolor: 'transparent', p: 0, fontSize: 'inherit' },
            '& .flux-mention': { color: 'primary.main', fontWeight: 600,
              bgcolor: eAlpha('#5A5BFF', 0.12), px: 0.5, borderRadius: 0.5 },
            '& .flux-issue': { color: 'info.main', fontWeight: 600,
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              bgcolor: eAlpha('#0ea5e9', 0.12), px: 0.5, borderRadius: 0.5 },
            '& .flux-callout': { display: 'flex', gap: 1.25, p: 1.25,
              borderRadius: 1, bgcolor: eAlpha('#0ea5e9', 0.08),
              border: 1, borderColor: eAlpha('#0ea5e9', 0.25), m: '8px 0' },
            '& .flux-callout-icon': { color: '#0ea5e9', fontWeight: 700 },
            '& .flux-img': { maxWidth: '100%', borderRadius: 1, my: 1,
              border: 1, borderColor: 'divider' },
            '& .flux-hr': { border: 0, borderTop: 1, borderColor: 'divider', m: '12px 0' },
            '& .flux-todo': { display: 'flex', alignItems: 'center', gap: 1, m: '4px 0' },
            '& .flux-table': { borderCollapse: 'collapse', m: '8px 0', width: '100%' },
            '& .flux-table th, & .flux-table td': { border: 1, borderColor: 'divider',
              p: 0.75, fontSize: 12.5, textAlign: 'left' },
            '& .flux-table th': { bgcolor: 'action.hover', fontWeight: 600 },
            '&:empty:before': { content: `"${placeholder}"`, color: 'text.disabled' },
          }}
        />
        {showSlash && (
          <SlashMenu x={slashPos.x} y={slashPos.y}
                     onPick={pickSlash} onClose={() => setShowSlash(false)}/>
        )}
      </EBox>
      <EBox sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1,
        borderTop: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
        <ETypography sx={{ fontSize: 11, color: 'text.disabled' }}>
          Tip: <kbd style={{ padding: '1px 4px', border: '1px solid', borderRadius: 3, fontSize: 10 }}>/</kbd> pro slash menu · paste / drag obrázek · ⌘B / ⌘I
        </ETypography>
        <EBox sx={{ flex: 1 }}/>
        <EButton size="small" onClick={cancel}>Zrušit</EButton>
        <EButton size="small" variant="contained" onClick={save}>Uložit</EButton>
      </EBox>
    </EBox>
  );
}

Object.assign(window, { RichEditor, RenderBlocks, EditorToolbar, SlashMenu, blocksToHtml });
