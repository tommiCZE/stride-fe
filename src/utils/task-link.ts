import type { MouseEvent, ElementType } from 'react';
import { Link } from 'react-router-dom';

export function taskLinkProps(key: string, openOverlay: (key: string) => void) {
  return {
    component: Link as ElementType,
    to: `/task/${key}`,
    draggable: false,
    onClick: (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      openOverlay(key);
    },
  };
}
