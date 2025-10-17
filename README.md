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

## Projekt-Struktur

```
1x1_Trainer/
├── App.tsx                      # Haupt-App-Komponente
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
├── PWA-OPTIMIZATION.md         # Technische Dokumentation
├── PWA-TESTING.md              # Testing Guide
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
