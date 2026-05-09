import type { RichBlock } from '../../types';

export function blocksToHtml(blocks: RichBlock[] | string): string {
  if (typeof blocks === 'string') {
    return blocks.trimStart().startsWith('<') ? blocks : `<p>${blocks}</p>`;
  }
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return blocks.map(b => {
    if (b.type === 'h2') return `<h2>${b.text}</h2>`;
    if (b.type === 'h3') return `<h3>${b.text}</h3>`;
    if (b.type === 'p')  return `<p>${b.text}</p>`;
    if (b.type === 'ul') return `<ul>${b.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    if (b.type === 'callout') return `<div data-callout="true" data-tone="${b.tone}">${b.text}</div>`;
    if (b.type === 'code') return `<pre><code>${esc(b.text)}</code></pre>`;
    return '';
  }).join('');
}
