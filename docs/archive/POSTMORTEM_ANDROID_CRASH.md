# Postmortem: Android Crash durch window.matchMedia

**Datum:** 13. Dezember 2025
**Version betroffen:** 1.0.7, 1.0.8
**Schweregrad:** Critical (App crasht sofort beim Start)

## Problem

Die App crashte sofort beim Start auf Android-Geräten mit einem weißen Bildschirm. Nutzer konnten die App nicht verwenden.

## Root Cause Analysis

### Wie ist der Fehler entstanden?

1. **Commit 0ba8aa4** (26. Nov 2024): "fix: Implement working dark mode with system preference detection"
   - Fügte `window.matchMedia` Code hinzu für System Dark Mode Detection
   - Code war NUR für Web gedacht: `if (typeof window !== 'undefined' && window.matchMedia)`
   - KEIN `Platform.OS === 'web'` Check

2. **Commit 7546a8b** (4. Dez 2024): "feat: Add light/dark mode toggle, persist operation setting, motivation messages"
   - Migrierte localStorage → AsyncStorage mit korrekten Platform.OS Checks
   - **ABER**: Der `window.matchMedia` Code wurde NICHT angepasst!
   - Partielle Cross-Platform Migration

3. **Problem:**
   - `typeof window !== 'undefined'` ist TRUE auf Android (React Native hat ein globales `window` Object)
   - `window.matchMedia` ist jedoch UNDEFINED auf Android
   - Code crashte beim Versuch `matchMedia` aufzurufen

### Warum wurde es nicht früher entdeckt?

1. **Keine Android-Tests vor Release:** Die App wurde nur im Web-Browser getestet
2. **Partielle Migration:** localStorage wurde für Android angepasst, aber window.matchMedia nicht
3. **Fehlende Code Review Checkliste:** Keine systematische Prüfung auf Web-APIs
4. **Keine automatisierten Tests:** Keine Unit/Integration Tests für Platform-spezifischen Code

## Timeline

- **26. Nov 2024:** Bug eingeführt in Commit 0ba8aa4
- **04. Dez 2024:** Partielle Migration in 7546a8b - Bug bleibt bestehen
- **06. Dez 2024:** Release v1.0.7 mit Bug
- **13. Dez 2024:** Bug discovered und gefixt in v1.0.9

**Dauer: 17 Tage im Production Code**

## Die Lösung

```typescript
// Vorher (fehlerhaft):
if (typeof window !== 'undefined' && window.matchMedia) {
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  // ...
}

// Nachher (korrekt):
if (Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia) {
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  // ...
}
```

## Präventionsmaßnahmen für die Zukunft

### 1. Pre-Commit Checkliste für Cross-Platform Code

Erstelle eine `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Cross-Platform Checklist

Wenn dieser PR Code für React Native/Expo ändert:

- [ ] Alle Web APIs haben `Platform.OS === 'web'` Check
  - `window`, `document`, `navigator`, `localStorage`, `matchMedia`, etc.
- [ ] AsyncStorage statt localStorage für mobiles Storage
- [ ] Code auf BEIDEN Plattformen getestet (Web + Android/iOS)
- [ ] Keine React Native Komponenten im Web ohne Polyfill
```

### 2. Automatisierte Code-Analyse

Erstelle eine ESLint Custom Rule oder pre-commit hook:

```javascript
// .eslintrc.js - Custom Rule Beispiel
{
  rules: {
    'no-unsafe-web-apis': [
      'error',
      {
        apis: ['window.matchMedia', 'localStorage', 'document.querySelector'],
        requirePlatformCheck: true
      }
    ]
  }
}
```

### 3. Platform-Detection Utility

Erstelle eine zentrale Utility-Funktion:

```typescript
// utils/platform.ts
import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export function supportsMatchMedia(): boolean {
  return isWeb && typeof window !== 'undefined' && !!window.matchMedia;
}

export function getSystemDarkMode(): boolean {
  if (supportsMatchMedia()) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  // Fallback für Android/iOS: Use Appearance API
  return false; // or use Appearance.getColorScheme() === 'dark'
}
```

### 4. Testing Strategy

**Vor jedem Release:**

1. **Web Testing:**
   - Chrome DevTools Mobile Emulation
   - Safari Desktop & Mobile

2. **Android Testing:**
   - Lokaler Build: `./gradlew assembleRelease`
   - Installation auf physischem Gerät
   - Test der kritischen Flows

3. **Automatisierte Tests:**
   ```typescript
   // App.test.tsx
   describe('Platform-specific code', () => {
     it('should not call window.matchMedia on Android', () => {
       Platform.OS = 'android';
       // Mock and verify window.matchMedia is never called
     });
   });
   ```

### 5. Build & Release Process

**Neue Release-Checkliste:**

```markdown
## Release Checklist v1.0.x

### Testing
- [ ] Web Build getestet (npm run build:web)
- [ ] Android Build erfolgreich (./gradlew bundleRelease)
- [ ] App auf physischem Android-Gerät getestet
- [ ] Kritische Flows funktionieren (Start, Settings, Game Play)

### Platform-Specific
- [ ] Alle neuen Web APIs haben Platform.OS Check
- [ ] AsyncStorage für mobile, localStorage nur für Web
- [ ] Keine console.errors in Production

### Deployment
- [ ] Version-Nummern aktualisiert (package.json, app.json, build.gradle.kts)
- [ ] Git Tag erstellt
- [ ] Release Notes geschrieben
```

### 6. Documentation

Erweitere die README mit einer **Platform Compatibility Matrix:**

```markdown
## Platform Compatibility

| Feature | Web | Android | iOS |
|---------|-----|---------|-----|
| Dark Mode Detection | ✅ window.matchMedia | ⚠️ Fallback | ⚠️ Fallback |
| Persistence | localStorage | AsyncStorage | AsyncStorage |
| Deep Links | ✅ | ✅ App Links | ✅ Universal Links |
```

### 7. Monitoring & Alerting

Falls möglich, integriere Crash Reporting:

```typescript
// utils/errorReporting.ts
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_DSN',
  enableInExpoDevelopment: true,
  beforeSend(event) {
    // Add platform info
    event.tags = {
      ...event.tags,
      platform: Platform.OS,
      version: APP_VERSION,
    };
    return event;
  },
});
```

## Lessons Learned

1. **Partielle Migration ist gefährlich:** Wenn du Web → Cross-Platform migrierst, prüfe ALLE Web APIs
2. **typeof window !== 'undefined' reicht NICHT:** React Native hat ein window Object, aber nicht alle Web APIs
3. **Teste auf der Zielplattform:** Browser DevTools simulieren kein echtes Android
4. **Checklisten sind wichtig:** Systematische Code Reviews mit Checklisten hätten das verhindert
5. **Release-Prozess muss beide Plattformen testen:** Nicht nur Web oder nur Android

## Action Items

- [x] Bugfix deployed (v1.0.9)
- [ ] PR Template mit Cross-Platform Checklist erstellen
- [ ] ESLint Rule für Web APIs hinzufügen
- [ ] Platform Utility Functions erstellen
- [ ] Release Checklist dokumentieren
- [ ] Automatisierte Tests für Platform-Code schreiben

---

**Erstellt:** 2025-12-13
**Autor:** Development Team
**Review:** Pending
