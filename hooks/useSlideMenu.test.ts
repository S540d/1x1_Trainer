/**
 * Tests for useSlideMenu Hook (Issue #357, Punkt 1)
 * Covers both paths: the animated one and the reduced-motion shortcut.
 */

import { renderHook, act } from '@testing-library/react';
import { useSlideMenu } from './useSlideMenu';
import { prefersReducedMotion } from '../utils/animations';

jest.mock('../utils/animations', () => ({
  ...jest.requireActual('../utils/animations'),
  prefersReducedMotion: jest.fn(),
}));

const mockPrefersReducedMotion = prefersReducedMotion as jest.MockedFunction<
  typeof prefersReducedMotion
>;

describe('useSlideMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrefersReducedMotion.mockReturnValue(false);
  });

  it('starts hidden', () => {
    const { result } = renderHook(() => useSlideMenu());
    expect(result.current.rendered).toBe(false);
  });

  it('mounts the panel on show()', () => {
    const { result } = renderHook(() => useSlideMenu());
    act(() => result.current.show());
    expect(result.current.rendered).toBe(true);
  });

  it('exposes an animated style with translateY and opacity', () => {
    const { result } = renderHook(() => useSlideMenu());
    expect(result.current.animatedStyle.transform).toHaveLength(1);
    expect(result.current.animatedStyle.opacity).toBeDefined();
  });

  describe('with reduced motion enabled', () => {
    beforeEach(() => mockPrefersReducedMotion.mockReturnValue(true));

    it('shows without animating', () => {
      const { result } = renderHook(() => useSlideMenu());
      act(() => result.current.show());
      expect(result.current.rendered).toBe(true);
    });

    it('unmounts synchronously on hide()', () => {
      const { result } = renderHook(() => useSlideMenu());
      act(() => result.current.show());
      act(() => result.current.hide());
      expect(result.current.rendered).toBe(false);
    });
  });

  describe('with animations enabled', () => {
    it('unmounts once the hide animation finishes', async () => {
      const { result } = renderHook(() => useSlideMenu());
      act(() => result.current.show());
      expect(result.current.rendered).toBe(true);

      act(() => result.current.hide());

      // The panel stays mounted until the animation callback fires.
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 400));
      });
      expect(result.current.rendered).toBe(false);
    });
  });
});
