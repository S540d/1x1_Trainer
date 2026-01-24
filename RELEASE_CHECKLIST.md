# Release Checklist

Diese Checklist muss vor jedem Release durchlaufen werden.

## Pre-Release Testing

### Web Platform
- [ ] Build erfolgreich: `npm run build:web`
- [ ] App startet ohne Fehler
- [ ] Alle Features funktionieren im Browser
- [ ] Getestet in Chrome
- [ ] Getestet in Safari (falls verfügbar)
- [ ] Mobile Browser Simulation (Chrome DevTools)
- [ ] Dark Mode funktioniert
- [ ] Settings werden korrekt gespeichert

### Android Platform (EAS Build)
- [ ] Build erfolgreich: `npx eas build --platform android --profile production`
- [ ] Build-Status auf expo.dev überprüft
- [ ] AAB heruntergeladen von expo.dev
- [ ] App auf physischem Gerät getestet (via Internal Testing Track)
- [ ] App startet ohne Crash
- [ ] Alle Features funktionieren
- [ ] Dark Mode funktioniert
- [ ] Settings werden korrekt gespeichert
- [ ] Keine Permissions Errors
- [ ] Deep Links funktionieren (falls vorhanden)

### iOS Platform (falls relevant)
- [ ] Build erfolgreich
- [ ] App auf Simulator getestet
- [ ] App auf physischem Gerät getestet
- [ ] Alle Features funktionieren

## Code Quality

### Cross-Platform Checks
- [ ] Alle Web APIs haben `Platform.OS === 'web'` Check
- [ ] `AsyncStorage` verwendet für Mobile Storage
- [ ] `localStorage` nur für Web mit Platform-Check
- [ ] Keine `window.*` Calls ohne Platform-Check
- [ ] Keine `document.*` Calls ohne Platform-Check

### Code Review
- [ ] Keine console.log in Production Code
- [ ] Keine TODO/FIXME Kommentare ohne Issue
- [ ] Keine hardcoded Credentials oder API Keys
- [ ] Error Handling vorhanden
- [ ] TypeScript Errors: 0
- [ ] ESLint Warnings: 0

## Version & Metadata

### Version Numbers (MUST be consistent!)
- [ ] `package.json` version aktualisiert
- [ ] `app.json` expo.version aktualisiert (muss mit package.json übereinstimmen!)
- [ ] `app.json` expo.android.versionCode erhöht
- [ ] `utils/constants.ts` APP_VERSION aktualisiert (muss mit package.json übereinstimmen!)
- [ ] Pre-commit hook prüft automatisch Version-Konsistenz

### Git & Branches
- [ ] Alle Änderungen committed
- [ ] Commit Messages sind aussagekräftig
- [ ] Feature getestet auf `testing` Branch
- [ ] Feature reviewed auf `staging` Branch
- [ ] Bereit für Merge zu `main`
- [ ] Keine merge conflicts
- [ ] CI/CD Tests bestanden auf allen Branches

## Documentation

- [ ] CHANGELOG.md aktualisiert
- [ ] Release Notes geschrieben
- [ ] README aktualisiert (falls nötig)
- [ ] Breaking Changes dokumentiert
- [ ] Migration Guide (falls Breaking Changes)

## Build Artifacts

### Android (EAS Build)
- [ ] Signiertes AAB von expo.dev heruntergeladen
- [ ] AAB lokal gespeichert: `1x1-trainer-v{VERSION}-signed.aab`
- [ ] Dateigröße überprüft (sollte ~8-12MB sein)
- [ ] Build-Logs auf expo.dev überprüft (keine Warnings)

### Web
- [ ] Build in `dist/` Verzeichnis
- [ ] Assets korrekt kopiert
- [ ] Deployment vorbereitet

## Deployment

### Git
- [ ] Git Tag erstellt: `git tag v{VERSION}`
- [ ] Tag gepusht: `git push origin v{VERSION}`
- [ ] Commits gepusht: `git push origin main`

### Play Store (Android)
- [ ] AAB auf Play Store Console hochgeladen
- [ ] Release Notes (EN) ausgefüllt
- [ ] Release Notes (DE) ausgefüllt
- [ ] Screenshots aktuell
- [ ] Store Listing überprüft
- [ ] Release an Internal Testing Track

### Web (GitHub Pages)
- [ ] `npm run deploy` ausgeführt
- [ ] Website erreichbar unter `https://s540d.github.io/1x1_Trainer/`
- [ ] Alle Features funktionieren online

## Post-Release

### Monitoring
- [ ] App startet ohne Crashes (erste 24h beobachten)
- [ ] Keine kritischen Fehler in Logs
- [ ] User Feedback monitoren

### Communication
- [ ] Release Notes veröffentlicht
- [ ] GitHub Release erstellt
- [ ] README Badge aktualisiert (falls vorhanden)

## Rollback Plan

Falls kritische Probleme auftreten:

1. **Play Store:** Previous version wiederherstellen
2. **Web:** Previous version deployen: `git revert` + `npm run deploy`
3. **Hotfix:** Neuen Branch erstellen, fixen, express release

---

**Release Version:** v______
**Release Datum:** __________
**Erstellt von:** __________
**Überprüft von:** __________

**Unterschrift:** ____________
