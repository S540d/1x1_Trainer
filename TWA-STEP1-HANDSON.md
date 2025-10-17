# 🔥 PHASE 2: STEP 1 - Digital Asset Links Setup (HANDS-ON)

## 🎯 Ziel
Verbinde deine Android App mit deiner PWA Website über Digital Asset Links.

---

## 📋 Schritt-für-Schritt Anleitung

### STEP 1.1: Keystore generieren (2 min)

Ein Keystore ist wie der Schlüssel für deine App. Du brauchst ihn zum Signieren.

```bash
# Öffne Terminal und führe aus:
keytool -genkey -v -keystore ~/1x1-trainer-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias 1x1-trainer-key
```

**Was wird abgefragt:**
```
Enter keystore password: [Setze sichere Password, z.B. 16+ Zeichen]
Re-enter new password: [Wiederholen]

Firstname and Lastname: 1x1 Trainer
Organizational Unit: Development
Organization: S540d
City: [Deine Stadt]
State: [Dein Bundesland]
Country Code: DE

Is CN=1x1 Trainer, OU=Development, O=S540d, L=..., ST=..., C=DE correct? [yes]
```

**Output:**
```
Entry type: PrivateKeyEntry
Certificate fingerprint (SHA1): AB:CD:EF:12:34:56:...
Certificate fingerprint (SHA-256): AB:CD:EF:12:34:56:... [← DAS BRAUCHST DU!]
```

✅ **Keystore erstellt:** `~/1x1-trainer-key.keystore`

---

### STEP 1.2: SHA-256 Fingerprint extrahieren (2 min)

```bash
# Terminal Befehl:
keytool -list -v -keystore ~/1x1-trainer-key.keystore -alias 1x1-trainer-key -storepass [DEIN_PASSWORD]
```

**Output suchen nach:**
```
Certificate fingerprints:
     SHA1: AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90
     SHA256: AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78
```

💾 **SHA-256 kopieren und speichern!** (wird in Step 1.3 benötigt)

---

### STEP 1.3: assetlinks.json erstellen (5 min)

**Datei anlegen:**
```bash
# Verzeichnis erstellen
mkdir -p /Users/svenstrohkark/Documents/Programmierung/Projects/1x1_Trainer/public/.well-known

# Datei erstellen (mit Editor oder Terminal)
touch /Users/svenstrohkark/Documents/Programmierung/Projects/1x1_Trainer/public/.well-known/assetlinks.json
```

**Inhalt (ersetze SHA256 mit DEINER Fingerprint):**

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.sven4321.trainer1x1",
    "sha256_cert_fingerprints": [
      "AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78"
    ]
  }
}]
```

⚠️ **WICHTIG:** Ersetze `AB:CD:EF:...` mit DEINER SHA-256 Fingerprint aus Step 1.2!

---

### STEP 1.4: assetlinks.json deployen (3 min)

**Option A: Mit GitHub Pages (EMPFOHLEN)**

```bash
# 1. Zur 1x1_Trainer Verzeichnis navigieren
cd /Users/svenstrohkark/Documents/Programmierung/Projects/1x1_Trainer

# 2. Git hinzufügen
git add public/.well-known/assetlinks.json
git commit -m "Add Digital Asset Links for TWA authentication"
git push origin main

# GitHub Pages deployed automatisch!
# Dauert ~30 Sekunden
```

**Option B: Mit lokalem Server testen**

```bash
# Terminal 1: Starte Server
cd /Users/svenstrohkark/Documents/Programmierung/Projects/1x1_Trainer
npx http-server -p 8080

# Terminal 2: Test
curl -v http://localhost:8080/.well-known/assetlinks.json
```

---

### STEP 1.5: assetlinks.json verifizieren (2 min)

**Online Verifikation:**

```bash
# Prüfe ob assetlinks.json erreichbar ist
curl -v https://s540d.github.io/1x1_Trainer/.well-known/assetlinks.json

# Output sollte sein:
# HTTP/1.1 200 OK
# Content-Type: application/json
# [{ "relation": ["delegate_permission/common.handle_all_urls"], ... }]
```

✅ **Wenn 200 OK + JSON angezeigt wird: FERTIG!**

---

## 🎯 Checkpoint: Digital Asset Links ✅

Erledigt:
- ✅ Keystore generiert
- ✅ SHA-256 Fingerprint extrahiert
- ✅ assetlinks.json erstellt
- ✅ assetlinks.json deployed
- ✅ assetlinks.json verifiziert

**Nächster Schritt: STEP 2 - Android TWA Project erstellen**

---

## 🆘 Troubleshooting

### Problem: "keytool command not found"
```bash
# Java nicht im PATH
# Lösung: Voller Pfad nutzen:
/Library/Java/JavaVirtualMachines/[jdk-version]/Contents/Home/bin/keytool ...
```

### Problem: assetlinks.json wird nicht gefunden (404)
```
1. Prüfe ob Datei in: public/.well-known/assetlinks.json existiert
2. Cache löschen: cmd+shift+r (Chrome)
3. WAF/Firewall Check: Können JSON-Dateien deployed werden?
4. CORS Check: Response Headers anschauen
```

### Problem: Falsche SHA256 Fingerprint
```bash
# Achtung: Copy-Paste Fehler
# Verifiziere nochmal mit:
keytool -list -v -keystore ~/1x1-trainer-key.keystore
# Und vergleiche mit assetlinks.json
```

---

## 💾 Wichtige Dateien speichern!

```
🔐 Keystore: ~/1x1-trainer-key.keystore
   └─ BACKUP AN SICHEREM ORT!
   └─ PASSWORD NIEMALS TEILEN!

📄 SHA-256: [In Notiz speichern]
   └─ Für assetlinks.json
   └─ Für Google Play

🌐 assetlinks.json: public/.well-known/assetlinks.json
   └─ Deployed auf GitHub Pages
   └─ Öffentlich erreichbar
```

---

## ✨ Nächste Phase

Wenn Digital Asset Links ✅ funktioniert:

**STEP 2: Android TWA Project erstellen**
- Android Studio installieren
- Neues Projekt erstellen
- AndroidManifest.xml konfigurieren
- Android Icons generieren
- Release APK bauen

**Geschätzter Zeitaufwand:** ~2.5 Stunden
**Review Time (Google):** 1-3 Tage

---

**Bereit für STEP 2? 🚀**
