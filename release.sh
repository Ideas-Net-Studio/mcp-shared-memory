#!/bin/bash

# Quick Release Script for mcp-shared-memory
# Usage: ./release.sh

set -e

echo "🚀 Starting release process for mcp-shared-memory..."

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "📦 Version: v$VERSION"

# Check if version is already tagged
if git rev-parse "v$VERSION" >/dev/null 2>&1; then
    echo "❌ Tag v$VERSION already exists!"
    echo "   Please bump version in package.json first"
    exit 1
fi

# Run tests
echo ""
echo "🧪 Running tests..."
npm run test:all

echo ""
echo "🏗️  Building..."
npm run build

echo ""
echo "📝 Preview package contents..."
npm pack --dry-run

echo ""
echo "✅ Ready to release v$VERSION"
echo ""
echo "This will:"
echo "  1. Push to GitHub (main branch)"
echo "  2. Create and push tag v$VERSION"
echo "  3. Publish to NPM"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Release cancelled"
    exit 1
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push origin main

# Create and push tag
echo ""
echo "🏷️  Creating tag v$VERSION..."
git tag -a "v$VERSION" -m "Release v$VERSION

Co-Authored-By: Warp <agent@warp.dev>"

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
