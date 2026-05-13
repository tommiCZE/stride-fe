import { useEffect, useState } from 'react';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

/**
 * Global keyboard shortcuts for the app shell.
 * - `?` opens the keyboard help dialog (unless focus is in an editable field)
 * - `Cmd/Ctrl+K` opens the global command palette (works even from inputs)
 * - `Escape` closes whichever overlay is open
 *
 * `e.key === '?'` is layout-agnostic — the browser reports the resulting
 * character regardless of which physical key/modifier produces it.
 */
export function useKeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K — toggles command palette, intentionally works in inputs too.
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
        return;
      }

      if (e.key === 'Escape') {
        if (paletteOpen) {
          setPaletteOpen(false);
          return;
        }
        if (open) setOpen(false);
        return;
      }

      if (e.key === '?') {
        if (isEditableTarget(e.target)) return;
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, paletteOpen]);

  return { open, setOpen, paletteOpen, setPaletteOpen };
}
