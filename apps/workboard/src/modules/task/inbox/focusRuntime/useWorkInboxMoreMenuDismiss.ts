import { useCallback, useEffect, useRef } from 'react';

function hasBlockingDialog(): boolean {
  return document.querySelector('.work-inbox-dialog-backdrop') != null;
}

/**
 * Closes the focus "Thao tác khác" menu on ESC and click-outside.
 * ESC is skipped when a work-inbox modal backdrop is present.
 */
export function useWorkInboxMoreMenuDismiss(options: {
  open: boolean;
  onClose: () => void;
}) {
  const { open, onClose } = options;
  const anchorRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const closeMenu = useCallback(
    (returnFocus = true) => {
      onClose();
      if (returnFocus) {
        requestAnimationFrame(() => anchorRef.current?.focus());
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (hasBlockingDialog()) return;
      e.preventDefault();
      e.stopPropagation();
      closeMenu(true);
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      closeMenu(false);
    };

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [open, closeMenu]);

  return { anchorRef, menuRef, closeMenu };
}
