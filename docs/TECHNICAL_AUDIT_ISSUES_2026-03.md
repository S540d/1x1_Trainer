# Technical Updates & Maintenance Audit – Sammelbericht (Stand: 2026-03-10)

Dieser Bericht fasst drei **Issue-Entwürfe** zusammen, damit sie direkt in den jeweiligen Repositories angelegt oder aktualisiert werden können.

---

## 1) Issue-Entwurf: Eisenhauer

**Titel:** 📋 Technical Updates & Maintenance Audit - Eisenhauer (Q1 2026)

```md
# Technical Updates & Maintenance Audit - Eisenhauer

## Project Status: STABLE ✅

Audit-Snapshot vom 2026-03-10.

### Dependencies Status
- Vite 7.3.1
- Vitest 4.0.18
- Playwright 1.58.2
- ESLint 9.39.2
- Firebase 12.9.0

### Technical Status
#### Architektur
✅ Moderne Vite-PWA Architektur  
✅ Getrennte Skripte für Build/Test/Lint/Format vorhanden  
✅ E2E- und Unit-Test-Setup vorhanden  
✅ Node 20+ als Basis definiert

#### Known Issues Tracking (aktuell offen, Beispiele)
1. **#241** Splash screen
2. **#233** ESLint 10 Upgrade / Audit-Follow-up
3. **#179** App aufwerten (Produkt-/UX-Erweiterungen)

### Recommended Enhancements
1. **Dependency Hardening** (MEDIUM)
   - ESLint 10 Migration inkl. Regel-Folgen testen
   - npm audit Findings nach Upgrade erneut bewerten
2. **UX & Produktdifferenzierung** (MEDIUM)
   - Fokus auf priorisierte Smart-Features aus #179
3. **Release-Hygiene** (LOW)
   - Build/Deploy-Skripte ohne lokale Git-Sequenzen für CI vereinheitlichen

### Next Steps
1. #233 umsetzen und Toolchain validieren (lint/test/e2e)
2. Splash-Screen-Thema (#241) priorisiert abschließen
3. Produkt-Backlog aus #179 in umsetzbare Teil-Issues aufteilen

---
**Confidence Level**: MEDIUM-HIGH
```

---

## 2) Issue-Entwurf: 1x1 Trainer

**Titel:** 📋 Technical Updates & Maintenance Audit - 1x1 Trainer (Q1 2026)

```md
# Technical Updates & Maintenance Audit - 1x1 Trainer

## Project Status: UP-TO-DATE ✅

Audit-Snapshot vom 2026-03-10.

### Dependencies Status
- React 19.1.0
- React Native 0.81.5
- Expo 54.0.33
- TypeScript 5.9.2
- Playwright 1.58.2

### Technical Status
#### Architektur
✅ Clean component structure  
✅ Hooks-basiertes Game-Design (useTheme, usePreferences, useGameLogic)  
✅ i18n aktiv (DE/EN)  
✅ PWA/Web-Deployment vorhanden  
✅ Jest-Testabdeckung für Kernlogik vorhanden

#### Known Issues Tracking (aktuell offen, Beispiele)
1. **#108** High Score Banner bei Gleichstand
2. **#100** UX-Verbesserung Challenge-Modus & Design-Modernisierung
3. **#96** App umbenennen
4. **#8** Screenshots im Playstore aktualisieren

### Recommended Enhancements
1. **Accessibility** (MEDIUM)
   - Fokus-Indikatoren, Screenreader-Fluss, keyboard-only Pfade
2. **UI/UX Polish** (MEDIUM)
   - Abschluss der laufenden Challenge/UI-Verbesserungen (#100)
3. **Release Assets** (LOW-MEDIUM)
   - Play Store Screenshots + Benennung konsistent aktualisieren

### Next Steps
1. Bug #108 schließen
2. #100 in lieferbare Teilpakete schneiden (UI, Animation, Challenge-Feinschliff)
3. Store-Assets und App-Naming in einem Release-Zyklus bündeln (#8, #96)

---
**Confidence Level**: HIGH
```

---

## 3) Issue-Entwurf: Pflanzkalender

**Titel:** 📋 Technical Updates & Maintenance Audit - Pflanzkalender (Q1 2026)

```md
# Technical Updates & Maintenance Audit - Pflanzkalender

## Project Status: STABLE ✅

Audit-Snapshot vom 2026-03-10.

### Dependencies Status
- Expo ~54.0.12
- React 19.1.0
- React Native 0.81.4
- TypeScript ~5.9.2
- Firebase 12.3.0

### Technical Status
#### Architektur
✅ Cross-platform Expo Stack  
✅ Navigation-Struktur mit React Navigation  
✅ Firebase-Integration vorhanden  
✅ Release/Deploy-Skripte vorhanden

#### Known Issues Tracking (aktuell offen, Beispiele)
1. **#43** „Pflanzen zurückschneiden“ hinzufügen
2. **#40** Ko-fi Link aktualisieren
3. **#39** Android 15 / Edge-to-Edge Relevanz prüfen
4. **#2** Suchfunktion für Pflanzen

### Recommended Enhancements
1. **Android 15 Readiness** (MEDIUM-HIGH)
   - #39 technisch validieren und SDK/Window-Verhalten sauber absichern
2. **Core UX Features** (MEDIUM)
   - Pflanzensuche (#2) und Aktivitäts-Handling priorisieren
3. **Content & Monetization Hygiene** (LOW)
   - Externe Links/Metadaten (z. B. #40) konsistent halten

### Next Steps
1. #39 priorisiert klären (kompatibel/nicht betroffen) und dokumentieren
2. #2 als nächstes Produkt-Feature planen
3. Kleine Content-/Pflege-Issues (#40, #43) als schnelle Verbesserungen abschließen

---
**Confidence Level**: MEDIUM
```
