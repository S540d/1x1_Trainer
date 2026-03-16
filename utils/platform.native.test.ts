/**
 * Tests for platform.ts - Non-Web (native) platform paths
 *
 * These tests mock Platform.OS as 'android' to cover branches
 * that are unreachable in the existing web-based tests:
 * - Storage (AsyncStorage paths)
 * - assertWebAPI (non-web error)
 * - safeWebAPI (non-web fallback)
 */

// Define __DEV__ global (set by React Native runtime, not available in Jest by default)
(global as any).__DEV__ = true;

// Mock Platform as android BEFORE imports
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
  },
}));

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: mockAsyncStorage,
}));

import {
  isWeb,
  isIOS,
  isAndroid,
  isMobile,
  supportsMatchMedia,
  getSystemDarkModePreference,
  addSystemThemeChangeListener,
  Storage,
  assertWebAPI,
  safeWebAPI,
} from './platform';

describe('platform.ts - Android Platform Detection', () => {
  it('should identify android platform', () => {
    expect(isWeb).toBe(false);
    expect(isAndroid).toBe(true);
    expect(isIOS).toBe(false);
    expect(isMobile).toBe(true);
  });
});

describe('platform.ts - matchMedia on non-web', () => {
  it('supportsMatchMedia should return false on android', () => {
    expect(supportsMatchMedia()).toBe(false);
  });

  it('getSystemDarkModePreference should return false on android', () => {
    expect(getSystemDarkModePreference()).toBe(false);
  });

  it('addSystemThemeChangeListener should return noop on android', () => {
    const callback = jest.fn();
    const cleanup = addSystemThemeChangeListener(callback);
    expect(typeof cleanup).toBe('function');
    cleanup();
    expect(callback).not.toHaveBeenCalled();
  });
});

describe('platform.ts - Storage (AsyncStorage paths)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getItem should use AsyncStorage on android', async () => {
    mockAsyncStorage.getItem.mockResolvedValue('test-value');

    const result = await Storage.getItem('test-key');

    expect(result).toBe('test-value');
    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('test-key');
  });

  it('setItem should use AsyncStorage on android', async () => {
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    await Storage.setItem('test-key', 'test-value');

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
  });

  it('removeItem should use AsyncStorage on android', async () => {
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);

    await Storage.removeItem('test-key');

    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('test-key');
  });
});

describe('platform.ts - assertWebAPI', () => {
  it('should throw error on non-web platform', () => {
    expect(() => assertWebAPI('localStorage')).toThrow(
      'Web API "localStorage" is not available on android'
    );
  });
});

describe('platform.ts - safeWebAPI', () => {
  it('should return fallback on non-web platform', () => {
    const result = safeWebAPI(() => 'web-value', 'fallback-value');
    expect(result).toBe('fallback-value');
  });

  it('should warn with apiName in dev mode', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const result = safeWebAPI(() => 'web-value', 'fallback-value', 'testAPI');

    expect(result).toBe('fallback-value');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Web API "testAPI" not available on android')
    );

    warnSpy.mockRestore();
  });

  it('should not warn without apiName', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    safeWebAPI(() => 'web-value', 'fallback-value');

    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
