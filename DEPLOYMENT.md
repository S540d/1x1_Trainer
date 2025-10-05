# GitHub Pages Deployment Guide

## 🚀 Schnellstart

### 1. Repository auf GitHub erstellen

```bash
cd /Users/svenstrohkark/Documents/Programmierung/Projects/1x1_Trainer
gh repo create 1x1_Trainer --public --source=. --remote=origin
```

### 2. Code committen und pushen

```bash
git add .
git commit -m "Initial commit - React Native PWA 1x1 Trainer"
git push -u origin main
```

### 3. GitHub Pages aktivieren

1. Gehe zu deinem Repository auf GitHub
2. Klicke auf **Settings** → **Pages**
3. Bei **Source** wähle: **GitHub Actions**

Der GitHub Actions Workflow (`.github/workflows/deploy.yml`) wird automatisch ausgeführt und deployed die App.

### 4. App öffnen

Nach erfolgreichem Deployment (ca. 2-3 Minuten) ist die App erreichbar unter:

```
https://s540d.github.io/1x1_Trainer/
```

**Multi-Projekt GitHub Pages:**
GitHub Pages kann mehrere Projekte gleichzeitig hosten - jedes Repository bekommt einen eigenen Subpath:
- ✅ `https://s540d.github.io/1x1_Trainer/`
- ✅ `https://s540d.github.io/Eisenhauer/`
- ✅ `https://s540d.github.io/Energy_Price_Germany/` (wenn Pages aktiviert)
- ✅ Weitere Projekte können jederzeit hinzugefügt werden

## 📱 PWA Installation

Die Web-App kann als Progressive Web App installiert werden:

### Mobil (iOS/Android):
1. Öffne die URL im Browser
2. Tippe auf das **Share**-Icon
3. Wähle **"Zum Startbildschirm hinzufügen"**
4. Die App wird wie eine native App installiert

### Desktop (Chrome/Edge):
1. Öffne die URL im Browser
2. Klicke auf das **Install**-Icon in der Adressleiste
3. Bestätige die Installation

## 🔄 Updates deployen

Bei jedem Push auf den `main` Branch wird automatisch deployed:

```bash
# Änderungen machen
git add .
git commit -m "Update: [Beschreibung]"
git push
```

Der GitHub Actions Workflow baut und deployed automatisch die neue Version.

## 🛠️ Manueller Build (lokal testen)

```bash
# Build erstellen
npm run build:web

# dist/ Ordner enthält die fertige PWA
# Kann auf jedem Static-Hosting deployed werden
```

## 📂 Deployment-Struktur

```
dist/
├── _expo/
│   └── static/
│       └── js/
│           └── web/
│               └── index-[hash].js
├── favicon.ico
├── index.html
├── manifest.json
├── service-worker.js
├── icon-192.png
└── icon-512.png
```

## ✅ Deployment Checklist

- [x] GitHub Actions Workflow konfiguriert
- [x] PWA Manifest erstellt
- [x] Service Worker für Offline-Support
- [x] Icons hinzugefügt (192x192 & 512x512)
- [x] Post-Build Script für Asset-Kopie
- [x] README mit Anleitung aktualisiert

## 🐛 Troubleshooting

### Build schlägt fehl
```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install
npm run build:web
```

### GitHub Actions Error
- Prüfe in Repository **Settings** → **Actions** → **General**, dass Workflows erlaubt sind
- Prüfe in **Settings** → **Pages**, dass Source auf "GitHub Actions" gesetzt ist

### PWA wird nicht installierbar
- Stelle sicher, dass die App über HTTPS erreichbar ist (GitHub Pages ist automatisch HTTPS)
- Prüfe in Browser DevTools → Application → Manifest, ob manifest.json geladen wird
- Prüfe Service Worker Registration in DevTools → Application → Service Workers
