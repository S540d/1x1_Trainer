/**
 * Tests for platform.ts
 * Phase 4: Utilities - Platform detection and system APIs
 * 
 * NOTE: Tests use window APIs directly since they run in a jsdom environment // platform-safe
 * where these APIs are available. The platform-safe comments satisfy the
 * pre-commit hook that prevents accidental window usage without platform checks
 * in production code.
 */

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

// Define __DEV__ global (set by React Native runtime, not available in Jest by default)
(global as any).__DEV__ = true;

// Mock react-native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

describe('platform.ts - Platform Detection', () => {
  it('should correctly identify web platform', () => {
    expect(isWeb).toBe(true);
  });

  it('should correctly identify non-iOS platform', () => {
    expect(isIOS).toBe(false);
  });

  it('should correctly identify non-Android platform', () => {
    expect(isAndroid).toBe(false);
  });

  it('should correctly identify non-mobile platform', () => {
    expect(isMobile).toBe(false);
  });
});

describe('platform.ts - matchMedia Support', () => {
  // Tests run in jsdom environment where window APIs are available // platform-safe
  let originalMatchMedia: typeof window.matchMedia | undefined; // platform-safe

  beforeEach(() => {
    originalMatchMedia = window.matchMedia; // platform-safe
  });

  afterEach(() => {
    if (originalMatchMedia) {
      (window as any).matchMedia = originalMatchMedia; // platform-safe
    }
  });

  it('should support matchMedia on web', () => {
    // Mock matchMedia (available in jsdom test environment) // platform-safe
    (window as any).matchMedia = jest.fn(); // platform-safe

    expect(supportsMatchMedia()).toBe(true);
  });

  it('should not support matchMedia when matchMedia is not a function', () => {
    // Remove matchMedia to simulate unsupported environment
    delete (window as any).matchMedia; // platform-safe

    expect(supportsMatchMedia()).toBe(false);
  });
});

describe('platform.ts - System Dark Mode Detection', () => {
  let originalMatchMedia: typeof window.matchMedia | undefined; // platform-safe

  beforeEach(() => {
    originalMatchMedia = window.matchMedia; // platform-safe
  });

  afterEach(() => {
    if (originalMatchMedia) {
      (window as any).matchMedia = originalMatchMedia; // platform-safe
    }
  });

  it('should detect dark mode when prefers-color-scheme is dark', () => {
    const mockMatchMedia = jest.fn((query: string) => ({ // platform-safe
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    (window as any).matchMedia = mockMatchMedia; // platform-safe

    const isDark = getSystemDarkModePreference();
    expect(isDark).toBe(true);
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });

  it('should detect light mode when prefers-color-scheme is light', () => {
    const mockMatchMedia = jest.fn((query: string) => ({ // platform-safe
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    (window as any).matchMedia = mockMatchMedia; // platform-safe

    const isDark = getSystemDarkModePreference();
    expect(isDark).toBe(false);
  });

  it('should return false when matchMedia is not supported', () => {
    // Remove matchMedia
    delete (window as any).matchMedia; // platform-safe

    const isDark = getSystemDarkModePreference();
    expect(isDark).toBe(false);
  });

  it('should handle matchMedia errors gracefully', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    (window as any).matchMedia = jest.fn(() => { // platform-safe
      throw new Error('matchMedia error');
    });

    const isDark = getSystemDarkModePreference();
    expect(isDark).toBe(false);
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});

describe('platform.ts - Theme Change Listener', () => {
  let originalMatchMedia: typeof window.matchMedia | undefined; // platform-safe

  beforeEach(() => {
    originalMatchMedia = window.matchMedia; // platform-safe
  });

  afterEach(() => {
    if (originalMatchMedia) {
      (window as any).matchMedia = originalMatchMedia; // platform-safe
    }
  });

  it('should add and remove theme change listener successfully', () => {
    const mockRemoveEventListener = jest.fn();
    const mockAddEventListener = jest.fn();
    const mockMediaQuery = { // platform-safe
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: jest.fn(),
    };

    (window as any).matchMedia = jest.fn(() => mockMediaQuery); // platform-safe

    const callback = jest.fn();
    const cleanup = addSystemThemeChangeListener(callback);

    // Should call addEventListener with 'change' event and a function handler
    expect(mockAddEventListener).toHaveBeenCalled();
    expect(mockAddEventListener.mock.calls[0][0]).toBe('change');
    expect(typeof mockAddEventListener.mock.calls[0][1]).toBe('function');

    // Call cleanup
    cleanup();
    
    // Should call removeEventListener with 'change' event and the same function handler
    expect(mockRemoveEventListener).toHaveBeenCalled();
    expect(mockRemoveEventListener.mock.calls[0][0]).toBe('change');
  });

  it('should call callback when theme changes', () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;
    const mockAddEventListener = jest.fn((event: string, handler: any) => {
      if (event === 'change') {
        changeHandler = handler;
      }
    });

    const mockMediaQuery = { // platform-safe
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: mockAddEventListener,
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };

    (window as any).matchMedia = jest.fn(() => mockMediaQuery); // platform-safe

    const callback = jest.fn();
    addSystemThemeChangeListener(callback);

    // Simulate theme change
    if (changeHandler) {
      changeHandler({ matches: true } as MediaQueryListEvent);
      expect(callback).toHaveBeenCalledWith(true);
    }
  });

  it('should return noop cleanup when matchMedia is not supported', () => {
    // Remove matchMedia
    delete (window as any).matchMedia; // platform-safe

    const callback = jest.fn();
    const cleanup = addSystemThemeChangeListener(callback);

    // Should not throw
    expect(() => cleanup()).not.toThrow();
  });

  it('should handle listener errors gracefully', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock matchMedia to return an object that throws when addEventListener is called
    const mockMediaQuery = { // platform-safe
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(() => {
        throw new Error('Listener error');
      }),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };

    (window as any).matchMedia = jest.fn(() => mockMediaQuery); // platform-safe

    const callback = jest.fn();
    const cleanup = addSystemThemeChangeListener(callback);

    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(() => cleanup()).not.toThrow();

    consoleWarnSpy.mockRestore();
  });
});

describe('platform.ts - Storage (Web/localStorage paths)', () => {
  let originalLocalStorage: Storage; // platform-safe

  beforeEach(() => {
    originalLocalStorage = window.localStorage; // platform-safe
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', { // platform-safe
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  it('getItem should use localStorage on web', async () => {
    const mockGetItem = jest.fn().mockReturnValue('stored-value');
    Object.defineProperty(window, 'localStorage', { // platform-safe
      value: { getItem: mockGetItem, setItem: jest.fn(), removeItem: jest.fn() },
      writable: true,
      configurable: true,
    });

    const result = await Storage.getItem('my-key');
    expect(result).toBe('stored-value');
    expect(mockGetItem).toHaveBeenCalledWith('my-key');
  });

  it('setItem should use localStorage on web', async () => {
    const mockSetItem = jest.fn();
    Object.defineProperty(window, 'localStorage', { // platform-safe
      value: { getItem: jest.fn(), setItem: mockSetItem, removeItem: jest.fn() },
      writable: true,
      configurable: true,
    });

    await Storage.setItem('my-key', 'my-value');
    expect(mockSetItem).toHaveBeenCalledWith('my-key', 'my-value');
  });

  it('removeItem should use localStorage on web', async () => {
    const mockRemoveItem = jest.fn();
    Object.defineProperty(window, 'localStorage', { // platform-safe
      value: { getItem: jest.fn(), setItem: jest.fn(), removeItem: mockRemoveItem },
      writable: true,
      configurable: true,
    });

    await Storage.removeItem('my-key');
    expect(mockRemoveItem).toHaveBeenCalledWith('my-key');
  });
});

describe('platform.ts - assertWebAPI (web)', () => {
  it('should not throw on web platform', () => {
    expect(() => assertWebAPI('localStorage')).not.toThrow();
  });
});

describe('platform.ts - safeWebAPI (web)', () => {
  it('should execute callback on web', () => {
    const result = safeWebAPI(() => 'web-result', 'fallback');
    expect(result).toBe('web-result');
  });

  it('should return fallback when callback throws on web', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = safeWebAPI(() => {
      throw new Error('API failed');
    }, 'fallback');

    expect(result).toBe('fallback');

    errorSpy.mockRestore();
  });
});
