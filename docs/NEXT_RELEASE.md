# Planung für nächste Version

## Status
- **Aktuelle Version im Play Store**: 1.2.0 (submitted 2026-02-15)
- **Aktuelle Entwicklungsversion**: 1.2.0
- **Build System**: EAS Build (Expo SDK 54)

## Offene Issues

### Bug
- **#108** - High Score Banner zeigt auch bei Gleichstand

### Enhancement
- **#109** - Expo Doctor: Dependency-Versionen und eas-cli aufräumen
- **#105** - Über Feld
- **#100** - UX-Verbesserung: Challenge-Modus & Design-Modernisierung
- **#96** - App umbenennen
- **#79** - Refactoring
- **#34** - Technical Updates & Maintenance Audit
- **#15** - Einheitliches Aussehen auf verschiedenen Bildschirmgrößen
- **#8** - Screenshots im Playstore aktualisieren

### Blocked
- **#46** - Testing & Umgebungsverwaltung standardisieren

## Release-Prozess

### Version Bump (alle Dateien synchron!)
- `package.json` → `version`
- `app.json` → `expo.version` + `expo.android.versionCode`
- `utils/constants.ts` → `APP_VERSION`

### Build & Deploy
```bash
# Tests
npm test

# Web Build & Deploy
npm run build:web
npm run deploy

# Android Build (EAS)
npx eas-cli build --platform android --profile production

# Release Tag
git tag v{VERSION}
git push origin v{VERSION}
```

### Workflow
```
feature → testing → staging → main → EAS Build → Play Store
```

## Nützliche Links
- [Play Store Console](https://play.google.com/console)
- [EAS Builds](https://expo.dev/accounts/devsven/projects/1x1-trainer/builds)
- [GitHub Actions](https://github.com/S540d/1x1_Trainer/actions)
- [CHANGELOG.md](../CHANGELOG.md)
