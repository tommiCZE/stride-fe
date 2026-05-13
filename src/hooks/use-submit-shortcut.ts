import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

/**
 * Returns a keyDown handler that triggers `onSubmit` on Cmd/Ctrl+Enter.
 * Attach to the root element of a form/dialog/comment composer.
 *
 * Example:
 *   <Dialog onKeyDown={useSubmitShortcut(handleSubmit(onSubmit))}>...</Dialog>
 */
export function useSubmitShortcut(onSubmit: () => void, enabled: boolean = true) {
  return (e: ReactKeyboardEvent | KeyboardEvent) => {
    if (!enabled) return;
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };
}
