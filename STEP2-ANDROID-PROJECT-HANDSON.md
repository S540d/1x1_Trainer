# 🔥 PHASE 2: STEP 2 - Android TWA Project Setup (HANDS-ON)

## 🎯 Ziel
Erstelle ein funktionsfähiges Android Studio Projekt mit TWA (Trusted Web Activity) für deine PWA.

---

## 📋 Was wird gemacht?

```
PWA (bereits fertig)     Android Studio     Android Project
┌──────────────────┐    ┌─────────────────┐  ┌───────────────┐
│ 1x1_Trainer      │───→│ Create Project  │→ │ Build APK     │
│ (Web Version)    │    │ Configure       │  │ for Play      │
│ Lighthouse 90+   │    │ Set Manifest    │  │ Store         │
└──────────────────┘    └─────────────────┘  └───────────────┘
```

---

## ⏱️ Zeitaufwand: ~30 Minuten

---

## 🚀 SCHRITT 1: Android Studio installieren/prüfen (5 min)

### Option A: Bereits installiert?
```bash
# Terminal prüfen
which android

# Oder Android Studio öffnen
# Applications → Android Studio
```

### Option B: Neu installieren
```bash
# Download: https://developer.android.com/studio
# macOS: Lade arm64 Version herunter (nicht Intel)
# Dann: öffne DMG-Datei
# Und: Folge Installation Wizard
```

**Nach Installation:**
```bash
# Android SDK Components
Android Studio öffnen:
1. Settings (⌘,)
2. Languages & Frameworks → Android SDK
3. Prüfe: API Level 33+ installiert
4. OK
```

---

## 🎨 SCHRITT 2: Neues Android Projekt erstellen (10 min)

### 2.1 Projekt starten
```
1. Android Studio öffnen
2. "New Project" klicken
3. Wähle: "Empty Activity"
4. Next
```

### 2.2 Projekt konfigurieren
```
Name:              1x1 Trainer
Package name:      com.sven4321.trainer1x1
Save location:     ~/AndroidProjects/1x1_Trainer
Language:          Kotlin
Min SDK:           API 21 (Android 5.0)
Build configuration: Kotlin DSL
```

**WICHTIG:** Package name MUSS genau so sein!

### 2.3 Fertig
```
Klick "Finish"
Warte auf "Build: Executing Tasks..." (~ 2-3 Minuten)
```

---

## 📝 SCHRITT 3: Gradle Dependencies hinzufügen (5 min)

**Datei:** `app/build.gradle.kts` (oder `.gradle` je nach Project)

```gradle
dependencies {
    // Existing dependencies...
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    
    // TWA/CustomTabs
    implementation("com.google.androidbrowser:customtabs:1.7.0")
    
    // JSON Processing
    implementation("com.google.code.gson:gson:2.10.1")
    
    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}
```

**Nach Änderung:**
```
Klick "Sync Now" (oben rechts)
Warte auf Sync
```

---

## 🔧 SCHRITT 4: AndroidManifest.xml konfigurieren (5 min)

**Datei:** `app/src/main/AndroidManifest.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.sven4321.trainer1x1">

    <!-- Internet Permission -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:debuggable="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false">

        <!-- Main Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBar">
            
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
                
                <!-- PWA Deep Linking -->
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                
                <data
                    android:scheme="https"
                    android:host="s540d.github.io"
                    android:pathPrefix="/1x1_Trainer/" />
            </intent-filter>
        </activity>

    </application>

</manifest>
```

---

## 🎨 SCHRITT 5: Colors & Strings definieren (3 min)

### Colors
**Datei:** `app/src/main/res/values/colors.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="purple_primary">#6200EE</color>
    <color name="purple_dark">#5000DD</color>
    <color name="white">#FFFFFF</color>
    <color name="black">#000000</color>
    <color name="gray_light">#F5F5F5</color>
</resources>
```

### Strings
**Datei:** `app/src/main/res/values/strings.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">1x1 Trainer</string>
    <string name="app_description">Lerne das kleine Einmaleins</string>
    <string name="start_url">https://s540d.github.io/1x1_Trainer/</string>
</resources>
```

### Themes
**Datei:** `app/src/main/res/values/themes.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">@color/purple_primary</item>
        <item name="colorPrimaryDark">@color/purple_dark</item>
    </style>

    <style name="AppTheme.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:windowFullscreen">false</item>
        <item name="android:fitsSystemWindows">true</item>
    </style>
</resources>
```

---

## ⚙️ SCHRITT 6: MainActivity.kt schreiben (5 min)

**Datei:** `app/src/main/java/com/sven4321/trainer1x1/MainActivity.kt`

```kotlin
package com.sven4321.trainer1x1

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import androidx.browser.customtabs.CustomTabsIntent

class MainActivity : AppCompatActivity() {
    
    private val PWA_URL = "https://s540d.github.io/1x1_Trainer/"
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Full screen mode
        window.setFlags(
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
        )
        
        // Prüfe ob vom Intent (Deep Link) oder direkt gestartet
        val url = intent.data?.toString() ?: PWA_URL
        
        // Öffne PWA in TWA (Trusted Web Activity)
        launchPWA(url)
        
        // Beende MainActivity
        finish()
    }
    
    private fun launchPWA(url: String) {
        try {
            // Chrome CustomTabs mit vollständigen Einstellungen
            val builder = CustomTabsIntent.Builder()
                .setDefaultColorSchemeParams(
                    CustomTabsIntent.ColorSchemeParams.Builder()
                        .setToolbarColor(getColor(R.color.purple_primary))
                        .setSecondaryToolbarColor(getColor(R.color.purple_dark))
                        .setNavigationBarColor(getColor(R.color.white))
                        .build()
                )
                .setShowTitle(false)
                .setInstantAppsEnabled(true)
                .setUrlBarHidingEnabled(true)
        
            val customTabsIntent = builder.build()
            customTabsIntent.launchUrl(this, Uri.parse(url))
            
        } catch (e: Exception) {
            // Fallback: System Browser
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse(url)
            }
            startActivity(intent)
        }
    }
}
```

---

## 🧪 SCHRITT 7: Testen (2 min)

### 7.1 Build durchführen
```
Android Studio:
1. Build → Build Bundle(s) / APK(s) → Build APK(s)
2. Warte auf Completion (~ 1-2 Minuten)

Output:
"APK(s) generated successfully"
```

### 7.2 Auf echtem Gerät testen
```bash
# Terminal prüfen
adb devices
# Sollte ein Gerät/Emulator zeigen

# App installieren & starten
adb install app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.sven4321.trainer1x1/.MainActivity
```

### 7.3 Emulator testen
```
1. Android Studio: AVD Manager (oben rechts)
2. Wähle ein Gerät
3. Klick Play (▶️)
4. Warte auf Start (~ 30 Sekunden)
5. Dann: adb install command (oben)
```

---

## ✅ SCHRITT 8: Verifizierung (2 min)

Wenn die App startet und die PWA lädt:

```
✅ Icon sichtbar auf Homescreen
✅ App-Name: "1x1 Trainer"
✅ PWA lädt in Vollbildmodus
✅ Navigation funktioniert
✅ Keine Fehler in Logcat
```

**Wenn etwas nicht funktioniert:**

```bash
# Logcat in Android Studio
View → Tool Windows → Logcat

Suche nach:
- Errors (rot)
- Warnings (gelb)
- Filter: "1x1" oder "trainer"
```

---

## 🎯 Checklist STEP 2

```
✅ Android Studio installiert/aktualisiert
✅ Neues Projekt erstellt (com.sven4321.trainer1x1)
✅ Gradle Dependencies hinzugefügt
✅ AndroidManifest.xml konfiguriert
✅ Colors, Strings, Themes definiert
✅ MainActivity.kt geschrieben
✅ APK gebaut
✅ Auf Gerät/Emulator getestet
✅ PWA lädt erfolgreich
```

---

## 🚀 Troubleshooting

### Problem: "Build failed"
```
Solution:
1. File → Invalidate Caches → Restart
2. Build → Clean Project
3. Build → Build APK(s) erneut
```

### Problem: "Cannot resolve symbol"
```
Solution:
1. Warte auf Gradle Sync
2. Oder: File → Sync Now
3. Oder: Rebuild Project
```

### Problem: "App startet nicht / zeigt Fehler"
```
Solution:
1. Öffne Logcat
2. Suche nach RED Errors
3. Prüfe:
   - Package name korrekt?
   - AndroidManifest.xml Syntax?
   - MainActivity.kt importiert alle?
```

### Problem: "PWA lädt nicht"
```
Solution:
1. Prüfe Internet-Verbindung
2. Prüfe assetlinks.json erreichbar
3. Prüfe SHA-256 Fingerprint stimmt
4. Prüfe URL in MainActivity.kt
5. Logcat auf Fehler prüfen
```

---

## 📊 Was wurde erledigt

```
✅ Android Studio Projekt erstellt
✅ Package Name: com.sven4321.trainer1x1
✅ Gradle konfiguriert
✅ AndroidManifest.xml eingerichtet
✅ Material Colors definiert
✅ MainActivity mit TWA-Support geschrieben
✅ APK gebaut
✅ Getestet auf Gerät/Emulator
✅ PWA lädt erfolgreich
```

---

## ⏱️ Nächste Schritte: STEP 3

**STEP 3: Android Icons generieren** (~20 min)

- Icon in verschiedene Android Densities konvertieren
- Launcher Icons einrichten
- Adaptive Icons für Android 8+

**Dokumentation:** TWA-DEVELOPMENT.md (STEP 3)

---

## 💾 Speichern

Wenn alles funktioniert:
```bash
git add app/
git commit -m "Add Android TWA Project (STEP 2)"
git push origin main
```

---

**STEP 2: ✅ COMPLETE! Bereit für STEP 3? 🚀**
