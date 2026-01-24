# Testing & Deployment Workflow

Dieses Dokument beschreibt den Testing-Workflow und die Deployment-Strategie für das 1x1 Trainer Projekt.

## 📋 Branch-Strategie

Das Projekt nutzt ein drei-stufiges Branching-Modell für maximale Sicherheit:

| Branch | Zweck | URL | Auto-Deploy |
|--------|-------|-----|-------------|
| `main` | Production (Stable) | https://s540d.github.io/1x1_Trainer/ | ✅ Ja |
| `staging` | Pre-Production (Final Review) | https://s540d.github.io/1x1_Trainer/staging/ | ✅ Ja |
| `testing` | Development Testing | https://s540d.github.io/1x1_Trainer/testing/ | ✅ Ja |
| `gh-pages` | GitHub Pages (auto-generated) | - | - |

### Workflow-Fluss
```
feature/xyz → testing → staging → main
   (Dev)      (Test)    (Review)   (Prod)
```

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

### 3. Development Testing durchführen

**Entwickler testet online:**
- [ ] Funktionalität funktioniert wie erwartet
- [ ] Keine Console Errors
- [ ] UI/UX ist korrekt
- [ ] Mobile Ansicht funktioniert

### 4. Merge zu Staging (Pre-Production)
```bash
# Nach erfolgreichem Testing zu staging mergen
git checkout staging
git pull origin staging
git merge testing
git push origin staging
```

**Automatisch passiert dann:**
- ✅ GitHub Action wird ausgelöst
- ✅ Web-Build wird erstellt
- ✅ Deployment zu `/staging/` auf GitHub Pages
- ✅ Verfügbar unter: https://s540d.github.io/1x1_Trainer/staging/

### 5. Final Review auf Staging

**Partner/Endnutzer testet online:**
- [ ] Alle Features funktionieren wie erwartet
- [ ] Keine Console Errors
- [ ] UI/UX ist korrekt
- [ ] Mobile Ansicht funktioniert perfekt
- [ ] PWA Features funktionieren
- [ ] Performance ist gut
- [ ] Service Worker wird korrekt aktualisiert
- [ ] Cross-Browser Testing (Chrome, Safari, Firefox)

### 6. Merge zu Production
```bash
# Nach erfolgreichem Final Review in main mergen
git checkout main
git pull origin main
git merge staging
git push origin main
```

**Automatisch passiert dann:**
- ✅ GitHub Action wird ausgelöst
- ✅ Web-Build wird erstellt
- ✅ Deployment zu `/` auf GitHub Pages (Production)
- ✅ Verfügbar unter: https://s540d.github.io/1x1_Trainer/

## 🔄 GitHub Actions Workflows

### ci-cd.yml
Läuft bei jedem Push auf `main`, `staging`, `testing` und `develop`:
- Code Quality & Linting
- Console.log Check
- Web API Platform Safety Check
- TypeScript Compilation
- Build Verification

**Trigger:** `push` zu `main`, `staging`, `testing` oder `develop`, `pull_request`

### deploy.yml
Deployment der Production Version auf GitHub Pages:
- Erstellt Web-Build
- Deployed zu `/` (root)

**Trigger:** `push` zu `main`

### deploy-testing.yml
Deployment der Testing Version auf GitHub Pages:
- Erstellt Web-Build
- Fügt Testing-Marker hinzu
- Deployed zu `/testing/` (Subdirectory)
- Setzt `base href="/1x1_Trainer/testing/"`

**Trigger:** `push` zu `testing`

### deploy-staging.yml (Neu)
Deployment der Staging Version auf GitHub Pages:
- Erstellt Web-Build
- Fügt Staging-Marker hinzu
- Deployed zu `/staging/` (Subdirectory)
- Pre-Production Final Review Environment

**Trigger:** `push` zu `staging`

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

## 🚀 Release-Prozess (3-Stufen-Modell)

1. **Feature Development** → `feature/xyz` Branch
2. **Lokales Testen** → `npm run web` und `npm run build:web`
3. **Testing Deployment** → Push zu `testing` Branch
4. **Development Testing** → Entwickler testet auf `/testing/`
5. **Staging Deployment** → Merge zu `staging` Branch
6. **Final Review** → Partner/Endnutzer testet auf `/staging/`
7. **Production Release** → Merge zu `main` Branch
8. **Monitor** → Feedback und Fehlerberichterstattung

## 🔍 URLs

| URL | Umgebung | Status | Zweck |
|-----|----------|--------|-------|
| https://s540d.github.io/1x1_Trainer/ | Production | ✅ Live | Stabile Version für Endnutzer |
| https://s540d.github.io/1x1_Trainer/staging/ | Staging | ✅ Live | Pre-Production Final Review |
| https://s540d.github.io/1x1_Trainer/testing/ | Testing | ✅ Live | Development Testing |

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
- Features sollten lokal getestet sein
- Falls Konflikte: `git merge --abort` und manuell auflösen

### Beim Merge zu Staging
- `staging` sollte immer von `testing` kommen
- Alle Features müssen auf `testing` erfolgreich sein
- Sicherstellen, dass testing-Deployment fehlerfrei war

### Beim Merge zu Production
- **NUR von `staging` nach `main` mergen!**
- Sicherstellen, dass staging erfolgreich deployed und getestet wurde
- Nur stabile, mehrfach getestete Features mergen
- Nach Release Git Tag erstellen: `git tag v1.0.x`
- **NIEMALS** direkt von `testing` nach `main` mergen!

### Branch-Namen
- Features: `feature/description`
- Bugfixes: `fix/description`
- Hotfixes: `hotfix/description`

## 🔐 Branch Protection Rules

Die `main` Branch hat folgende Protection Rules:
- Requires pull request reviews ✅
- Requires status checks to pass ✅
- Requires branches to be up to date ✅

## 💡 Warum 3 Stufen?

**1x1 Trainer hat die meisten aktiven Nutzer** - daher maximale Vorsicht!

- **Testing**: Schnelle Iteration, Entwickler-Tests, kann instabil sein
- **Staging**: Pre-Production, Partner/Endnutzer-Tests, muss stabil sein
- **Main**: Production, nur mehrfach getestete Features, maximale Stabilität

**Regel:** Niemals direkt von `testing` nach `main`! Immer über `staging`!

---

**Zuletzt aktualisiert:** 2026-01-23
**Version:** 1.0.14
