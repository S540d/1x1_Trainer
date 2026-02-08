/**
 * Language detection utility
 * Detects device language with fallback to English
 */

import * as Localization from 'expo-localization';
import { Language } from '../types/game';

/**
 * Detects the device's locale and returns a supported language
 * Falls back to 'en' if the device locale is not supported
 *
 * @returns {Language} The detected language code ('de' or 'en')
 * @example
 * // Device set to German
 * getDeviceLanguage() // returns 'de'
 *
 * // Device set to French (unsupported)
 * getDeviceLanguage() // returns 'en' (fallback)
 */
export function getDeviceLanguage(): Language {
  try {
    // Get the device locale (e.g., "en-US", "de-DE", "fr-FR")
    const locales = Localization.getLocales();
    const languageCode = locales[0]?.languageCode;

    // Check if the language code is supported
    if (languageCode === 'de') {
      return 'de';
    }

    // Default to English for all other languages
    return 'en';
  } catch {
    // Default to English on error
    return 'en';
  }
}
