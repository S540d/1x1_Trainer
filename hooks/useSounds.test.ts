import { renderHook, act } from '@testing-library/react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { useSounds } from './useSounds';

// expo-av is auto-mocked via __mocks__/expo-av.js
const mockCreateAsync = Audio.Sound.createAsync as jest.Mock;

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
    expect(mockCreateAsync).not.toHaveBeenCalled();
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
});

describe('useSounds – native platform', () => {
  let mockSoundInstance: { replayAsync: jest.Mock; setVolumeAsync: jest.Mock; unloadAsync: jest.Mock };

  beforeEach(() => {
    setPlatform('ios');
    mockSoundInstance = {
      replayAsync: jest.fn().mockResolvedValue({}),
      setVolumeAsync: jest.fn().mockResolvedValue({}),
      unloadAsync: jest.fn().mockResolvedValue({}),
    };
    mockCreateAsync.mockResolvedValue({ sound: mockSoundInstance });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loads sounds on mount', async () => {
    await act(async () => { renderHook(() => useSounds(true, 80)); });
    expect(mockCreateAsync).toHaveBeenCalledTimes(5);
  });

  it('plays sound with correct volume when enabled', async () => {
    const { result } = await act(async () => renderHook(() => useSounds(true, 80)));
    await act(async () => {
      result.current.playSound('correct');
      await Promise.resolve();
    });
    expect(mockSoundInstance.setVolumeAsync).toHaveBeenCalledWith(0.8);
    expect(mockSoundInstance.replayAsync).toHaveBeenCalled();
  });

  it('does nothing when soundEnabled is false', async () => {
    const { result } = await act(async () => renderHook(() => useSounds(false, 80)));
    act(() => { result.current.playSound('correct'); });
    expect(mockSoundInstance.replayAsync).not.toHaveBeenCalled();
  });

  it('unloads all sounds on unmount', async () => {
    const { unmount } = await act(async () => renderHook(() => useSounds(true, 80)));
    unmount();
    expect(mockSoundInstance.unloadAsync).toHaveBeenCalled();
  });
});
