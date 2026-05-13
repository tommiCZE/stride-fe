import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

export interface PasteImageOptions {
  /** Returns a permanent URL for the uploaded image. */
  onUpload: (file: File) => Promise<string>;
  /** Optional error callback. If omitted, a `stride-upload-error` CustomEvent is dispatched on window. */
  onError?: (error: Error, file: File) => void;
}

const pasteImagePluginKey = new PluginKey('strideePasteImage');

/**
 * Inline SVG data URI used as a placeholder while the upload is in flight.
 * Encoded as `data:image/svg+xml;utf8,...` so we can later find and replace it
 * by an exact-string `src` match on the image node.
 *
 * The placeholder src includes a unique token so concurrent uploads do not
 * collide with each other.
 */
function buildPlaceholderSrc(token: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 240 160">` +
    `<rect width="240" height="160" rx="8" fill="#f1f5f9"/>` +
    `<g transform="translate(120 80)">` +
    `<circle r="14" fill="none" stroke="#94a3b8" stroke-width="3" stroke-dasharray="22 22" opacity="0.9">` +
    `<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1s" repeatCount="indefinite"/>` +
    `</circle>` +
    `</g>` +
    `<text x="120" y="130" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#64748b">` +
    `Nahrávám…</text>` +
    `<!-- token:${token} -->` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

function reportError(options: PasteImageOptions, error: Error, file: File): void {
  if (options.onError) {
    options.onError(error, file);
    return;
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('stride-upload-error', {
        detail: { error, file },
      }),
    );
  }
}

/**
 * Replace the placeholder image node (matched by its `src` attribute) with
 * the final upload URL. If the placeholder is no longer present (user undid
 * the paste, etc.), this is a no-op.
 */
function replacePlaceholder(view: EditorView, placeholderSrc: string, finalSrc: string): void {
  const { state } = view;
  let pos: number | null = null;
  state.doc.descendants((node, p) => {
    if (pos !== null) return false;
    if (node.type.name === 'image' && node.attrs.src === placeholderSrc) {
      pos = p;
      return false;
    }
    return true;
  });

  if (pos === null) return;

  const imageType = state.schema.nodes['image'];
  if (!imageType) return;

  const node = state.doc.nodeAt(pos);
  if (!node) return;

  const tr = state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: finalSrc });
  view.dispatch(tr);
}

/**
 * Remove the placeholder image when the upload fails so the editor doesn't
 * leave a stale loader inside the document.
 */
function removePlaceholder(view: EditorView, placeholderSrc: string): void {
  const { state } = view;
  let from: number | null = null;
  let to: number | null = null;
  state.doc.descendants((node, p) => {
    if (from !== null) return false;
    if (node.type.name === 'image' && node.attrs.src === placeholderSrc) {
      from = p;
      to = p + node.nodeSize;
      return false;
    }
    return true;
  });
  if (from === null || to === null) return;
  view.dispatch(state.tr.delete(from, to));
}

/**
 * Insert a placeholder image at the given doc position and kick off the
 * upload. On success, swap the placeholder src with the final URL; on
 * failure, delete the placeholder and surface the error.
 */
function insertPlaceholderAndUpload(
  view: EditorView,
  pos: number,
  file: File,
  options: PasteImageOptions,
): void {
  const imageType = view.state.schema.nodes['image'];
  if (!imageType) return;

  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const placeholderSrc = buildPlaceholderSrc(token);

  const node = imageType.create({ src: placeholderSrc, alt: file.name });
  view.dispatch(view.state.tr.insert(pos, node));

  options
    .onUpload(file)
    .then(url => {
      replacePlaceholder(view, placeholderSrc, url);
    })
    .catch((err: unknown) => {
      removePlaceholder(view, placeholderSrc);
      const error = err instanceof Error ? err : new Error('Image upload failed');
      reportError(options, error, file);
    });
}

export const PasteImage = Extension.create<PasteImageOptions>({
  name: 'strideePasteImage',

  addOptions() {
    return {
      onUpload: async () => {
        throw new Error('PasteImage: onUpload not configured');
      },
      onError: undefined,
    };
  },

  addProseMirrorPlugins() {
    const options = this.options;

    return [
      new Plugin({
        key: pasteImagePluginKey,
        props: {
          handlePaste(view, event) {
            const files = Array.from(event.clipboardData?.files ?? []).filter(isImageFile);
            if (files.length === 0) return false;

            event.preventDefault();

            const insertPos = view.state.selection.from;
            files.forEach((file, idx) => {
              // Each subsequent placeholder is inserted just after the previous one.
              insertPlaceholderAndUpload(view, insertPos + idx, file, options);
            });
            return true;
          },

          handleDrop(view, event, _slice, moved) {
            if (moved) return false;

            const files = Array.from(event.dataTransfer?.files ?? []).filter(isImageFile);
            if (files.length === 0) return false;

            event.preventDefault();

            const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
            const insertPos = coords ? coords.pos : view.state.selection.from;

            files.forEach((file, idx) => {
              insertPlaceholderAndUpload(view, insertPos + idx, file, options);
            });
            return true;
          },
        },
      }),
    ];
  },
});

export default PasteImage;
