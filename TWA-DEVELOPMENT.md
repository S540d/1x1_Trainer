# 🚀 Phase 2: TWA Development Plan (Android)

## Was ist eine TWA?

**TWA** = Trusted Web Activity

Eine TWA ist eine Android-App, die eine PWA (Web-App) in vollständiger Bildschirmgröße anzeigt. Sie bietet:
- ✅ App Store Distribution (Google Play)
- ✅ Native App Feeling
- ✅ Zugriff auf Android APIs
- ✅ Push Notifications möglich
- ✅ Bessere Performance als WebView

---

## 🎯 Schritte für TWA Implementation

### Schritt 1: Digital Asset Links Setup (15 Minuten)

Digital Asset Links verbinden die Android-App mit der Website - notwendig für PWA Integration.

**1.1 Keystore generieren:**
```bash
# Android Keystore für Signing erstellen
keytool -genkey -v -keystore ~/1x1_trainer.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias 1x1-trainer-key

# Ausgaben:
# - Datei: ~/1x1_trainer.keystore
# - Alias: 1x1-trainer-key
```

**1.2 SHA-256 Fingerprint extrahieren:**
```bash
keytool -list -v -keystore ~/1x1_trainer.keystore -alias 1x1-trainer-key
# Suche nach: SHA256 Fingerprint
```

**1.3 assetlinks.json erstellen:**

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.example.trainer1x1",
    "sha256_cert_fingerprints": [
      "XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX"
    ]
  }
}]
```

**1.4 Deploy auf Server:**
```
URL: https://s540d.github.io/.well-known/assetlinks.json

oder (empfohlen):
https://s540d.github.io/1x1_Trainer/.well-known/assetlinks.json
```

---

### Schritt 2: Android Project Setup (30 Minuten)

**Optionen:**

#### Option A: Budomation TWA Lib (EMPFOHLEN - einfach)
```bash
# Schneller & einfacher
npm install -g @budomation/twab

twab init \
  --appName "1x1 Trainer" \
  --packageName "com.example.trainer1x1" \
  --startUrl "https://s540d.github.io/1x1_Trainer/" \
  --signingKeyPath ~/1x1_trainer.keystore \
  --signingKeyAlias 1x1-trainer-key \
  --signingKeyPass [YOUR_PASSWORD] \
  --signingKeyStorePass [YOUR_KEYSTORE_PASS]
```

#### Option B: Google Android Studio (fortgeschritten)
```
1. Android Studio öffnen
2. File → New → Project
3. Template: "Basic Activity"
4. Configure als TWA:
   - AndroidManifest.xml bearbeiten
   - CustomTabsIntent verwenden
   - startUrl setzen
```

---

### Schritt 3: AndroidManifest.xml Konfiguration

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.trainer1x1">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- Optional für erweiterte Features -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.AppCompat.NoActionBar">

        <!-- TWA Activity -->
        <activity
            android:name="com.google.androidbrowser.customtabs.CustomTabActivity"
            android:label="@string/app_name"
            android:exported="true"
            android:screenOrientation="portrait">
            
            <intent-filter android:label="@string/app_name">
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Launch URL -->
            <meta-data
                android:name="com.google.androidbrowser.trusted_web_activity_uri"
                android:value="https://s540d.github.io/1x1_Trainer/" />

            <!-- Screen orientation -->
            <meta-data
                android:name="android.app.shortcuts"
                android:resource="@xml/shortcuts" />

        </activity>

    </application>

</manifest>
```

---

### Schritt 4: App Icons & Resources

```bash
# Android Ressourcen-Struktur
android/app/src/main/res/
├── mipmap-hdpi/
│   └── ic_launcher.png (72x72)
├── mipmap-mdpi/
│   └── ic_launcher.png (48x48)
├── mipmap-xhdpi/
│   └── ic_launcher.png (96x96)
├── mipmap-xxhdpi/
│   └── ic_launcher.png (144x144)
└── mipmap-xxxhdpi/
    └── ic_launcher.png (192x192)
```

---

### Schritt 5: Build & Signing

**Gradle Build (Android Studio):**
```gradle
// build.gradle
android {
    compileSdk 34
    
    defaultConfig {
        applicationId "com.example.trainer1x1"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }
    
    signingConfigs {
        release {
            storeFile file("../1x1_trainer.keystore")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias "1x1-trainer-key"
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
        }
    }
}
```

**Build Command:**
```bash
# Terminal
export KEYSTORE_PASSWORD=your_keystore_pass
export KEY_PASSWORD=your_key_pass

gradle assembleRelease
# Output: app/release/app-release.apk
```

---

### Schritt 6: Google Play Vorbereitung

#### 6.1 Google Play Console Account
```
1. https://play.google.com/console
2. Sign in mit Google Account
3. "Create app" klicken
4. App-Name, Sprache, Kategorie wählen
```

#### 6.2 App Listing
```
Store Listing:
├── App Name: "1x1 Trainer"
├── Short description: "Übe das Einmaleins"
├── Full description: [von README]
├── Screenshots: 2-5 Screenshots hochladen
├── App Icon: 512x512px
├── Feature Graphic: 1024x500px
└── Privacy Policy: (Link oder Text)

Content Rating:
├── Questionnaire ausfüllen
└── Rating erhalten

App Release:
├── APK hochladen (app-release.apk)
├── Version Name: "1.0.0"
├── Version Code: 1
├── Release notes
└── Target Countries
```

#### 6.3 Privacy & Permissions
```
Permissions:
├── INTERNET - notwendig
├── CAMERA - falls benötigt
└── LOCATION - falls benötigt

Privacy Policy:
- Link: https://github.com/S540d/1x1_Trainer/blob/main/LICENSE
- oder GDPR-konforme Datenschutzerklärung
```

---

## 📊 Verzeichnis-Struktur (TWA)

```
1x1_Trainer/
├── web/                         # PWA (Phase 1 ✅)
│   └── public/
│       ├── index.html
│       ├── manifest.json
│       └── service-worker.js
│
├── android/                     # TWA (Phase 2)
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/...
│   │       └── res/
│   │           ├── mipmap-*/
│   │           │   └── ic_launcher.png
│   │           ├── values/
│   │           │   └── strings.xml
│   │           └── xml/
│   │               └── shortcuts.xml
│   ├── gradle.properties
│   └── local.properties
│
├── .well-known/                 # Digital Asset Links
│   └── assetlinks.json
│
└── 1x1_trainer.keystore        # Signing Key
```

---

## 🔄 Deployment Flow

```
Phase 1: PWA ✅ COMPLETE
    ↓
Phase 2: TWA Development
    ├── Step 1: Digital Asset Links Setup
    ├── Step 2: Android Project Create
    ├── Step 3: AndroidManifest.xml
    ├── Step 4: App Resources
    ├── Step 5: Build & Sign
    └── Step 6: Google Play Submission
    ↓
Phase 3: App Store Release
    ├── Review Process (1-3 Tage)
    ├── Live auf Google Play
    └── Monitoring & Updates
```

---

## 🛠️ Wichtige Tools

```
Android Development:
├── Android SDK - https://developer.android.com/studio
├── Android Studio - IDE
├── Gradle - Build Tool
├── adb - Android Debug Bridge
└── keytool - Signing Tool

PWA Tools:
├── Web Dev Documentation - https://web.dev
├── Lighthouse - Performance Audit
└── Chrome DevTools - Debugging
```

---

## 📋 TWA Checkliste

```
Pre-Development:
☐ Digital Asset Links vorbereitet
☐ Keystore erstellt
☐ SHA-256 Fingerprint extrahiert
☐ assetlinks.json erstellt & deployed

Development:
☐ Android Studio Setup
☐ Android Project erstellt
☐ AndroidManifest.xml konfiguriert
☐ Icons für alle Densities (mdpi-xxxhdpi)
☐ App Local getestet (adb install)

Build & Release:
☐ Release APK gebaut
☐ APK signiert
☐ Google Play Account erstellt
☐ App Listing erstellt
☐ Screenshots hochgeladen
☐ Privacy Policy bereitgestellt
☐ App eingereicht

Post-Release:
☐ Review-Prozess überwacht
☐ App im Play Store live
☐ Weitere Versionen geplant
☐ User Feedback monitoring
```

---

## ⏱️ Zeitschätzung

| Task | Dauer |
|------|-------|
| Digital Asset Links | 15 min |
| Android Project Setup | 30 min |
| App Icons & Resources | 20 min |
| Build & Signing | 15 min |
| Google Play Setup | 45 min |
| Testing & Refinement | 1-2 Std |
| **Total** | **~3-4 Std** |

---

## 🚀 Nächste Schritte

1. **Digital Asset Links** einrichten
2. **Android Project** erstellen
3. **Local Testing** durchführen
4. **Google Play** vorbereiten
5. **App einreichen** für Review

---

## 📚 Ressourcen

- **TWA Dokumentation**: https://developers.google.com/web/android/trusted-web-activity
- **Android Studio**: https://developer.android.com/studio
- **Google Play Console**: https://play.google.com/console
- **Android Manifest**: https://developer.android.com/guide/topics/manifest

---

## Bereit für Phase 2?

✅ **PWA ist komplett!**

Sollen wir mit Phase 2 (TWA Development) starten?
