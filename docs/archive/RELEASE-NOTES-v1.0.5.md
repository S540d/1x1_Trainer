# Release Notes - Version 1.0.5

**Release Datum:** 14. November 2025
**versionCode:** 6
**Build:** app-release.aab (4.9 MB)

---

## 🎯 Zusammenfassung

Version 1.0.5 fügt **Android App Links** (Deep Linking) hinzu, um die Integration zwischen Web-App und Android-App zu verbessern. Nutzer können nun direkt von Web-Links zur nativen App springen.

---

## ✨ Neue Features

### 🔗 Android App Links (Deep Linking)

**Beschreibung:**
Die App unterstützt jetzt Android App Links, sodass URLs wie `https://s540d.github.io/1x1_Trainer/*` automatisch die native App öffnen, falls installiert.

**Technische Details:**
- **Intent Filter** mit `autoVerify: true` in app.json konfiguriert
- **Digital Asset Links** deployed: https://s540d.github.io/1x1_Trainer/.well-known/assetlinks.json
- **SHA-256 Fingerprint:** `C9B75CA8F423485DD6E387EB9A135B4FB824A4AEE5569C5856E6E6AE73C4BB78` (Upload Key Certificate von Google Play)
- **Verifizierung:** Erfolgt automatisch durch Google Play (bis zu 24 Stunden)

**Vorteile:**
- ✅ Nahtloser Übergang von Web zu App
- ✅ Bessere User Experience
- ✅ Automatische Verifizierung im Play Store
- ✅ Keine manuelle Konfiguration durch Nutzer nötig

**Referenzen:**
- [Android App Links Dokumentation](../Eisenhauer/ANDROID_APP_LINKS.md) (im Eisenhauer-Repository)
- [UX-Richtlinien](~/Documents/Programmierung/Projects/project-templates/ux-vorgaben.md#android-app-links-deep-linking)

---

## 🔧 Technische Änderungen

### App Konfiguration

**app.json:**
```json
{
  "expo": {
    "version": "1.0.5",
    "android": {
      "versionCode": 6,
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "s540d.github.io",
              "pathPrefix": "/1x1_Trainer"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

**Android/app/build.gradle.kts:**
```kotlin
defaultConfig {
    applicationId = "com.sven4321.trainer1x1"
    versionCode = 6
    versionName = "1.0.5"
}
```

### Digital Asset Links

**public/.well-known/assetlinks.json:**
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.sven4321.trainer1x1",
      "sha256_cert_fingerprints": [
        "C9B75CA8F423485DD6E387EB9A135B4FB824A4AEE5569C5856E6E6AE73C4BB78"
      ]
    }
  }
]
```

### Build-Konfiguration

**EAS Build:**
- `eas.json` erstellt mit production/preview/development Profilen
- Projekt verknüpft: [@devsven/1x1-trainer](https://expo.dev/accounts/devsven/projects/1x1-trainer)
- Project ID: `91fd28a6-8da1-4b9b-a8bc-a2b48b70cc33`

**Gradle Build:**
```bash
cd Android
./gradlew clean bundleRelease
```

**Output:**
- Pfad: `Android/app/build/outputs/bundle/release/app-release.aab`
- Größe: 4.9 MB
- Signiert mit: `1x1-trainer-key.keystore`

---

## 📦 Deployment

### GitHub Pages
- ✅ Web-App deployed: https://s540d.github.io/1x1_Trainer/
- ✅ assetlinks.json deployed: https://s540d.github.io/1x1_Trainer/.well-known/assetlinks.json
- ✅ `.nojekyll` File hinzugefügt für korrekte Bereitstellung von `.well-known`

### Google Play Store
- 📤 AAB hochgeladen
- ⏳ Warte auf App Links Verifizierung (bis zu 24 Stunden)
- 🎯 Deep Link Warnung sollte nach Verifizierung verschwinden

---

## 🐛 Bekannte Probleme

### VersionCode Konflikt (BEHOBEN)
**Problem:** Initialer Build mit versionCode 2 wurde vom Play Store abgelehnt mit Fehler:
> "Diese Version kann nicht eingeführt werden, da vorhandene Nutzer kein Upgrade auf die neu hinzugefügten App Bundles durchführen können."

**Ursache:** versionCode 2 war niedriger als die aktuelle Play Store Version (versionCode 5)

**Lösung:** versionCode auf 6 erhöht (höher als alle bisherigen Versionen)

---

## 📊 Version Vergleich

| Aspekt | v1.0.4 | v1.0.5 |
|--------|--------|--------|
| versionCode | 5 | 6 |
| Android App Links | ❌ Nein | ✅ Ja |
| Intent Filters | ❌ Keine | ✅ Mit autoVerify |
| assetlinks.json | ❌ Keine | ✅ Deployed |
| Deep Linking | ❌ Nein | ✅ Ja |
| EAS Build Config | ❌ Keine | ✅ Ja |

---

## 🔐 Sicherheit

**Keystore:**
- Verwendet: `1x1-trainer-key.keystore`
- SHA-256: `A8:A4:28:53:89:4F:40:05:B5:78:89:5E:9E:C8:74:E9:03:E4:C9:31:F5:B3:20:32:CF:08:A2:98:C9:08:0B:88`
- Status: ✅ Gesichert und geschützt

**Upload Key Certificate (Google Play):**
- SHA-256: `C9B75CA8F423485DD6E387EB9A135B4FB824A4AEE5569C5856E6E6AE73C4BB78`
- Verwendet für: App Links Verifizierung

---

## 📚 Dokumentation

**Aktualisierte Dokumente:**
1. [Keystore/README.md](Keystore/README.md) - Version History aktualisiert
2. [RELEASE-NOTES-v1.0.5.md](RELEASE-NOTES-v1.0.5.md) - Dieses Dokument
3. [ANDROID_APP_LINKS.md](~/Documents/Programmierung/Projects/Eisenhauer/ANDROID_APP_LINKS.md) - Umfassende Anleitung (Eisenhauer Repository)
4. [ux-vorgaben.md](~/Documents/Programmierung/Projects/project-templates/ux-vorgaben.md) - UX-Richtlinien aktualisiert (project-templates Repository)

---

## 🚀 Nächste Schritte

1. ✅ AAB im Play Store hochladen
2. ⏳ Warten auf App Links Verifizierung (bis zu 24 Stunden)
3. ✅ Testen der Deep Links nach Verifizierung
4. 📊 Monitoring der Play Store Statistiken

---

## 👥 Credits

**Entwicklung:** S540d
**Build-Tool:** Gradle 8.13
**Signiert mit:** 1x1-trainer-key.keystore
**EAS Project:** [@devsven/1x1-trainer](https://expo.dev/accounts/devsven/projects/1x1-trainer)

---

**Status:** ✅ Release bereit für Deployment
**Build-Datum:** 14. November 2025, 21:54 Uhr
**Build-Dauer:** 8 Sekunden
