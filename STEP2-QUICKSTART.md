# ⚡ STEP 2: QUICK START CHECKLIST

## 🎯 In 5 Minuten zum Android Projekt

### MINUTE 1-2: Android Studio prüfen

```bash
# Terminal
which android
# oder
ls -la /Applications/Android\ Studio.app
```

Falls nicht vorhanden: Download https://developer.android.com/studio

### MINUTE 3: Neues Projekt

```
1. Android Studio öffnen
2. New Project → Empty Activity
3. Name: 1x1 Trainer
4. Package: com.sven4321.trainer1x1
5. Min SDK: API 21
6. Finish → Warte auf Build (2-3 min)
```

### MINUTE 5: AndroidManifest.xml

Kopiere dies in `app/src/main/AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.sven4321.trainer1x1">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBar">
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
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

### MINUTE 6: Dependencies

In `app/build.gradle.kts` oder `app/build.gradle` hinzufügen:

```gradle
dependencies {
    implementation("com.google.androidbrowser:customtabs:1.7.0")
}
```

Dann: Sync Now

### MINUTE 7: MainActivity.kt

`app/src/main/java/com/sven4321/trainer1x1/MainActivity.kt`:

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
        window.setFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS, WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS)
        val url = intent.data?.toString() ?: PWA_URL
        launchPWA(url)
        finish()
    }
    
    private fun launchPWA(url: String) {
        try {
            val builder = CustomTabsIntent.Builder()
                .setDefaultColorSchemeParams(CustomTabsIntent.ColorSchemeParams.Builder().setToolbarColor(getColor(R.color.purple_primary)).build())
                .setShowTitle(false)
            val intent = builder.build()
            intent.launchUrl(this, Uri.parse(url))
        } catch (e: Exception) {
            startActivity(Intent(Intent.ACTION_VIEW).apply { data = Uri.parse(url) })
        }
    }
}
```

### MINUTE 8: Bauen & Testen

```bash
# Terminal in Android Studio
cd app/
./gradlew assembleDebug

# oder via UI
Build → Build APK(s)

# Auf Gerät/Emulator
adb install app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.sven4321.trainer1x1/.MainActivity
```

---

## ✅ Fertig?

```
✅ Projekt erstellt
✅ Manifest konfiguriert
✅ MainActivity geschrieben
✅ APK gebaut
✅ PWA lädt
```

**→ STEP 2 COMPLETE! 🎉**

---

## 📚 Für Details

Siehe: `STEP2-ANDROID-PROJECT-HANDSON.md`
