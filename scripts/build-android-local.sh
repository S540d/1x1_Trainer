#!/usr/bin/env bash
# build-android-local.sh — Signiertes Android-Release lokal bauen (ohne CI, project-templates#180)
#
# Usage:
#   ./scripts/build-android-local.sh            # AAB für den Play Store
#   ./scripts/build-android-local.sh apk        # Release-APK für Gerätetests
#
# Passwort (Store & Key identisch): aus ANDROID_KEYSTORE_PASSWORD, sonst interaktive Abfrage.
# Keystore: KEYSTORE_PATH, Default ../Keystore/Keystore_1x1_trainer/1x1-trainer-key.keystore
#
# Das Skript bricht ab, wenn das Ergebnis nicht den Store-Paketnamen trägt oder nicht mit
# dem Upload-Key signiert ist — genau diese beiden Fehler entstehen sonst stillschweigend
# (fehlendes APP_PACKAGE → Dev-Paketname; Prebuild-Default → Debug-Key).

set -euo pipefail

FORMAT=${1:-aab}
if [[ "$FORMAT" != "aab" && "$FORMAT" != "apk" ]]; then
  echo "❌ Ungültiges Format: $FORMAT (aab oder apk)"
  exit 1
fi

STORE_PACKAGE="com.sven4321.trainer1x1"
KEY_ALIAS="1x1-trainer-key"
EXPECTED_SHA1="3F:1F:1E:16:56:BB:01:36:40:50:76:E8:44:73:9D:01:A3:B8:D4:78"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
KEYSTORE_PATH="${KEYSTORE_PATH:-$ROOT/../Keystore/Keystore_1x1_trainer/1x1-trainer-key.keystore}"

export JAVA_HOME="${JAVA_HOME_17:-/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home}"
export PATH="$JAVA_HOME/bin:$PATH"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"

[ -d "$JAVA_HOME" ] || { echo "❌ JDK 17 nicht gefunden: $JAVA_HOME (Java 21+ bricht Gradle)"; exit 1; }
[ -d "$ANDROID_HOME" ] || { echo "❌ Android SDK nicht gefunden: $ANDROID_HOME"; exit 1; }
[ -f "$KEYSTORE_PATH" ] || { echo "❌ Keystore nicht gefunden: $KEYSTORE_PATH"; exit 1; }

if [ -z "${ANDROID_KEYSTORE_PASSWORD:-}" ]; then
  read -r -s -p "Keystore-Passwort: " ANDROID_KEYSTORE_PASSWORD
  echo
fi

ACTUAL_SHA1=$(keytool -list -v -keystore "$KEYSTORE_PATH" -alias "$KEY_ALIAS" \
  -storepass "$ANDROID_KEYSTORE_PASSWORD" 2>/dev/null | grep "SHA1:" | head -1 | sed 's/.*SHA1: //')
if [ "$ACTUAL_SHA1" != "$EXPECTED_SHA1" ]; then
  echo "❌ Keystore passt nicht (oder Passwort falsch). Erwartet $EXPECTED_SHA1, gefunden '${ACTUAL_SHA1}'"
  exit 1
fi

VERSION=$(node -p "require('./package.json').version")
VERSION_CODE=$(node -p "require('./app.json').expo.android.versionCode")
echo "📱 1x1 Trainer v$VERSION (vc$VERSION_CODE) → $FORMAT, Paket $STORE_PACKAGE"

# node_modules muss zum Lockfile passen, sonst fehlen nach SDK-Upgrades Config-Plugins.
# npm ci nur bei Abweichung: der Komplett-Download kann unter macOS die Ephemeral-Ports
# erschöpfen, und Gradle erreicht dann seinen eigenen Daemon nicht mehr.
if ! npm ls --all >/dev/null 2>&1; then
  npm ci
fi

APP_PACKAGE="$STORE_PACKAGE" EXPO_NO_TELEMETRY=1 npx expo prebuild --platform android --clean

# Release-Signing nur im release-Buildtype setzen; debug bleibt beim Debug-Key
node -e '
  const fs = require("fs");
  const f = "android/app/build.gradle";
  let g = fs.readFileSync(f, "utf8");
  const block = [
    "    signingConfigs {",
    "        upload {",
    "            storeFile file(project.property(\"UPLOAD_STORE_FILE\"))",
    "            storePassword project.property(\"UPLOAD_STORE_PASSWORD\")",
    "            keyAlias project.property(\"UPLOAD_KEY_ALIAS\")",
    "            keyPassword project.property(\"UPLOAD_KEY_PASSWORD\")",
    "        }",
    "    }",
  ].join("\n");
  g = g.replace(/\n    buildTypes \{/, "\n" + block + "\n    buildTypes {");
  const rel = g.match(/\n        release \{[\s\S]*?\n        \}/);
  if (!rel) { console.error("release-Buildtype nicht gefunden"); process.exit(1); }
  const patched = rel[0].replace("signingConfig signingConfigs.debug", "signingConfig signingConfigs.upload");
  if (patched === rel[0]) { console.error("signingConfig im release-Buildtype nicht gefunden"); process.exit(1); }
  fs.writeFileSync(f, g.replace(rel[0], patched));
'

# Passwörter nur als Env-Vars an Gradle, nie in Dateien unter android/
export ORG_GRADLE_PROJECT_UPLOAD_STORE_FILE="$KEYSTORE_PATH"
export ORG_GRADLE_PROJECT_UPLOAD_STORE_PASSWORD="$ANDROID_KEYSTORE_PASSWORD"
export ORG_GRADLE_PROJECT_UPLOAD_KEY_ALIAS="$KEY_ALIAS"
export ORG_GRADLE_PROJECT_UPLOAD_KEY_PASSWORD="$ANDROID_KEYSTORE_PASSWORD"

if [ "$FORMAT" = "aab" ]; then
  (cd android && ./gradlew bundleRelease --no-daemon --console=plain)
  OUT="android/app/build/outputs/bundle/release/app-release.aab"
  OUT_PACKAGE=$(bundletool dump manifest --bundle "$OUT" --xpath /manifest/@package)
  OUT_VC=$(bundletool dump manifest --bundle "$OUT" --xpath /manifest/@android:versionCode)
  OUT_SHA1=$(keytool -printcert -jarfile "$OUT" | grep "SHA1:" | head -1 | sed 's/.*SHA1: //')
else
  (cd android && ./gradlew assembleRelease --no-daemon --console=plain)
  OUT="android/app/build/outputs/apk/release/app-release.apk"
  BUILD_TOOLS="$ANDROID_HOME/build-tools/$(ls "$ANDROID_HOME/build-tools" | sort -V | tail -1)"
  OUT_PACKAGE=$("$BUILD_TOOLS/aapt2" dump packagename "$OUT")
  OUT_VC=$("$BUILD_TOOLS/aapt2" dump badging "$OUT" | sed -n "s/.*versionCode='\([0-9]*\)'.*/\1/p")
  OUT_SHA1=$("$BUILD_TOOLS/apksigner" verify --print-certs "$OUT" | grep "SHA-1" | head -1 | awk '{print toupper($NF)}' | sed 's/../&:/g; s/:$//')
fi

echo "🔎 Paket $OUT_PACKAGE, versionCode $OUT_VC, Signatur $OUT_SHA1"
[ "$OUT_PACKAGE" = "$STORE_PACKAGE" ] || { echo "❌ Falscher Paketname"; exit 1; }
[ "$OUT_VC" = "$VERSION_CODE" ] || { echo "❌ versionCode weicht von app.json ab"; exit 1; }
[ "$OUT_SHA1" = "$EXPECTED_SHA1" ] || { echo "❌ Nicht mit dem Upload-Key signiert"; exit 1; }

mkdir -p aab-archive
ARCHIVE="aab-archive/1x1Trainer-v$VERSION-vc$VERSION_CODE-$(date +%Y-%m-%d).$FORMAT"
cp "$OUT" "$ARCHIVE"
if [ "$FORMAT" = "aab" ]; then
  MAPPING="android/app/build/outputs/mapping/release/mapping.txt"
  [ -f "$MAPPING" ] && cp "$MAPPING" "aab-archive/1x1Trainer-v$VERSION-vc$VERSION_CODE-mapping.txt"
fi

rm -rf android
echo "✅ $ARCHIVE"
