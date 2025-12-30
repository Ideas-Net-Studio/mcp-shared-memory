#!/bin/bash

# Quick Release Script for mcp-shared-memory
# Usage: ./release.sh [--version=X.Y.Z]
#   --version=X.Y.Z  : Bump to specific version
#   --patch          : Bump patch version (0.1.3 -> 0.1.4)
#   --minor          : Bump minor version (0.1.3 -> 0.2.0)
#   --major          : Bump major version (0.1.3 -> 1.0.0)

set -e

echo "🚀 Starting release process for mcp-shared-memory..."

# Parse arguments
BUMP_TYPE=""
NEW_VERSION=""

for arg in "$@"; do
  case $arg in
    --version=*)
      NEW_VERSION="${arg#*=}"
      shift
      ;;
    --patch)
      BUMP_TYPE="patch"
      shift
      ;;
    --minor)
      BUMP_TYPE="minor"
      shift
      ;;
    --major)
      BUMP_TYPE="major"
      shift
      ;;
    *)
      echo "❌ Unknown argument: $arg"
      echo "Usage: ./release.sh [--version=X.Y.Z | --patch | --minor | --major]"
      exit 1
      ;;
  esac
done

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")

# Bump version if requested
VERSION_CHANGED=false
if [ -n "$NEW_VERSION" ]; then
  echo "📦 Bumping version from v$CURRENT_VERSION to v$NEW_VERSION"
  npm version "$NEW_VERSION" --no-git-tag-version
  VERSION="$NEW_VERSION"
  VERSION_CHANGED=true
elif [ -n "$BUMP_TYPE" ]; then
  echo "📦 Bumping $BUMP_TYPE version from v$CURRENT_VERSION"
  NEW_VERSION=$(npm version "$BUMP_TYPE" --no-git-tag-version | sed 's/v//')
  VERSION="$NEW_VERSION"
  VERSION_CHANGED=true
  echo "📦 New version: v$VERSION"
else
  VERSION="$CURRENT_VERSION"
  echo "📦 Version: v$VERSION (no bump requested)"
fi

# Check if version is already tagged
if git rev-parse "v$VERSION" >/dev/null 2>&1; then
    echo "❌ Tag v$VERSION already exists!"
    echo "   Please bump version in package.json first"
    exit 1
fi

# If version was changed, commit it
if [ "$VERSION_CHANGED" = true ]; then
  echo ""
  echo "📝 Committing version bump..."
  git add package.json
  git commit -m "chore: bump version to v$VERSION"
  echo "✅ Version bump committed"
fi

# Build before testing to ensure correct version is injected
echo ""
echo "🏗️  Building..."
npm run build

# Run tests
echo ""
echo "🧪 Running tests..."
npm run test:all

echo ""
echo "📝 Preview package contents..."
npm pack --dry-run

echo ""
echo "✅ Ready to release v$VERSION"
echo ""
echo "This will:"
if [ "$VERSION_CHANGED" = true ]; then
  echo "  1. Push version bump commit to GitHub (main branch)"
  echo "  2. Create and push tag v$VERSION"
  echo "  3. Publish to NPM"
else
  echo "  1. Create and push tag v$VERSION"
  echo "  2. Publish to NPM"
  echo "  Note: No changes detected, will tag current commit"
fi
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Release cancelled"
    exit 1
fi

# Push to GitHub (only if there were changes)
if [ "$VERSION_CHANGED" = true ]; then
  echo ""
  echo "📤 Pushing to GitHub..."
  git push origin main
fi

# Create and push tag
echo ""
echo "🏷️  Creating tag v$VERSION..."
git tag -a "v$VERSION" -m "Release v$VERSION"

echo "📤 Pushing tag..."
git push origin "v$VERSION"

# Publish to NPM
echo ""
echo "📦 Publishing to NPM..."
npm publish

echo ""
echo "🎉 Release v$VERSION complete!"
echo ""
echo "✅ Next steps:"
echo "  - Verify on NPM: https://www.npmjs.com/package/mcp-shared-memory"
echo "  - Test install: npx -y mcp-shared-memory@$VERSION"
echo "  - Create GitHub release: https://github.com/Ideas-Net-Studio/mcp-shared-memory/releases/new?tag=v$VERSION"
