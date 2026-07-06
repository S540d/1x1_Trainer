/**
 * useKeyboardInput Hook
 * Physical-keyboard support for the web build (#258): digits 0-9, Enter,
 * Backspace and Escape drive the game without clicking the on-screen numpad.
 * No-op on native platforms.
 */

import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export interface KeyboardInputHandlers {
  /** Master switch — pass false while any modal or menu is open. */
  enabled: boolean;
  /** Digit 0-9 typed. Only forwarded while digit input makes sense (caller decides). */
  onDigit: (digit: number) => void;
  /** Backspace: remove the last digit. */
  onBackspace: () => void;
  /** Escape: clear the current input. */
  onClear: () => void;
  /** Enter: check the answer, or advance to the next question once checked. */
  onSubmit: () => void;
}

export function useKeyboardInput(handlers: KeyboardInputHandlers): void {
  // Ref keeps the listener stable while always seeing the latest handlers/state
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return; // platform-safe

    const onKeyDown = (event: KeyboardEvent) => {
      const h = handlersRef.current;
      if (!h.enabled) return;
      // Don't steal keystrokes from real form fields (e.g. profile name input)
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (event.key >= '0' && event.key <= '9') {
        h.onDigit(parseInt(event.key, 10));
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        h.onBackspace();
      } else if (event.key === 'Escape') {
        h.onClear();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        h.onSubmit();
      }
    };

    window.addEventListener('keydown', onKeyDown); // platform-safe
    return () => window.removeEventListener('keydown', onKeyDown); // platform-safe
  }, []);
}
