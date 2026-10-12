# 1x1 Trainer – Projektdokumentation für Claude

> **Zwei-Schichten-Dokumentation:**
> Diese Datei ist öffentlich im Repo. Sensible Infos (Keystore, Gerät-IDs, Secrets) liegen in `docs/private/CLAUDE.md` (gitignored, nur lokal).
> **Telefon-Workflow:** Notizen vom iPhone ans Ende dieser Datei schreiben → am Mac in die richtige Schicht einsortieren.

---

## Branch-Workflow

```
feature/issue-XXX → testing → main
```

`staging` wurde entfernt (2026-06-03, Issue #7).

| Branch              | Zweck                            |
| ------------------- | -------------------------------- |
| `main`              | Produktion (protected)           |
| `testing`           | Integration neuer Features/Fixes |
| `feature/issue-XXX` | Kurzlebige Feature-Branches      |

- PRs immer gegen `testing` öffnen, nicht `main`
- `gh pr merge <nr> --squash --delete-branch` für Feature→testing PRs
- `gh pr merge <nr> --squash` für testing→main (kein `--delete-branch`!)
- **Vor Push:** lokale Tests ausführen (`npm test`)
- **Kein Merge bei CI-Fail**

## Merge-Workflow (PR → staging → main)

```bash
gh pr merge <nr> --squash --delete-branch
git checkout main && git merge staging && git push origin main
git checkout staging && git merge main && git push origin staging
git checkout testing && git merge main && git push origin testing
git checkout main
```

---

## Versionsbump-Checkliste

Beim Erhöhen der Version IMMER alle drei Stellen aktualisieren:

1. `package.json` → `version`
2. `app.json` → `expo.version` + `android.versionCode` (+1)
3. `utils/constants.ts` → `APP_VERSION`

→ Wird `constants.ts` vergessen, schlägt der CI-Check "version consistency" fehl.
→ Skript: `./scripts/bump-version.sh patch|minor|major`

**bump Input bei CI:** IMMER `none` verwenden — Branch Protection blockiert Bot-Pushes auf `main`.

---

## Build-Workflow (Übersicht)

- **APK (Test):** Lokaler Build wieder lauffähig seit expo-audio-Migration (Issue #214, PR #215). **Wichtig: JDK 17 verwenden** (`export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home`) — Default-Java ist 21/25 und bricht den Gradle-Build. Alternativ per GitHub Actions: `gh workflow run build-android.yml --ref testing -f profile=preview -f bump=none`
- **Lokaler AAB mit Store-Paketname:** `APP_PACKAGE=com.sven4321.trainer1x1 npx expo prebuild --platform android --clean && cd android && ./gradlew bundleRelease` — `app.config.js` injiziert den Paketnamen automatisch (Issue #233, PR #244 ✅)
- **AAB (Play Store):** GitHub Actions → `Build Android` → profile: `production`
- Workflow: `.github/workflows/build-android.yml`

---

## Testing

```bash
npm test              # Jest
npm run test:watch    # Watch-Modus
npm run test:coverage # Coverage
```

- Test-Runner: Jest + jsdom
- React Native → React Native Web (via `moduleNameMapper`)
- `@testing-library/react` (nicht react-native)
- `window.getComputedStyle` funktioniert für RN-Styles (jsdom + RNW)

**Coverage-Schwellen (Stand 2026-09-08):** statements 88 / branches 83 / functions 83 / lines 89 — nach dem `App.tsx`-Split angehoben (Issue #357 Punkt 1), da die ausgelagerte Logik jetzt in `hooks/`/`utils/` liegt und damit in `collectCoverageFrom` fällt. `App.tsx` selbst wird weiterhin nicht gemessen — **Logik, die aus `App.tsx` in Hooks wandert, braucht deshalb eigene Tests**, sonst fällt die globale Coverage.

### Jest-Konfiguration — Fallstricke

- `expo-linear-gradient`, `expo-font`, `expo-status-bar`, `expo-av`, `@expo-google-fonts` müssen in `transformIgnorePatterns` **und** `moduleNameMapper` eingetragen sein
- Neue Expo-Pakete immer in **beiden** Listen ergänzen
- Binäre Assets (`.wav`, `.mp3` etc.) brauchen `moduleNameMapper`-Eintrag → `__mocks__/fileMock.js` (gibt `1` zurück)

---

## Aktueller Stand (2026-09-27)

- Version: **1.7.0** / versionCode 36 (noch nicht im Play Store; zuletzt veröffentlicht: 1.6.0 / 35, Stand 2026-09-05)
- Release-Historie: `CHANGELOG.md`; Merge-Historie: `git log`
- Offene Issues (Details in GitHub): #276 (Rest), #277 (Rest), #292, #294, #295, #296 (Rest), #325
- Diagnostizierte, bereits gelöste Vorfälle (Kalendereintrags-Generator #382, WelcomeScreen-Redesign #380, CI-Break #368/#369, Code-Audit #357, R8/ProGuard-Bestätigung u. a.): `docs/private/INCIDENTS.md`

---

## Wichtige Dateien

| Datei                                | Inhalt                                                                                                                                                                                                                                                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `utils/constants.ts`                 | THEME_COLORS, DESIGN_TOKENS (inkl. `RADIUS_SM/MD/LG/XL` = 8/12/16/24 für `borderRadius`, `SPACING_XS/SM/MD/LG/XL/XXL` = 4/8/12/16/20/24 für `padding`/`margin`/`gap` — statt Literale verwenden), STORAGE_KEYS, CHALLENGE_LEVELS, `THEMES` (alle 5 Farbthemes mit LIGHT/DARK-Varianten)               |
| `utils/theme.ts`                     | `getThemeColors(isDarkMode, themeName?)` — themeName optional, Default `'sunset'`                                                                                                                                                                                                                     |
| `utils/storage.ts`                   | Storage-Helfer + Profile-Management (`migrateToProfiles`, `createProfile`, `deleteProfileData`, `getProfiles`/`saveProfiles`, `setActiveProfileId`). Alle per-Profil-Funktionen haben optionalen `profileId?`-Parameter (Suffix-Pattern `{key}-{profileId}`). `profileKey()` / `resolveKey()` intern. |
| `utils/animations.ts`                | `prefersReducedMotion()` — liest Accessibility-Einstellung                                                                                                                                                                                                                                            |
| `types/game.ts`                      | ThemeColors (inkl. `gradientPrimary`), GameState (inkl. `answerHistory`), Enums, SessionRecord (inkl. optionalem `durationMs`), `ThemeName`, `ChildProfile`, `RowMastery`/`RowMasteryStatus`                                                                                                          |
| `i18n/translations.ts`               | DE/EN Übersetzungen, `TranslationStrings`-Interface (inkl. 12 Profil-Strings)                                                                                                                                                                                                                         |
| `hooks/useGameLogic.ts`              | Gesamte Spiellogik, `onSessionComplete`-Callback                                                                                                                                                                                                                                                      |
| `hooks/usePreferences.ts`            | `usePreferences(profileId?)` — globale Prefs (Sprache, Theme, Sounds) + per-Profil-Prefs (Operations, NumberRange, TotalTasks, HighScore); lädt per-Profil-Daten neu bei Profilwechsel                                                                                                                |
| `hooks/useBadges.ts`                 | `useBadges(profileId?)` — Badge-Lesen/Schreiben auf aktives Profil beschränkt                                                                                                                                                                                                                         |
| `hooks/useSounds.ts`                 | Sound-Hook: `playSound(event)` — Web: AudioContext-Oszillatoren, Native: expo-audio (`createAudioPlayer`) + WAV-Assets                                                                                                                                                                                |
| `assets/sounds/`                     | WAV-Assets: correct / incorrect / perfect / level_up / badge_unlock (je 8–17 KB)                                                                                                                                                                                                                      |
| `scripts/generate-sounds.js`         | Generator für WAV-Assets (`node scripts/generate-sounds.js`)                                                                                                                                                                                                                                          |
| `components/PersonalizeModal.tsx`    | Aussehen-Modal (Light/Dark/System, Farbtheme-Picker, Sprache, Sound An/Aus + Lautstärke)                                                                                                                                                                                                              |
| `components/ParentDashboard.tsx`     | Eltern-Dashboard Modal (seit PR #279 kein „(Beta)"-Label mehr) inkl. Wochenrückblick (Trend, Übungszeit, Genauigkeit pro Malreihe, Übungsempfehlung), `ReminderPlannerCard` (Kalendereintrags-Generator) und freundlichem Empty-State                                                                 |
| `components/ReminderPlannerCard.tsx` | Kalendereintrags-Generator im Eltern-Dashboard (PR #382, Issue #381): Uhrzeit-/Taktungs-Chips, `Platform.OS`-Split (Web: ICS-Blob-Download, Native: Google-Calendar-Deeplink)                                                                                                                         |
| `utils/calendarReminder.ts`          | Reine Hilfsfunktion `buildReminderPlan()`: baut aus Uhrzeit/Taktung ein `RRULE` sowie ICS-Inhalt und Google-Calendar-Quick-Add-URL — Issue #381                                                                                                                                                       |
| `components/ProfilePickerModal.tsx`  | Bottom-Sheet-Modal für Profilauswahl/-erstellung/-löschung (max. 6 Profile, Farbauswahl, Bestätigungs-Alert bei Löschen)                                                                                                                                                                              |
| `components/GameScreen.tsx`          | Spielbildschirm (PR zu Issue #357 Punkt 1): bündelt Header, Einstellungs-Slide-Panel, `GameCard` und `ResultModal`; reine Präsentation, aller State kommt per Props aus `App.tsx`                                                                                                                     |
| `components/ModalHost.tsx`           | Sammelstelle für alle App-Overlays, die am `useModals()`-Slot hängen (inkl. `BadgeUnlockToast`) — Issue #357 Punkt 1                                                                                                                                                                                  |
| `components/StreakWarningModal.tsx`  | Abend-Warnung bei gefährdeter Streak, 1:1 aus dem Inline-Modal in `App.tsx` ausgelagert — Issue #357 Punkt 1                                                                                                                                                                                          |
| `hooks/useProfileData.ts`            | Profilliste + alle profilbezogenen Ladevorgänge (TaskStats, Streak, `roundsToday`), inkl. `switchProfile`/`applyProfilesChange` und dem `activeProfileIdRef` gegen Stale Closures — Issue #357 Punkt 1                                                                                                |
| `hooks/useAppGame.ts`                | Verdrahtung von `useGameLogic` mit Persistenz und Feedback (SessionRecord, Streak-Update, Badges, TaskStats, Lernreise-Ergebnis) — Issue #357 Punkt 1                                                                                                                                                 |
| `hooks/useSlideMenu.ts`              | Slide-/Fade-Animation des Einstellungsmenüs inkl. Reduced-Motion-Kurzschluss — Issue #357 Punkt 1                                                                                                                                                                                                     |
| `hooks/useAnswerFeedback.ts`         | Sounds (richtig/falsch, Badge, Level-Up) + Karten-Animation (Scale/Shake) — Issue #357 Punkt 1                                                                                                                                                                                                        |
| `hooks/useGameKeyboard.ts`           | Physische Tastatur im Web (#258) auf Spielaktionen gemappt — Issue #357 Punkt 1                                                                                                                                                                                                                       |
| `utils/taskStats.ts`                 | `mergeTaskStat()` — reines In-Memory-Gegenstück zu `recordTaskResult()`, aus dem Inline-Reducer in `App.tsx` extrahiert und unit-getestet — Issue #357 Punkt 1                                                                                                                                        |
| `components/GameCard.tsx`            | Hauptspielansicht (alle 3 Antwortmodi)                                                                                                                                                                                                                                                                |
| `components/Header.tsx`              | Score/Level/Lives, segmentierte `ProgressBar`, Durchlauf-Zähler (`roundsToday`, ersetzt seit PR #272 die Streak-Flamme)                                                                                                                                                                               |
| `components/ProgressBar.tsx`         | 10 Segmente statt Gradient-Fill; `history: (boolean \| null)[]` → grün/rot/grau pro Aufgabe                                                                                                                                                                                                           |
| `components/LernreiseModal.tsx`      | Lernreise / Reihen-Meisterschaft (PR #281, Issue #277 1a): Malreihen-Landkarte + Abschlusstest pro Reihe (Numpad/ProgressBar wiederverwendet) + Bronze/Silber/Gold-Ergebnis                                                                                                                           |
| `components/SettingsMenu.tsx`        | Hauptmenü (PR #345, Issue #343): nur noch zweispaltiges Top-Button-Grid (Personalisieren, Eltern-Dashboard, Abzeichen, Profile, Lernreise, „Aufgaben einstellen"), Feedback/Support/About, Reset-Onboarding. Enthält keine Rechenart/Schwierigkeit/Zahlenbereich-Logik mehr.                          |
| `components/TaskSettingsModal.tsx`   | Neue Unterseite „Aufgaben einstellen" (PR #345, Issue #343): Rechenart/Schwierigkeit/Zahlenbereich, 1:1 aus `SettingsMenu.tsx` ausgelagert, per Button dort erreichbar                                                                                                                                |
| `components/WelcomeScreen.tsx`       | Begrüßungsbildschirm (PR #345, Issue #343; Redesign PR #380, Issue #379): wird bei jedem App-Start vor dem Spiel gezeigt, 3 große Gradient-Kacheln (Lernreise-Übersicht, direkte Malreihen-Auswahl → beide öffnen `LernreiseModal`, Herausforderungsmodus) + Hinweis-Chip auf „Aufgaben einstellen"   |
| `plugins/withResizeableActivity.js`  | Lokales Expo-Config-Plugin (PR #280, Issue #275): setzt `android:resizeableActivity="true"` im generierten `AndroidManifest.xml`, da `android/` nicht versioniert wird                                                                                                                                |
| `styles/modalStyles.ts`              | Gemeinsame Modal-Styles                                                                                                                                                                                                                                                                               |
| `app.config.js`                      | Dynamische Expo-Konfiguration: überschreibt `android.package` via `APP_PACKAGE` env-var (Issue #233); hängt `withResizeableActivity` an die Plugin-Liste an (Issue #275)                                                                                                                              |
| `jest.config.js`                     | Jest-Konfiguration                                                                                                                                                                                                                                                                                    |
| `docs/private/CLAUDE.md`             | Sensible Build/Keystore-Details (gitignored)                                                                                                                                                                                                                                                          |

---

## Architektur-Fallstricke

- **`APP_VERSION` in `utils/constants.ts`** beim Versionsbump leicht vergessen → immer `bump-version.sh` verwenden
- **Animated-Wrapper brauchen flex:** `Pressable` > `Animated.View` → Pressable braucht `style={{ flex: 1 }}`, sonst füllen Buttons in flex-row nicht die Breite
- **Keine Early Returns vor Hooks!** React Error #310 — alle Hooks müssen immer in gleicher Reihenfolge aufgerufen werden
- **fontWeight auf Android:** Nur `'normal'`/`'bold'`/`'400'`/`'700'` verwenden — `'500'`/`'600'` werden auf älteren Geräten nicht interpoliert → Text unsichtbar (Issue #138)
- **elevation + transparent:** Kein `elevation > 0` bei `backgroundColor: 'transparent'` → weißer Kasten auf Android (Issue #138)
- **numpadRow braucht feste Höhe:** `height: 60` + `alignItems: 'stretch'` nötig
- **GameCard Layout:** `justifyContent: 'center'` + `gap: 16` statt `space-between`
- **Deploy Race Condition:** Alle 3 Deploy-Workflows müssen dieselbe `concurrency.group` teilen (`gh-pages-deploy`)
- **Number Sequence Grid:** 2-Spalten-Grid (`width: '48%'`, `flexWrap: 'wrap'`) für kleine Bildschirme
- **Merge-Konflikt staging→main:** temporäre Workflow-Dateien können kollidieren → staging-Version bevorzugen
- **Expo-Pakete in Jest:** Neue Pakete immer in `transformIgnorePatterns` **und** `moduleNameMapper` eintragen
- **expo-audio statt expo-av** (Issue #214 / PR #215): expo-av brach auf SDK 55. **JDK 17 zwingend** für `./gradlew assembleRelease`. Diagnose: `docs/private/INCIDENTS.md`
- **Expo-SDK-Upgrades:** immer in Einzelschritten fahren, nicht `expo install --fix` verlassen (Proxy blockiert `exp.host`). Details: `docs/ARCHITECTURE.md#dependency-upgrades`
- **npm-audit zeigt dauerhaft moderate Findings** (`uuid` transitiv über `@expo/config-plugins`, Issue #276) — kein App-Code betroffen. Diagnose: `docs/private/INCIDENTS.md`
- **`android/` ist nicht versioniert** — Manifest-Änderungen nur über Expo-Config-Plugins (`plugins/withResizeableActivity.js`). Details: `docs/ARCHITECTURE.md#android-config-plugins`

---

## Feature-Hinweise

Detaildokumentation zu Eltern-Dashboard, Kalendereintrags-Generator,
Streak-Tracker, Fortschrittsbalken/Durchlauf-Zähler, Adaptivem Lernen
(PRACTICE), Lernreise/Reihen-Meisterschaft und visuellen Themes steht
vollständig in `docs/ARCHITECTURE.md#feature-notes` (ausgelagert, Issue
#160). Storage-Keys als Schnellreferenz:

- Eltern-Dashboard: keine eigenen Keys (aggregiert `SessionRecord`/`TaskStat`)
- Kalendereintrags-Generator: kein Storage (reiner Export ICS/Deeplink)
- Streak-Tracker: `app-streak`
- Fortschrittsbalken/Durchlauf-Zähler: kein Storage (Ableitung aus SessionRecords)
- Adaptives Lernen (PRACTICE): `app-task-stats`
- Lernreise: `app-row-mastery`
- Visuelle Themes: `app-theme-name`

---

## Offene TODOs / Bekannte Einschränkungen

- ✅ **expo-av → expo-audio Migration erledigt** (Issue #214 / PR #215) — lokaler Build wieder lauffähig (mit JDK 17)
- ✅ **Paketname-Diskrepanz gelöst** (Issue #233 / PR #244) — `app.config.js` mit `APP_PACKAGE` env-var
- ✅ **Orientation auf `"default"` gesetzt** (Issue #235 / PR #243) — Tablet/Foldable Landscape-Support
- ✅ **Prettier + pre-push Hook** (Issue #220 / PR #246) — einheitliches Code-Formatting
- ✅ **Mehrere Kinderprofile** (Issue #187 / PR #247) — bis zu 6 Profile, je eigene Spieldaten
- ✅ **Wochenrückblick + Empty-States im Eltern-Dashboard** (Issue #277 1d/2d / PR #279) — „(Beta)"-Label entfernt
- ✅ **Large-Screen-Kompatibilität `resizeableActivity`** (Issue #275 / PR #280) — Code-Fix erledigt, letzter Schritt (Neubuild + AAB-Upload an den Play Store) bleibt manuell
- ✅ **Lernreise / Reihen-Meisterschaft** (Issue #277 1a / PR #281) — Malreihen-Landkarte mit Bronze/Silber/Gold
- Größere Dependency-Updates verschoben: react-native 0.84, react 19.2.4, async-storage 3.x
- Reanimated wurde durch `Animated` core ersetzt (Web-Kompatibilität) — Issue #131

## Sound-Effekte / Mehrere Kinderprofile

Detaildokumentation vollständig in `docs/ARCHITECTURE.md#feature-notes`
(ausgelagert, Issue #160). Storage-Keys als Schnellreferenz:

- Sounds: `app-sounds-enabled` / `app-sounds-volume`; native via `expo-audio`, Web via `AudioContext`
- Profile: `app-profiles` / `app-active-profile-id`; Suffix-Pattern `{key}-{profileId}` für alle per-Profil-Daten, max. 6 Profile
- Kein Firebase/Crashlytics mehr (entfernt 2026-10-04) — Absturzdaten liefert Android Vitals in der Play Console; Datenschutzerklärung sagt „keine Crash-Reports, kein Firebase“, nicht wieder einführen ohne sie anzupassen

<!-- GLOBAL POLICY:START -->

## [GLOBAL POLICY]

> Automatisch synchronisiert aus project-templates (Issue #7). Nicht manuell editieren –
> Änderungen hier werden beim nächsten Sync überschrieben. Quelle anpassen statt lokal.

- PRs immer gegen `testing`, nie direkt gegen `staging` oder `main`
- Merge auf `main` nur mit expliziter schriftlicher Freigabe
- `--delete-branch` nur für Feature-Branches (nie staging/testing)
- **Lokales Branch-Cleanup:** `main` und `testing` NIE löschen — auch nicht beim Bulk-Delete verwaister `[gone]`-Branches. Ein fehlender `origin/main`/`origin/testing` ist ein **wiederherzustellender Defekt** (lokal behalten, nach origin zurückpushen), kein Aufräum-Signal.
- `--no-verify` nur auf explizite Bitte
- **Vor jedem Push: lokale Tests ausführen** (`npm test` bzw. projektspezifischer Test-Befehl) – kein Push ohne grüne lokale Tests
- **Kein Merge bei CI-Fail** – Branch Protection erzwingt das technisch; nie mit `--admin` umgehen außer auf explizite Bitte
- **Zugehöriges Issue beim Merge schließen** (Issue #111): `Closes #X` im PR-Body greift nur beim Merge in den Default-Branch (`main`) — bei PRs nach `testing` also **nie**. Das Issue nach dem Merge manuell schließen (`gh issue close <N> -c "Umgesetzt in #<PR>, gemergt nach \`testing\`."`), sonst bleiben erledigte Issues offen liegen. Ausnahme: Sammel-/Meta-Issues, die ein Teil-PR nur anteilig abarbeitet — die bleiben offen. `Closes #X` trotzdem im PR-Body lassen: es erzeugt die sichtbare Verknüpfung.

## [ANDROID BUILD – PFLICHTREGELN]

- **Git-Tag** nach jedem Play-Store-Upload setzen: `git tag vX.Y.Z && git push origin vX.Y.Z` – der Tag markiert den tatsächlich veröffentlichten Stand und dient als Changelog-Baseline für den nächsten Build
- **EAS Local Build (DrawFromMemory):** Workingdir vor jedem Build leeren: `rm -rf ~/tmp/eas-build && mkdir -p ~/tmp/eas-build` – ein nicht-leeres Verzeichnis bricht den Build sofort ab
- **Disk-Check vor EAS Build:** Skia-Libraries benötigen ~5–8 GB. Bei < 5 GB frei: `npm cache clean --force && rm -rf ~/.npm/_npx` (~13 GB, sicher löschbar)
- **JAVA_HOME** für EAS/Expo-Builds explizit auf Android Studio JBR setzen: `export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"`
- **Gradle-Lock nach Absturz:** Bei "Cannot lock file hash cache"-Fehler Daemons stoppen: `pkill -f GradleDaemon`, dann Workingdir leeren und neu starten
- **AAB-Archiv:** Gebaute Release-AABs in einem **gitignored** `aab-archive/`-Verzeichnis im Repo-Root ablegen (in `.gitignore` aufnehmen – AABs sind 3–110 MB und gehören nie in die Git-History). Benennung: `<Projekt>-vX.Y.Z-vc<versionCode>-YYYY-MM-DD.aab`. **Retention: max. 2 Dateien** (aktuelles Release + ein Vorgänger für schnelles Rollback); ältere AABs löschen. Der Git-Tag `vX.Y.Z` ist die eigentliche Release-Baseline – ältere AABs lassen sich daraus jederzeit neu bauen.

## [CLAUDE.MD-WARTUNG]

- **CLAUDE.md bleibt bei maximal 300 Zeilen** (Issue #160): Sie wird bei jeder Session vollständig in den Kontext geladen. Beschreibt ein Abschnitt einen konkreten Vorfall, gehören maximal 2-3 Zeilen (Kernregel + kurzer Auslöser-Kontext) + ein Link auf `docs/private/INCIDENTS.md` hinein; aktuell gültiges Architektur-/Prozesswissen, das kein Vorfall ist, aber zu ausführlich für CLAUDE.md, gehört in versionierte `docs/*.md`-Dateien (z. B. `docs/ARCHITECTURE.md`). Die Schwelle ist ein Prüf-Auslöser, kein Zwang, bewusst dort gehaltenes, aktuelles Architekturwissen aus CLAUDE.md zu verdrängen. Aktiv gekürzt wird erst ab 500 Zeilen; Dateien zwischen 300 und 500 Zeilen werden im Turnus nicht angefasst. Ausführlicher Prozess, Checkliste und Stand pro Projekt: https://github.com/S540d/project-templates/blob/main/dev-standards/claude-md-maintenance.md
- **`docs/private/INCIDENTS.md` ist bewusst gitignored** — reine lokale Gedächtnisstütze wie Memory, kein Teil des geteilten Repo-Zustands. In jedem Projekt mit dieser Datei muss `.gitignore` einen Eintrag `docs/private/` enthalten; existiert die Datei bereits versioniert (z. B. als `docs/INCIDENTS.md`), gehört sie nach `docs/private/` verschoben und per `git rm --cached` aus dem Tracking genommen.
- **Regelmäßig `/simplify` auf CLAUDE.md ausführen**, nicht nur einmalig beim Überschreiten der Schwelle — Ziel ist dauerhaft niedriger Token-Verbrauch pro Session statt zyklischem Anwachsen und Zurückkürzen in großen Sprüngen.

## [CODE HEALTH AUDIT]

- **Wiederkehrendes Code-Health-Audit** (Ballast/Architektur: God Components, Boilerplate-Duplikation, toter Code, Dependency-Bloat, Test-Integrität, Design-Konsistenz, Bundle-Größe) alle ~3 Monate oder ~15 gemergte Feature-PRs (je nachdem was zuerst eintritt). Checkliste + Ablauf: https://github.com/S540d/project-templates/blob/main/dev-standards/code-health-audit.md — Ergebnis ist immer ein Issue im jeweiligen Projekt-Repo, nie in project-templates.

## [SIMPLIFY-AUDIT]

- **Wiederkehrender `/simplify`-Durchlauf auf den Quellcode** (Reuse, Simplification, Efficiency, Altitude) alle ~3 Monate oder ~15 gemergte Feature-PRs (je nachdem was zuerst eintritt), gleiche Kadenz wie das Code-Health-Audit. Anders als dieses wendet er die Fixes direkt an: Ergebnis ist ein PR gegen den projektüblichen Ziel-Branch, nur kleine, verhaltensneutrale Refactorings (bei Unsicherheit Finding auslassen). Ablauf: https://github.com/S540d/project-templates/blob/main/dev-standards/simplify-audit.md

## [ÜBER-ABSCHNITT]

- **Einheitlicher „Über"-Abschnitt im Settingsmenü** (Issue #150): Jedes Web-Projekt zeigt „Über" als Eintrag in einem `⋮`-Settingsmenü (kein Footer — wird bei Bedarf neu angelegt, auch für aktuell menülose Projekte). Fester Vollausbau: App-Name, Version, Impressum, Datenschutz, Quellcode, Play Store, Feedback — nicht zutreffende Felder werden weggelassen, nie umsortiert. Spezifikation: https://github.com/S540d/project-templates/blob/main/dev-standards/about-section.md — Umsetzung ist immer ein Issue im jeweiligen Projekt-Repo, nie in project-templates.

## [CI – CACHE-CLEANUP]

- **Cache-Cleanup-Workflow** (`.github/workflows/cache-cleanup.yml`) in jedem Repo mit GitHub-Actions-Caches: löscht wöchentlich (So 03:00 UTC) bzw. on-demand alle Action-Caches älter als der jeweils letzte Lauf. GitHub-Limit ist 10 GB pro Repo – ohne Cleanup laufen Build-Caches (node_modules, Gradle, Expo) voll und verdrängen frische Einträge. Vorlage: `cache-cleanup.yml` in project-templates.

<!-- GLOBAL POLICY:END -->
