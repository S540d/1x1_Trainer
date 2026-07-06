/**
 * Tests for useKeyboardInput Hook (#258)
 * Jest runs with Platform.OS === 'web' (react-native-web), so the listener
 * is active and can be driven with synthetic KeyboardEvents.
 */

import { renderHook } from '@testing-library/react';
import { useKeyboardInput, KeyboardInputHandlers } from './useKeyboardInput';

function pressKey(key: string, target?: EventTarget) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true });
  (target ?? window).dispatchEvent(event);
}

function makeHandlers(overrides: Partial<KeyboardInputHandlers> = {}): KeyboardInputHandlers {
  return {
    enabled: true,
    onDigit: jest.fn(),
    onBackspace: jest.fn(),
    onClear: jest.fn(),
    onSubmit: jest.fn(),
    ...overrides,
  };
}

describe('useKeyboardInput', () => {
  it('forwards digit keys 0-9', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardInput(handlers));

    pressKey('7');
    pressKey('0');

    expect(handlers.onDigit).toHaveBeenCalledTimes(2);
    expect(handlers.onDigit).toHaveBeenNthCalledWith(1, 7);
    expect(handlers.onDigit).toHaveBeenNthCalledWith(2, 0);
  });

  it('forwards Backspace, Escape and Enter', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardInput(handlers));

    pressKey('Backspace');
    pressKey('Escape');
    pressKey('Enter');

    expect(handlers.onBackspace).toHaveBeenCalledTimes(1);
    expect(handlers.onClear).toHaveBeenCalledTimes(1);
    expect(handlers.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('ignores unrelated keys', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardInput(handlers));

    pressKey('a');
    pressKey('ArrowUp');
    pressKey(' ');

    expect(handlers.onDigit).not.toHaveBeenCalled();
    expect(handlers.onBackspace).not.toHaveBeenCalled();
    expect(handlers.onClear).not.toHaveBeenCalled();
    expect(handlers.onSubmit).not.toHaveBeenCalled();
  });

  it('does nothing while disabled (e.g. a modal is open)', () => {
    const handlers = makeHandlers({ enabled: false });
    renderHook(() => useKeyboardInput(handlers));

    pressKey('5');
    pressKey('Enter');

    expect(handlers.onDigit).not.toHaveBeenCalled();
    expect(handlers.onSubmit).not.toHaveBeenCalled();
  });

  it('re-enables without re-registering when the enabled prop flips', () => {
    let handlers = makeHandlers({ enabled: false });
    const { rerender } = renderHook((props: KeyboardInputHandlers) => useKeyboardInput(props), {
      initialProps: handlers,
    });

    pressKey('5');
    expect(handlers.onDigit).not.toHaveBeenCalled();

    handlers = makeHandlers({ enabled: true });
    rerender(handlers);

    pressKey('5');
    expect(handlers.onDigit).toHaveBeenCalledWith(5);
  });

  it('does not steal keystrokes from text inputs', () => {
    const handlers = makeHandlers();
    renderHook(() => useKeyboardInput(handlers));

    const input = document.createElement('input');
    document.body.appendChild(input);
    pressKey('5', input);
    input.remove();

    expect(handlers.onDigit).not.toHaveBeenCalled();
  });

  it('removes the listener on unmount', () => {
    const handlers = makeHandlers();
    const { unmount } = renderHook(() => useKeyboardInput(handlers));

    unmount();
    pressKey('5');

    expect(handlers.onDigit).not.toHaveBeenCalled();
  });
});
