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

## Projekt-Struktur

```
1x1_Trainer/
├── App.tsx                 # Haupt-App-Komponente
├── public/                 # PWA Assets
│   ├── index.html         # HTML Template für Web
│   ├── manifest.json      # PWA Manifest
│   └── service-worker.js  # Service Worker für Offline-Support
├── package.json
└── README.md
```

## Technologie-Stack

- **React Native** - Cross-Platform Framework
- **Expo** - Build & Development Tools
- **React Native Web** - Web-Support
- **TypeScript** - Type Safety

## Migration vom Android-Projekt

Das ursprüngliche Android-Projekt (Kotlin + Jetpack Compose) wurde zu React Native portiert, um:
- Eine gemeinsame Codebasis für Android und Web zu haben
- PWA-Support zu ermöglichen
- Einfachere Wartung durch eine einzige Codebasis

Das Android-Projekt ist weiterhin verfügbar unter `1x1_Trainer_android/`.
