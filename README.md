# 1x1 Trainer - Cross-Platform (React Native + PWA)

Ein Cross-Platform 1x1-Trainer für Android und Web (PWA) mit React Native.

## Features

- ✅ **4 Spielmodi**:
  - Normale Aufgaben (Ergebnis gesucht)
  - Erste Zahl fehlt
  - Zweite Zahl fehlt
  - Gemischt

- ✅ **Cross-Platform**:
  - 📱 Native Android App
  - 🌐 Progressive Web App (PWA)
  - 🍎 iOS (experimentell)

- ✅ Punkte-System
- ✅ Visuelles Feedback (grün/rot)
- ✅ Installierbar als PWA

## Installation & Start

### Voraussetzungen
```bash
npm install
```

### Android App entwickeln
```bash
npm run android
```

### Web/PWA entwickeln
```bash
npm run web
```

### iOS entwickeln (Mac + Xcode erforderlich)
```bash
npm run ios
```

## Build für Produktion

### Web/PWA Build
```bash
npm run build:web
```
Die Dateien werden in `dist/` erstellt und können auf einem Webserver deployed werden.

### 🚀 GitHub Pages Deployment

Das Projekt ist für automatisches Deployment auf GitHub Pages konfiguriert:

**1. Repository auf GitHub erstellen:**
```bash
gh repo create 1x1_Trainer --public --source=. --remote=origin
```

**2. Code pushen:**
```bash
git add .
git commit -m "Initial commit - React Native PWA"
git push -u origin main
```

**3. GitHub Pages aktivieren:**
- Gehe zu Repository Settings → Pages
- Source: "GitHub Actions" auswählen
- Der GitHub Actions Workflow deployed automatisch bei jedem Push auf `main`

**4. App erreichbar unter:**
`https://[username].github.io/1x1_Trainer/`

### Android Build
Für Production Builds wird Expo Application Services (EAS) empfohlen:
```bash
# EAS CLI installieren (einmalig)
npm install -g eas-cli

# EAS Login
eas login

# Android Build
npm run build:android
```

## PWA Installation

Die Web-Version kann auf mobilen Geräten und Desktops als App installiert werden:

1. Öffne die Web-App im Browser
2. Tippe auf "Zum Startbildschirm hinzufügen" (mobil) oder das Install-Icon in der Adressleiste (Desktop)
3. Die App wird wie eine native App installiert

### PWA Features ✅
- ✅ **Installierbar** - Als echte App auf dem Homescreen
- ✅ **Offline verfügbar** - Funktioniert ohne Internet
- ✅ **App-Icons** - Vollständig optimiert für alle Devices (96px-512px)
- ✅ **Screenshots** - Im Install-Dialog sichtbar
- ✅ **Schnell** - Intelligentes Caching & Performance
- ✅ **Responsive** - Perfekt auf allen Bildschirmgrößen

### Deployment-Umgebungen

Das Projekt verwendet eine **3-Tier Deployment-Strategie** für sicheres Testen:

| Umgebung | URL | Branch | Auto-Deploy | Zweck |
|----------|-----|--------|-------------|-------|
| **Production** | https://s540d.github.io/1x1_Trainer/ | `main` | ✅ | Produktiv-Version für Nutzer |
| **Staging** | https://s540d.github.io/1x1_Trainer/staging/ | `staging` | ✅ | Pre-Production Testing |
| **Testing** | https://s540d.github.io/1x1_Trainer/testing/ | `testing` | ✅ | Feature Testing & Development |

**3-Tier Workflow:**
```
Feature Branch → testing → staging → main
                   ↓         ↓        ↓
                 Tests    Final QA  Release
```

- Entwickle Features auf Feature-Branches
- Teste lokal mit `npm run web`
- Push zu `testing` für erste Online-Tests
- Merge zu `staging` für Pre-Production QA
- Merge zu `main` für Production Release

Detaillierter Workflow: 📖 [TESTING.md](./TESTING.md)

### PWA Testing & Validation

**Lokal testen:**
```bash
npm run build:web
cd dist
npx http-server -p 8080

# Browser öffnen: http://localhost:8080
# Chrome DevTools (F12) → Application Tab → Manifest & Service Workers prüfen
```

**PWA Validierung durchführen:**
```bash
bash scripts/test-pwa.sh
```

**Lighthouse Audit:**
1. Chrome DevTools öffnen (F12)
2. Lighthouse Tab (rechts oben)
3. "Analyze page load" klicken
4. Report generieren → PWA Score sollte 90+ sein

**Dokumentation:**
- 📖 [PWA Optimization Guide](./PWA-OPTIMIZATION.md) - Technische Details
- 🧪 [PWA Testing Guide](./PWA-TESTING.md) - Detaillierte Test-Anleitungen
- 🧪 [Testing & Deployment](./TESTING.md) - Branch-Strategie & Workflow

## Projekt-Struktur

```
1x1_Trainer/
├── App.tsx                      # Haupt-App-Komponente (1044 Zeilen, refactored)
├── hooks/                       # Custom React Hooks
│   ├── useTheme.ts             # Theme-Management & Dark Mode
│   ├── usePreferences.ts       # User Preferences mit Auto-Save
│   └── useGameLogic.ts         # Game State & Logic
├── types/                       # TypeScript Type Definitions
│   └── game.ts                 # Game, Theme, Storage Types
├── i18n/                        # Internationalization
│   └── translations.ts         # DE/EN Übersetzungen
├── utils/                       # Utility-Module
│   ├── constants.ts            # App-Konstanten & Konfiguration
│   ├── theme.ts                # Theme Color Management
│   ├── storage.ts              # Cross-Platform Storage
│   ├── platform.ts             # Platform-Safe Web API Wrapper
│   └── calculations.ts         # Game Calculations
├── public/                      # PWA Assets & Web-Konfiguration
│   ├── index.html              # HTML Template für Web
│   ├── manifest.json           # ✅ PWA Manifest (vollständig)
│   ├── service-worker.js       # ✅ Service Worker (intelligentes Caching)
│   ├── pwa-update.js           # ✅ PWA Update Manager
│   ├── robots.txt              # ✅ SEO
│   ├── sitemap.xml             # ✅ SEO
│   ├── favicon.png             # Browser Tab Icon
│   ├── icon-*.png              # ✅ Icons (96-512px, 9 Größen)
│   └── screenshot-*.png        # ✅ Install-Dialog Screenshots
├── scripts/
│   ├── generate-icons.py       # Icon Generator
│   ├── generate-screenshots.py # Screenshot Generator
│   ├── test-pwa.sh             # PWA Validation Script
│   └── post-build.js           # Build Post-Processing
├── playstore-assets/            # Play Store Marketing Assets
├── playstore-screenshots/       # App Screenshots for Store
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # CI/CD Pipeline
├── PWA-OPTIMIZATION.md         # Technische Dokumentation
├── PWA-TESTING.md              # Testing Guide
├── CHANGELOG.md                # Version History
├── package.json
└── README.md
```

## Technologie-Stack

- **React Native** - Cross-Platform Framework
- **Expo** - Build & Development Tools (Managed Workflow)
- **EAS Build** - Cloud-basierte Build-Infrastruktur
- **React Native Web** - Web-Support
- **TypeScript** - Type Safety
- **Hermes** - JavaScript Engine für optimierte Performance

## Build-Prozess

### Android Production Builds

Dieses Projekt verwendet **Expo Managed Workflow** mit **EAS Build**:

- Native Android-Code wird automatisch von EAS Build generiert
- Kein lokales `/android` Verzeichnis erforderlich
- Builds laufen in der Cloud mit konsistenter Umgebung
- Signierung erfolgt mit lokalen Credentials (Keystore)

**Build-Kommando:**
```bash
npm run build:android
```

Das generiert eine signierte AAB-Datei für den Play Store Upload.

## Migration vom Android-Projekt

Das ursprüngliche Android-Projekt (Kotlin + Jetpack Compose) wurde zu React Native mit Expo Managed Workflow portiert:
- ✅ Eine gemeinsame Codebasis für Android und Web
- ✅ PWA-Support out of the box
- ✅ Einfachere Wartung durch Expo-Infrastruktur
- ✅ Cloud-basierte Builds via EAS Build
- ✅ Automatische Updates via Expo Updates

Das alte native Android-Projekt ist lokal unter `Android_old/` archiviert (nicht im Repository).
