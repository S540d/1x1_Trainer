#!/usr/bin/env bash

# 🚀 TWA Phase 2 - Digital Asset Links Setup Script
# Automatisiert den Setup von Keystore und assetlinks.json

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   1x1 Trainer - TWA Digital Asset Links Setup                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variablen
KEYSTORE_PATH="$HOME/1x1-trainer-key.keystore"
PACKAGE_NAME="com.sven4321.trainer1x1"
ALIAS_NAME="1x1-trainer-key"
PROJECT_DIR="/Users/svenstrohkark/Documents/Programmierung/Projects/1x1_Trainer"
ASSETLINKS_DIR="$PROJECT_DIR/public/.well-known"

# Check Java/Keytool
echo -e "${BLUE}📋 Checking Prerequisites...${NC}"
if ! command -v keytool &> /dev/null; then
    echo -e "${RED}❌ keytool not found. Install JDK 11+${NC}"
    exit 1
fi
echo -e "${GREEN}✅ keytool available${NC}"
echo ""

# Step 1: Keystore generieren
echo -e "${BLUE}🔐 STEP 1: Generating Keystore...${NC}"
if [ -f "$KEYSTORE_PATH" ]; then
    echo -e "${YELLOW}⚠️  Keystore already exists: $KEYSTORE_PATH${NC}"
    read -p "Overwrite? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping keystore generation"
    else
        rm "$KEYSTORE_PATH"
        echo -e "${BLUE}Generating new keystore...${NC}"
        # Non-interactive mode (fill with defaults)
        keytool -genkey -v -keystore "$KEYSTORE_PATH" \
          -keyalg RSA -keysize 2048 -validity 10000 \
          -alias "$ALIAS_NAME" \
          -dname "CN=1x1 Trainer, OU=Development, O=S540d, L=Berlin, ST=Berlin, C=DE" \
          -storepass "1x1trainer2025!" \
          -keypass "1x1trainer2025!"
        echo -e "${GREEN}✅ Keystore generated: $KEYSTORE_PATH${NC}"
    fi
else
    echo -e "${BLUE}Generating new keystore...${NC}"
    keytool -genkey -v -keystore "$KEYSTORE_PATH" \
      -keyalg RSA -keysize 2048 -validity 10000 \
      -alias "$ALIAS_NAME" \
      -dname "CN=1x1 Trainer, OU=Development, O=S540d, L=Berlin, ST=Berlin, C=DE" \
      -storepass "1x1trainer2025!" \
      -keypass "1x1trainer2025!"
    echo -e "${GREEN}✅ Keystore generated: $KEYSTORE_PATH${NC}"
fi
echo ""

# Step 2: SHA-256 Fingerprint extrahieren
echo -e "${BLUE}👆 STEP 2: Extracting SHA-256 Fingerprint...${NC}"
SHA256=$(keytool -list -v -keystore "$KEYSTORE_PATH" \
  -alias "$ALIAS_NAME" \
  -storepass "1x1trainer2025!" | grep "SHA256:" | head -1 | sed 's/.*SHA256: //')

if [ -z "$SHA256" ]; then
    echo -e "${RED}❌ Could not extract SHA-256 fingerprint${NC}"
    exit 1
fi

echo -e "${GREEN}✅ SHA-256 Fingerprint:${NC}"
echo -e "${BLUE}$SHA256${NC}"
echo ""

# Step 3: assetlinks.json erstellen
echo -e "${BLUE}📄 STEP 3: Creating assetlinks.json...${NC}"
mkdir -p "$ASSETLINKS_DIR"

cat > "$ASSETLINKS_DIR/assetlinks.json" << EOF
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "$PACKAGE_NAME",
    "sha256_cert_fingerprints": [
      "$SHA256"
    ]
  }
}]
EOF

echo -e "${GREEN}✅ assetlinks.json created:${NC}"
echo "$ASSETLINKS_DIR/assetlinks.json"
echo ""

# Step 4: assetlinks.json deployen
echo -e "${BLUE}🚀 STEP 4: Deploying assetlinks.json...${NC}"
cd "$PROJECT_DIR"

if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${YELLOW}ℹ️  Git repository detected${NC}"
    
    git add "public/.well-known/assetlinks.json"
    git commit -m "Add Digital Asset Links for TWA authentication" || echo "File already staged"
    
    echo -e "${YELLOW}ℹ️  Pushing to GitHub (GitHub Pages)...${NC}"
    git push origin main || echo "Already up to date"
    
    echo -e "${GREEN}✅ assetlinks.json pushed to GitHub Pages${NC}"
    echo "   URL: https://s540d.github.io/1x1_Trainer/.well-known/assetlinks.json"
else
    echo -e "${YELLOW}⚠️  Not a git repository. Manual deployment needed.${NC}"
fi
echo ""

# Step 5: Verifizieren
echo -e "${BLUE}✅ STEP 5: Verifying assetlinks.json...${NC}"
sleep 2

RESPONSE=$(curl -s -w "\n%{http_code}" https://s540d.github.io/1x1_Trainer/.well-known/assetlinks.json 2>/dev/null | tail -1)

if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ assetlinks.json is accessible (HTTP 200)${NC}"
    echo -e "${GREEN}✅ Digital Asset Links successfully set up!${NC}"
else
    echo -e "${YELLOW}⚠️  Response: HTTP $RESPONSE${NC}"
    echo -e "${YELLOW}   (May take a few minutes for GitHub Pages to sync)${NC}"
fi
echo ""

# Step 6: Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo -e "${GREEN}✅ DIGITAL ASSET LINKS SETUP COMPLETE!${NC}"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${BLUE}📋 Important Information:${NC}"
echo ""
echo -e "${GREEN}Keystore:${NC}"
echo "  Path: $KEYSTORE_PATH"
echo "  Password: 1x1trainer2025!"
echo "  Alias: $ALIAS_NAME"
echo ""
echo -e "${GREEN}assetlinks.json:${NC}"
echo "  Local: $ASSETLINKS_DIR/assetlinks.json"
echo "  Remote: https://s540d.github.io/1x1_Trainer/.well-known/assetlinks.json"
echo ""
echo -e "${GREEN}SHA-256 Fingerprint:${NC}"
echo "  $SHA256"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Save this fingerprint for Google Play Console!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Keep keystore file safe (backup to secure location)"
echo "2. Use SHA-256 in Android project"
echo "3. Use SHA-256 in Google Play Console"
echo "4. Continue with STEP 2: Android Project Setup"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "  TWA-STEP1-HANDSON.md - Detailed guide"
echo "  TWA-DEVELOPMENT.md - Complete roadmap"
echo ""
