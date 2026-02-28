#!/usr/bin/env bash
# bump-version.sh — Atomar alle Versionsstellen erhöhen
#
# Usage:
#   ./scripts/bump-version.sh patch   # 1.2.1 → 1.2.2, versionCode +1
#   ./scripts/bump-version.sh minor   # 1.2.1 → 1.3.0, versionCode +1
#   ./scripts/bump-version.sh major   # 1.2.1 → 2.0.0, versionCode +1
#
# Updates:
#   - package.json      → version
#   - app.json          → expo.version + android.versionCode
#   - utils/constants.ts → APP_VERSION

set -e

BUMP_TYPE=${1:-patch}

if [[ "$BUMP_TYPE" != "patch" && "$BUMP_TYPE" != "minor" && "$BUMP_TYPE" != "major" ]]; then
  echo "❌ Invalid bump type: $BUMP_TYPE (use: patch, minor, major)"
  exit 1
fi

# Read current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
CURRENT_VERSION_CODE=$(node -p "require('./app.json').expo.android.versionCode")

# Parse semver
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Bump
case $BUMP_TYPE in
  major)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  patch)
    PATCH=$((PATCH + 1))
    ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
NEW_VERSION_CODE=$((CURRENT_VERSION_CODE + 1))

echo "🔢 Bumping version: $CURRENT_VERSION → $NEW_VERSION (versionCode: $CURRENT_VERSION_CODE → $NEW_VERSION_CODE)"

# Update package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = '$NEW_VERSION';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# Update app.json
node -e "
const fs = require('fs');
const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
app.expo.version = '$NEW_VERSION';
app.expo.android.versionCode = $NEW_VERSION_CODE;
fs.writeFileSync('app.json', JSON.stringify(app, null, 2) + '\n');
"

# Update utils/constants.ts (cross-platform: macOS and Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/export const APP_VERSION = '.*';/export const APP_VERSION = '$NEW_VERSION';/" utils/constants.ts
else
  sed -i "s/export const APP_VERSION = '.*';/export const APP_VERSION = '$NEW_VERSION';/" utils/constants.ts
fi

echo "✅ Version bumped to $NEW_VERSION (versionCode $NEW_VERSION_CODE)"
echo ""
echo "Updated files:"
echo "  - package.json"
echo "  - app.json"
echo "  - utils/constants.ts"
echo ""
echo "Don't forget to update CHANGELOG.md!"
