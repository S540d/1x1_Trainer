# Testing & Deployment Workflow

Dieses Dokument beschreibt den Testing-Workflow und die Deployment-Strategie für das 1x1 Trainer Projekt.

## 📋 Branch-Strategie

Das Projekt nutzt ein einfaches aber effektives Branching-Modell:

| Branch | Zweck | URL | Auto-Deploy |
|--------|-------|-----|-------------|
| `main` | Production (Stable) | https://s540d.github.io/1x1_Trainer/ | ✅ Ja |
| `testing` | Testing/Preview | https://s540d.github.io/1x1_Trainer/testing/ | ✅ Ja |
| `gh-pages` | GitHub Pages (auto-generated) | - | - |

## 🧪 Testing Workflow

### 1. Feature Development
```bash
# Auf aktuellem main basierend entwickeln
git checkout main
git pull origin main
git checkout -b feature/my-feature
# ... Änderungen machen ...
git add .
git commit -m "feat: my feature"
git push origin feature/my-feature
```

### 2. Testing auf Testing Branch
```bash
# Feature zur testing Branch hinzufügen
git checkout testing
git pull origin testing
git merge feature/my-feature
git push origin testing
```

**Automatisch passiert dann:**
- ✅ GitHub Action wird ausgelöst
- ✅ Web-Build wird erstellt
- ✅ Deployment zu `/testing/` auf GitHub Pages
- ✅ Verfügbar unter: https://s540d.github.io/1x1_Trainer/testing/

### 3. Testing durchführen

**Partner testet online:**
- [ ] Funktionalität funktioniert wie erwartet
- [ ] Keine Console Errors
- [ ] UI/UX ist korrekt
- [ ] Mobile Ansicht funktioniert
- [ ] PWA Features funktionieren
- [ ] Performance ist gut
- [ ] Service Worker wird korrekt aktualisiert

### 4. Merge zu Production
```bash
# Nach erfolgreichem Testing in main mergen
git checkout main
git pull origin main
git merge testing
git push origin main
```

**Automatisch passiert dann:**
- ✅ GitHub Action wird ausgelöst
- ✅ Web-Build wird erstellt
- ✅ Deployment zu `/` auf GitHub Pages (Production)
- ✅ Verfügbar unter: https://s540d.github.io/1x1_Trainer/

## 🔄 GitHub Actions Workflows

### ci-cd.yml
Läuft bei jedem Push auf `main` und `develop`:
- Code Quality & Linting
- Console.log Check
- Web API Platform Safety Check
- TypeScript Compilation
- Build Verification

**Trigger:** `push` zu `main` oder `develop`, `pull_request`

### deploy.yml
Deployment der Production Version auf GitHub Pages:
- Erstellt Web-Build
- Deployed zu `/` (root)

**Trigger:** `push` zu `main`

### deploy-testing.yml (Neu)
Deployment der Testing Version auf GitHub Pages:
- Erstellt Web-Build  
- Fügt Testing-Marker hinzu
- Deployed zu `/testing/` (Subdirectory)
- Setzt `base href="/1x1_Trainer/testing/"`

**Trigger:** `push` zu `testing`

## 📝 Lokales Testen

### Web/PWA lokal entwickeln
```bash
npm run web
```
Öffnet die PWA im Browser (meist http://localhost:8081)

### Production Build lokal testen
```bash
npm run build:web
npx serve dist
```
Simuliert das Production Deployment lokal

### Responsive Design testen
- Chrome DevTools: F12 → Toggle Device Toolbar (Ctrl+Shift+M)
- Oder echte Geräte über LAN testen

## 🚀 Release-Prozess

1. **Feature Development** → `feature/xyz` Branch
2. **Lokales Testen** → `npm run web` und `npm run build:web`
3. **Testing Deployment** → Push zu `testing` Branch
4. **Online Testing** → Partner testet auf `/testing/`
5. **Production Release** → Merge zu `main` Branch
6. **Monitor** → Feedback und Fehlerberichterstattung

## 🔍 URLs

| URL | Umgebung | Status |
|-----|----------|--------|
| https://s540d.github.io/1x1_Trainer/ | Production | ✅ Live |
| https://s540d.github.io/1x1_Trainer/testing/ | Testing | ✅ Live |

## 📊 Debugging & Monitoring

### GitHub Actions Status
- https://github.com/S540d/1x1_Trainer/actions
- Zeigt Status aller Workflows
- Logs verfügbar für jede Run

### Web App Diagnostics
```bash
# PWA Cache löschen
- DevTools → Application → Cache Storage → Clear all

# Service Worker Update erzwingen
- Seite mit Shift+Reload neu laden

# Logs prüfen
- Console in DevTools öffnen
```

## ⚠️ Wichtige Hinweise

### Beim Merge zu Testing
- `testing` sollte immer auf Stand mit `main` sein
- Falls Konflikte: `git merge --abort` und manuell auflösen

### Beim Merge zu Production
- Sicherstellen, dass testing erfolgreich deployed wurde
- Nur stabile, getestete Features mergen
- Nach Release Git Tag erstellen: `git tag v1.0.x`

### Branch-Namen
- Features: `feature/description`
- Bugfixes: `fix/description`
- Hotfixes: `hotfix/description`

## 🔐 Branch Protection Rules

Die `main` Branch hat folgende Protection Rules:
- Requires pull request reviews ✅
- Requires status checks to pass ✅
- Requires branches to be up to date ✅

---

**Zuletzt aktualisiert:** 2025-12-21
**Version:** 1.0.10
