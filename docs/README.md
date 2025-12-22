# 1x1 Trainer Dokumentation

Diese Dokumentation hilft bei der Vorbereitung und Durchführung von Releases.

## 📚 Verfügbare Dokumente

### Release-Management

- **[NEXT_RELEASE.md](NEXT_RELEASE.md)** - Vorbereitung für Version 1.1.0
  - Status-Übersicht
  - Implementierte Features
  - Offene Issues
  - Schritt-für-Schritt Release-Anleitung

- **[RELEASE_NOTES_TEMPLATE.md](RELEASE_NOTES_TEMPLATE.md)** - Vorlagen für Release Notes
  - Play Store (Deutsch & Englisch)
  - GitHub Releases
  - Best Practices

- **[../CHANGELOG.md](../CHANGELOG.md)** - Vollständiges Changelog
  - Alle Versionen
  - Detaillierte Änderungen
  - Geplante Features

### Technische Dokumentation

- **[ANDROID_APP_LINKS.md](ANDROID_APP_LINKS.md)** - Android App Links Setup
- **[POSTMORTEM_ANDROID_CRASH.md](POSTMORTEM_ANDROID_CRASH.md)** - Analyse Android Crash v1.0.8

## 🚀 Quick Start: Nächster Release

### 1. Nach Play Store Genehmigung

Wenn Version 1.0.9 im Play Store veröffentlicht wurde:

```bash
# Projekt-Status prüfen
cd /Users/svenstrohkark/Documents/Programmierung/Projects/1x1_Trainer
git status
git log --oneline -10

# CI/CD Status prüfen
gh run list --limit 5

# Offene Issues prüfen
gh issue list
```

### 2. Dokumentation lesen

Lies [NEXT_RELEASE.md](NEXT_RELEASE.md) für die komplette Anleitung.

### 3. Version bumpen

Alle Versionen müssen synchron sein:
- `utils/constants.ts` - `APP_VERSION`
- `package.json`
- `app.json` - `expo.version` und `expo.android.versionCode`

### 4. Release erstellen

Siehe [NEXT_RELEASE.md](NEXT_RELEASE.md) Schritt 7-10.

## 🔧 Aktueller Status

- **Version im Play Store**: 1.0.9
- **Aktuelle Entwicklungsversion**: 1.0.11 (bereit für Play Store)
- **Entwicklungsstand**: main branch mit stabilen Features
- **Nächste geplante Version**: 1.1.0 (zukünftige Features)
- **Offene Issues**: 2 (#10 Code Refactoring, #8 Screenshots)

## 📊 Automatisierung

Das Projekt verfügt über:

### Pre-Commit Hooks (`.husky/pre-commit`)
- ✅ console.log Erkennung
- ✅ Web API Platform-Safety
- ✅ Versions-Konsistenz

### CI/CD Pipeline (`.github/workflows/ci-cd.yml`)
- ✅ Code Quality & Linting
- ✅ Web Build
- ✅ Android Debug Build
- ✅ Platform Compatibility Checks
- ✅ Security Audit
- ✅ Release Readiness Report

### Deploy Pipeline (`.github/workflows/deploy.yml`)
- ✅ GitHub Pages Deployment
- ✅ PWA Build

## 🎯 Nächste Schritte

1. 📤 **Submitten** von v1.0.11 zum Play Store
2. ⏳ **Warten** auf Play Store Genehmigung
3. 🧪 **Vorbereiten** von Release 1.1.0
4. 📝 **Planen** zukünftiger Features

Siehe [NEXT_RELEASE.md](NEXT_RELEASE.md) für Details.

## 📱 Build-Befehle

### Web
```bash
npm run build:web
```

### Android Debug
```bash
cd Android
./gradlew assembleDebug
```

### Android Release
```bash
cd Android
./gradlew assembleRelease
# APK: Android/app/build/outputs/apk/release/app-release.apk
```

## 🔗 Links

- [GitHub Repository](https://github.com/S540d/1x1_Trainer)
- [Play Store](https://play.google.com/store/apps/details?id=com.sven4321.trainer1x1)
- [Web App](https://s540d.github.io/1x1_Trainer/)
- [GitHub Actions](https://github.com/S540d/1x1_Trainer/actions)

## 💡 Tipps

### Version Bump Helper

Alle Versionen gleichzeitig aktualisieren:

```bash
# Beispiel für 1.1.0
NEW_VERSION="1.1.0"
NEW_VERSION_CODE="11"

# package.json
sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" package.json

# app.json
sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" app.json
sed -i '' "s/\"versionCode\": [0-9]*/\"versionCode\": $NEW_VERSION_CODE/" app.json

# App.tsx
sed -i '' "s/APP_VERSION = '.*'/APP_VERSION = '$NEW_VERSION'/" App.tsx

# build.gradle.kts
sed -i '' "s/versionCode = [0-9]*/versionCode = $NEW_VERSION_CODE/" Android/app/build.gradle.kts
sed -i '' "s/versionName = \".*\"/versionName = \"$NEW_VERSION\"/" Android/app/build.gradle.kts

# Prüfen
git diff
```

### CI/CD Watch

```bash
# Workflow-Runs live verfolgen
gh run watch

# Letzte Runs anzeigen
gh run list --limit 10

# Fehlgeschlagene Runs prüfen
gh run list --status failure
```

### Release Checklist

- [ ] Alle Tests bestehen
- [ ] CI/CD Pipeline grün
- [ ] Versions-Nummern konsistent
- [ ] CHANGELOG aktualisiert
- [ ] Release Notes geschrieben
- [ ] Screenshots aktualisiert (optional)
- [ ] APK getestet
- [ ] Web-App getestet
