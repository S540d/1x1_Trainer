/**
 * Language detection tests
 */

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(),
}));

import { getDeviceLanguage } from './language';
import * as Localization from 'expo-localization';

describe('getDeviceLanguage', () => {
  const mockGetLocales = Localization.getLocales as jest.MockedFunction<typeof Localization.getLocales>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should detect German locale', () => {
    mockGetLocales.mockReturnValue([
      { languageCode: 'de' } as any
    ]);
    expect(getDeviceLanguage()).toBe('de');
  });

  it('should detect English locale', () => {
    mockGetLocales.mockReturnValue([
      { languageCode: 'en' } as any
    ]);
    expect(getDeviceLanguage()).toBe('en');
  });

  it('should fallback to English for unsupported locales', () => {
    mockGetLocales.mockReturnValue([
      { languageCode: 'fr' } as any
    ]);
    expect(getDeviceLanguage()).toBe('en');
  });

  it('should fallback to English for Spanish locale', () => {
    mockGetLocales.mockReturnValue([
      { languageCode: 'es' } as any
    ]);
    expect(getDeviceLanguage()).toBe('en');
  });

  it('should fallback to English when no locale is available', () => {
    mockGetLocales.mockReturnValue([]);
    expect(getDeviceLanguage()).toBe('en');
  });

  it('should fallback to English when languageCode is undefined', () => {
    mockGetLocales.mockReturnValue([
      { languageCode: undefined } as any
    ]);
    expect(getDeviceLanguage()).toBe('en');
  });

  it('should fallback to English on error', () => {
    mockGetLocales.mockImplementation(() => {
      throw new Error('Localization error');
    });
    expect(getDeviceLanguage()).toBe('en');
  });

  it('should handle null return from getLocales', () => {
    mockGetLocales.mockReturnValue(null as any);
    expect(getDeviceLanguage()).toBe('en');
  });
});
