# Android Build via GitHub Actions

Dieses Dokument beschreibt den GitHub Actions Build-Workflow für Android (ohne EAS Build).

## Voraussetzungen

### Einmalige Einrichtung: GitHub Secrets

Unter **Settings → Secrets and variables → Actions** folgende Secrets anlegen:

| Secret | Beschreibung | Beispiel |
|---|---|---|
| `ANDROID_KEYSTORE_BASE64` | Keystore als Base64-String | `base64 -i release.keystore` |
| `ANDROID_KEY_ALIAS` | Key Alias im Keystore | `upload` |
| `ANDROID_KEY_PASSWORD` | Passwort des Keys | `secret123` |
| `ANDROID_STORE_PASSWORD` | Passwort des Keystores | `secret123` |

#### Keystore aus EAS exportieren

```bash
# EAS Keystore herunterladen
eas credentials

# Alternativ: Keystore Base64 enkodieren
base64 -i /pfad/zu/keystore.jks | pbcopy   # macOS (in Clipboard)
base64 -i /pfad/zu/keystore.jks            # Linux
```

#### Neuen Keystore erstellen (nur für neue Apps)

> ⚠️ **ACHTUNG:** Ein neuer Keystore erzeugt eine neue App-Signatur.
> Für bestehende Play Store Apps MUSS der gleiche Keystore verwendet werden!

```bash
keytool -genkey -v \
  -keystore release.keystore \
  -alias upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

---

## Workflow ausführen

### Über GitHub Actions UI

1. GitHub → Actions → **Build Android**
2. **Run workflow** klicken
3. Parameter wählen:
   - **Profile:** `production` (AAB für Play Store) oder `preview` (APK zum Testen)
   - **Version bump:** `none` (kein Bump), `patch` (1.2.1 → 1.2.2), `minor` (1.2.1 → 1.3.0)
4. **Run workflow** bestätigen

### Artefakt herunterladen

Nach erfolgreichem Build: Actions → Build → **Artifacts** → AAB/APK herunterladen.

- AAB wird **90 Tage** aufbewahrt
- APK wird **30 Tage** aufbewahrt

---

## Versionsbump

Das Script `scripts/bump-version.sh` aktualisiert alle drei Versionsstellen atomar:

```bash
./scripts/bump-version.sh patch   # 1.2.1 → 1.2.2
./scripts/bump-version.sh minor   # 1.2.1 → 1.3.0
./scripts/bump-version.sh major   # 1.2.1 → 2.0.0
```

Aktualisiert werden:
- `package.json` → `version`
- `app.json` → `expo.version` + `android.versionCode` (+1)
- `utils/constants.ts` → `APP_VERSION`

> CHANGELOG.md muss weiterhin manuell aktualisiert werden.

---

## Vergleich: EAS Build vs. GitHub Actions Build

| | EAS Build | GitHub Actions |
|---|---|---|
| **Kosten** | Kostenpflichtig (nach Free Tier) | GitHub Actions Minuten |
| **Setup** | Minimal | Keystore in Secrets einmalig |
| **Dauer** | ~5-10 min | ~10-15 min |
| **Artefakt** | EAS Dashboard | GitHub Actions Artifacts |
| **Keystore** | EAS verwaltet | Eigene Verantwortung |
| **Versionsbump** | Manuell | Optional automatisch |
| **Offline** | Nein | Nein |

---

## Gradle Signing-Konfiguration

Der Workflow übergibt die Keystore-Parameter via Gradle-Properties (`-P`).
In `android/app/build.gradle` muss folgendes konfiguriert sein (wird durch `expo prebuild` generiert):

```groovy
android {
    signingConfigs {
        release {
            storeFile file(ANDROID_KEYSTORE_PATH)
            keyAlias ANDROID_KEY_ALIAS
            keyPassword ANDROID_KEY_PASSWORD
            storePassword ANDROID_STORE_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

Falls `expo prebuild` diese Konfiguration nicht automatisch erzeugt, muss sie nach dem Prebuild manuell ergänzt werden (einmalig, dann in `.gitignore`-Ausnahme aufnehmen).
