# Android App Links für 1x1 Trainer

## Status: ✅ Verifiziert

Die Android App Links für den 1x1 Trainer sind korrekt konfiguriert und vom Play Store verifiziert.

## Zentrale Verwaltung

Die `assetlinks.json` wird **zentral** im Root-Repository verwaltet:

**Repository:** [S540d.github.io](https://github.com/S540d/S540d.github.io)
**Live URL:** https://s540d.github.io/.well-known/assetlinks.json

## Konfiguration

### App-Details
- **Package Name:** `com.sven4321.trainer1x1`
- **SHA-256 Fingerprint:** `C9:B7:5C:A8:F4:23:48:5D:D6:E3:87:EB:9A:13:5B:4F:B8:24:A4:AE:E5:56:9C:58:56:E6:E6:AE:73:C4:BB:78`

### Intent Filter (app.json)
```json
{
  "android": {
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
```

## Wichtig

⚠️ **Keine lokale assetlinks.json mehr!**

Die `public/.well-known/assetlinks.json` wurde entfernt, da Android App Links die Datei immer am **Root der Domain** suchen (`https://s540d.github.io/.well-known/assetlinks.json`), nicht im Subpath.

## Bei Änderungen

Falls der SHA-256 Fingerprint aktualisiert werden muss:

1. Gehe zu [S540d.github.io Repository](https://github.com/S540d/S540d.github.io)
2. Bearbeite `.well-known/assetlinks.json`
3. Aktualisiere den Fingerprint für `com.sven4321.trainer1x1`
4. Commit und Push (GitHub Pages deployed automatisch)

## Verifizierung testen

```bash
# assetlinks.json abrufen
curl https://s540d.github.io/.well-known/assetlinks.json

# Deep Link testen (mit adb)
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://s540d.github.io/1x1_Trainer" \
  com.sven4321.trainer1x1
```

## Weitere Infos

Siehe [Eisenhauer/ANDROID_APP_LINKS.md](../Eisenhauer/ANDROID_APP_LINKS.md) für eine umfassende Anleitung zu Android App Links.
