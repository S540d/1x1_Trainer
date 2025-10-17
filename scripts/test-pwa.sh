#!/bin/bash

# 🧪 PWA Quick Test Script
# Validiert die PWA-Komponenten

echo "🧪 PWA Validation Script"
echo "════════════════════════════════════════════════"

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASSED=0
FAILED=0

# Test-Funktion
test_file() {
    local file=$1
    local name=$2
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $name"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $name - MISSING: $file"
        ((FAILED++))
    fi
}

test_json() {
    local file=$1
    local name=$2
    if [ -f "$file" ]; then
        if python3 -m json.tool "$file" > /dev/null 2>&1; then
            echo -e "${GREEN}✅${NC} $name (valid JSON)"
            ((PASSED++))
        else
            echo -e "${RED}❌${NC} $name (invalid JSON)"
            ((FAILED++))
        fi
    else
        echo -e "${RED}❌${NC} $name - MISSING"
        ((FAILED++))
    fi
}

echo ""
echo "📋 Checking Files..."
echo "────────────────────────────────────────────────"

# Icons
echo ""
echo "🎨 Icons (9 required):"
test_file "public/icon-96.png" "icon-96.png"
test_file "public/icon-128.png" "icon-128.png"
test_file "public/icon-144.png" "icon-144.png"
test_file "public/icon-152.png" "icon-152.png"
test_file "public/icon-180.png" "icon-180.png"
test_file "public/icon-192.png" "icon-192.png"
test_file "public/icon-256.png" "icon-256.png"
test_file "public/icon-384.png" "icon-384.png"
test_file "public/icon-512.png" "icon-512.png"

# Screenshots
echo ""
echo "📸 Screenshots (2 required):"
test_file "public/screenshot-540x720.png" "screenshot-540x720.png"
test_file "public/screenshot-1280x720.png" "screenshot-1280x720.png"

# Config Files
echo ""
echo "⚙️ Configuration Files:"
test_json "public/manifest.json" "manifest.json"
test_file "public/service-worker.js" "service-worker.js"
test_file "public/pwa-update.js" "pwa-update.js"
test_file "public/robots.txt" "robots.txt"
test_file "public/sitemap.xml" "sitemap.xml"
test_file "public/index.html" "index.html"

# Documentation
echo ""
echo "📚 Documentation:"
test_file "PWA-OPTIMIZATION.md" "PWA-OPTIMIZATION.md"
test_file "PWA-TESTING.md" "PWA-TESTING.md"
test_file "README.md" "README.md"

# Scripts
echo ""
echo "🔧 Generator Scripts:"
test_file "scripts/generate-icons.py" "generate-icons.py"
test_file "scripts/generate-screenshots.py" "generate-screenshots.py"

# Manifest Content Check
echo ""
echo "🔍 Manifest Content Check:"
echo "────────────────────────────────────────────────"

if [ -f "public/manifest.json" ]; then
    # Icons count
    ICON_COUNT=$(grep -c '"src".*icon' public/manifest.json)
    echo -e "${GREEN}✅${NC} Icons in manifest: $ICON_COUNT/9"
    
    # Screenshots check
    if grep -q '"screenshot' public/manifest.json; then
        echo -e "${GREEN}✅${NC} Screenshots in manifest: YES"
    else
        echo -e "${RED}❌${NC} Screenshots in manifest: NO"
    fi
    
    # Display mode
    if grep -q '"display".*"standalone"' public/manifest.json; then
        echo -e "${GREEN}✅${NC} Display mode: standalone"
    else
        echo -e "${RED}❌${NC} Display mode: NOT standalone"
    fi
    
    # Start URL
    if grep -q '"start_url"' public/manifest.json; then
        START_URL=$(grep -o '"start_url"[^"]*"[^"]*"' public/manifest.json)
        echo -e "${GREEN}✅${NC} Start URL configured: $START_URL"
    fi
fi

# Service Worker Check
echo ""
echo "⚙️ Service Worker Check:"
echo "────────────────────────────────────────────────"

if [ -f "public/service-worker.js" ]; then
    if grep -q "addEventListener.*install" public/service-worker.js; then
        echo -e "${GREEN}✅${NC} Install listener: YES"
    fi
    if grep -q "addEventListener.*activate" public/service-worker.js; then
        echo -e "${GREEN}✅${NC} Activate listener: YES"
    fi
    if grep -q "addEventListener.*fetch" public/service-worker.js; then
        echo -e "${GREEN}✅${NC} Fetch listener: YES"
    fi
fi

# Summary
echo ""
echo "════════════════════════════════════════════════"
echo "📊 Results:"
echo "────────────────────────────────────────────────"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ Failed: $FAILED${NC}"
else
    echo -e "${GREEN}❌ Failed: $FAILED${NC}"
fi

echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! PWA is ready for testing.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some checks failed. Please review above.${NC}"
    exit 1
fi
