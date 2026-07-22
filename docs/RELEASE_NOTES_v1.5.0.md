# Release Notes v1.5.0 (versionCode 32)

> Aufhänger: **Lernreise / Reihen-Meisterschaft** (Issue #277 1a, PRs #281/#284/#285).
> Play-Store-„Was ist neu" max. 500 Zeichen, kein „diverse Verbesserungen" (siehe `RELEASE_NOTES_TEMPLATE.md`).
> Keine Gedankenstriche „–"/„--" (ASO-Policy, siehe `docs/private/PLAY_STORE_METADATA_DE.md`).

## Für Play Store (Deutsch, 417 Zeichen)

```
🗺️ Version 1.5.0: die Lernreise ist da!

Neu: ein strukturierter Lernpfad durch alle Malreihen von 1 bis 12.

• Jede Reihe mit eigenem Abschlusstest freispielen
• Bronze, Silber oder Gold als Belohnung sammeln
• Malreihen-Landkarte zeigt deinen Fortschritt
• Neuer Begrüßungsschirm führt Kinder Schritt für Schritt hinein

Dazu Fehlerkorrekturen und Stabilitätsverbesserungen. Viel Spaß beim Meistern der Malreihen! 🧮
```

## Für Play Store (Englisch, 387 Zeichen)

```
🗺️ Version 1.5.0: the Learning Journey is here!

New: a structured learning path through every times table from 1 to 12.

• Unlock each row with its own final test
• Collect Bronze, Silver, or Gold as your reward
• A times tables map shows your progress
• A new welcome screen guides kids in step by step

Plus bug fixes and stability improvements. Have fun mastering the times tables! 🧮
```

## Für GitHub Release (ausführlich)

```markdown
# 1x1 Trainer v1.5.0

## 🗺️ Lernreise / Reihen-Meisterschaft (NEU)

Das große Feature dieses Releases: ein strukturierter Lernpfad durch das Einmaleins.

- **Malreihen-Landkarte 1 bis 12**: jede Reihe schaltet die nächste frei
- **Abschlusstest pro Reihe**: 10 Aufgaben mit gemischten Faktoren
- **Bronze, Silber, Gold**: Belohnung je nach Testergebnis (Gold = 10/10, Silber ab 8/10, Bronze ab 6/10)
- **Begrüßungsschirm**: führt neue Kinder Schritt für Schritt in die Lernreise ein
- **Eltern-Dashboard**: Lernreise-Fortschritt einsehbar und zurücksetzbar

Jede Testantwort fließt weiterhin in die bestehende Aufgaben-Statistik ein, sodass
Übungsmodus und die Genauigkeit-pro-Malreihe im Eltern-Dashboard automatisch profitieren.

## 🐛 Bugfixes & Stabilität

- Splash-Screen und Lernreise-Fortsetzen-Routing korrigiert
- Lernreise-Aufgaben laufen in der normalen Spielansicht statt in verschachteltem Modal
- Review-Findings aus #290 behoben (stale Lernreise-Row, Storage-Race, Dashboard-Reihenzahl)

## 📱 Technische Details

- **Android versionCode**: 32
- **App-Version**: 1.5.0
- **Expo SDK**: 57 (React Native 0.86)

## 📥 Download

- [Play Store](https://play.google.com/store/apps/details?id=com.sven4321.trainer1x1)
- [Web Version](https://s540d.github.io/1x1_Trainer/)
```
