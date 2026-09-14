/**
 * Tests for useModals Hook
 */

import { renderHook, act } from '@testing-library/react';
import { useModals } from './useModals';

describe('useModals', () => {
  it('starts with no active modal', () => {
    const { result } = renderHook(() => useModals());
    expect(result.current.activeModal).toBeNull();
    expect(result.current.isOpen('about')).toBe(false);
    expect(result.current.profilePickerForced).toBe(false);
  });

  it('opens a modal and reports it via isOpen', () => {
    const { result } = renderHook(() => useModals());
    act(() => result.current.open('personalize'));
    expect(result.current.activeModal).toBe('personalize');
    expect(result.current.isOpen('personalize')).toBe(true);
    expect(result.current.isOpen('about')).toBe(false);
  });

  it('opening a second modal replaces the first (single-slot union)', () => {
    const { result } = renderHook(() => useModals());
    act(() => result.current.open('about'));
    act(() => result.current.open('badges'));
    expect(result.current.activeModal).toBe('badges');
    expect(result.current.isOpen('about')).toBe(false);
  });

  it('close(name) only clears the state if that modal is the active one', () => {
    const { result } = renderHook(() => useModals());
    act(() => result.current.open('lernreise'));
    act(() => result.current.close('about')); // not the active modal
    expect(result.current.activeModal).toBe('lernreise');
    act(() => result.current.close('lernreise'));
    expect(result.current.activeModal).toBeNull();
  });

  it('openProfilePickerForced sets both activeModal and the forced flag', () => {
    const { result } = renderHook(() => useModals());
    act(() => result.current.openProfilePickerForced());
    expect(result.current.activeModal).toBe('profilePicker');
    expect(result.current.profilePickerForced).toBe(true);
  });

  it('closeProfilePicker clears the forced flag and the active modal', () => {
    const { result } = renderHook(() => useModals());
    act(() => result.current.openProfilePickerForced());
    act(() => result.current.closeProfilePicker());
    expect(result.current.activeModal).toBeNull();
    expect(result.current.profilePickerForced).toBe(false);
  });

  it('closeProfilePicker leaves an unrelated active modal untouched', () => {
    const { result } = renderHook(() => useModals());
    act(() => result.current.open('badges'));
    act(() => result.current.closeProfilePicker());
    expect(result.current.activeModal).toBe('badges');
  });
});
