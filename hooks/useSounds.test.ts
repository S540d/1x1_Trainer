import { renderHook, act } from '@testing-library/react';
import { Platform } from 'react-native';
import { createAudioPlayer } from 'expo-audio';
import { useSounds } from './useSounds';

// expo-audio is mocked via __mocks__/expo-audio.js
const mockCreateAudioPlayer = createAudioPlayer as jest.Mock;

function setPlatform(os: string) {
  Object.defineProperty(Platform, 'OS', { value: os, configurable: true });
}

describe('useSounds – web platform', () => {
  let AudioContextMock: jest.Mock;
  let mockCtx: {
    currentTime: number;
    createOscillator: jest.Mock;
    createGain: jest.Mock;
    destination: object;
    close: jest.Mock;
  };

  beforeEach(() => {
    setPlatform('web');
    const mockOsc = { connect: jest.fn(), frequency: { value: 0 }, type: '' as OscillatorType, start: jest.fn(), stop: jest.fn() };
    const mockGain = { connect: jest.fn(), gain: { setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() } };
    mockCtx = { currentTime: 0, createOscillator: jest.fn(() => mockOsc), createGain: jest.fn(() => mockGain), destination: {}, close: jest.fn().mockResolvedValue(undefined) };
    AudioContextMock = jest.fn(() => mockCtx);
    Object.defineProperty(window, 'AudioContext', { value: AudioContextMock, configurable: true, writable: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not load native sounds on web', () => {
    renderHook(() => useSounds(true, 80));
    expect(mockCreateAudioPlayer).not.toHaveBeenCalled();
  });

  it('creates AudioContext when playSound is called with sound enabled', () => {
    const { result } = renderHook(() => useSounds(true, 80));
    act(() => { result.current.playSound('correct'); });
    expect(AudioContextMock).toHaveBeenCalled();
  });

  it('skips AudioContext when volume is 0', () => {
    const { result } = renderHook(() => useSounds(true, 0));
    act(() => { result.current.playSound('correct'); });
    expect(AudioContextMock).not.toHaveBeenCalled();
  });

  it('does nothing when soundEnabled is false', () => {
    const { result } = renderHook(() => useSounds(false, 80));
    act(() => { result.current.playSound('correct'); });
    expect(AudioContextMock).not.toHaveBeenCalled();
  });

  it('reflects updated soundEnabled after rerender', () => {
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useSounds(enabled, 80),
      { initialProps: { enabled: false } }
    );
    act(() => { result.current.playSound('correct'); });
    expect(AudioContextMock).not.toHaveBeenCalled();

    rerender({ enabled: true });
    act(() => { result.current.playSound('correct'); });
    expect(AudioContextMock).toHaveBeenCalledTimes(1);
  });

  it('stops playing after soundEnabled changes from true to false', () => {
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useSounds(enabled, 80),
      { initialProps: { enabled: true } }
    );
    act(() => { result.current.playSound('correct'); });
    expect(AudioContextMock).toHaveBeenCalledTimes(1);

    rerender({ enabled: false });
    act(() => { result.current.playSound('correct'); });
    expect(AudioContextMock).toHaveBeenCalledTimes(1); // no additional call
  });
});

type MockPlayer = { play: jest.Mock; pause: jest.Mock; seekTo: jest.Mock; remove: jest.Mock; volume: number };

describe('useSounds – native platform', () => {
  beforeEach(() => {
    setPlatform('ios');
    // The hook loads sounds in the order: correct, incorrect, perfect, level_up, badge_unlock.
    // Each createAudioPlayer call returns its own player instance.
    mockCreateAudioPlayer.mockImplementation(() => ({
      play: jest.fn(),
      pause: jest.fn(),
      seekTo: jest.fn(),
      remove: jest.fn(),
      volume: 1,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const playerAt = (idx: number): MockPlayer => mockCreateAudioPlayer.mock.results[idx].value as MockPlayer;

  it('loads sounds on mount', () => {
    renderHook(() => useSounds(true, 80));
    expect(mockCreateAudioPlayer).toHaveBeenCalledTimes(5);
  });

  it('plays sound with correct volume when enabled', () => {
    const { result } = renderHook(() => useSounds(true, 80));
    act(() => { result.current.playSound('correct'); });
    const player = playerAt(0); // 'correct' is the first loaded asset
    expect(player.volume).toBe(0.8);
    expect(player.seekTo).toHaveBeenCalledWith(0);
    expect(player.play).toHaveBeenCalled();
  });

  it('does nothing when soundEnabled is false', () => {
    const { result } = renderHook(() => useSounds(false, 80));
    act(() => { result.current.playSound('correct'); });
    expect(playerAt(0).play).not.toHaveBeenCalled();
  });

  it('removes all players on unmount', () => {
    const { unmount } = renderHook(() => useSounds(true, 80));
    const players = mockCreateAudioPlayer.mock.results.map((r) => r.value as MockPlayer);
    unmount();
    for (const p of players) {
      expect(p.remove).toHaveBeenCalled();
    }
  });

  it('pauses all native players when soundEnabled changes to false', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useSounds(enabled, 80),
      { initialProps: { enabled: true } }
    );
    const players = mockCreateAudioPlayer.mock.results.map((r) => r.value as MockPlayer);

    act(() => { rerender({ enabled: false }); });

    for (const p of players) {
      expect(p.pause).toHaveBeenCalled();
    }
  });
});
