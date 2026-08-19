import { useEffect, useRef } from 'react';

/**
 * The modal behaviour all three overlays were missing.
 *
 * They rendered as bare fixed-position divs: no dialog role, so a screen reader
 * kept announcing the page behind them; no focus move, so the keyboard caret
 * stayed on the trigger button in the background; and no Escape handler, despite
 * the in-app guide claiming Escape closes them. Only the model picker dropdown
 * ever handled Escape.
 *
 * Returns a ref to attach to the close button, which is where focus lands on
 * open. Focus returns to whatever was focused before, on close.
 *
 * `onClose` is held in a ref so the effect can run exactly once per mount. The
 * callers pass inline arrow functions, so depending on it directly would re-run
 * the effect on every parent render and yank focus back to the close button
 * mid-interaction.
 */
export const useDialog = (onClose: () => void) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      previouslyFocused?.focus?.();
    };
  }, []);

  return closeRef;
};
