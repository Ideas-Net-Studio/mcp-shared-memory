# Release Workflow

This document outlines the process for releasing new versions of mcp-shared-memory.

## Release Checklist

### Pre-Release

- [ ] All tests passing (`npm run test:all`)
- [ ] Version bumped in `package.json`
- [ ] Version bumped in `src/index.ts` (CURRENT_VERSION constant)
- [ ] CHANGELOG.md updated with new version entry
- [ ] Documentation updated (README, USAGE, etc.)
- [ ] Build tested locally (`npm run build`)

### Release Process

1. **Commit all changes to main branch**
   ```bash
   git add .
   git commit -m "Release v0.x.x: Brief description"
   git push origin main
   ```

2. **Create Git tag**
   ```bash
   git tag -a v0.x.x -m "Release v0.x.x: Description

   - Feature 1
   - Feature 2
   - Bug fixes
   
   Co-Authored-By: Warp <agent@warp.dev>"
   ```

3. **Push tag to GitHub**
   ```bash
   git push origin v0.x.x
   ```

4. **Publish to NPM**
   ```bash
   npm publish
   ```

5. **Create GitHub Release (Optional)**
   - Go to: https://github.com/Ideas-Net-Studio/mcp-shared-memory/releases/new
   - Select the tag you just created
   - Add release notes from CHANGELOG
   - Publish release

### Post-Release

- [ ] Verify NPM package: https://www.npmjs.com/package/mcp-shared-memory
- [ ] Test installation: `npx -y mcp-shared-memory@0.x.x`
- [ ] Update directory listings if needed (see docs/PUBLISH.md)
- [ ] Announce release (optional: Twitter, Discord, etc.)

## Versioning Strategy

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

### Version Bump Commands

```bash
npm version patch  # 0.1.2 -> 0.1.3 (bug fixes)
npm version minor  # 0.1.2 -> 0.2.0 (new features)
npm version major  # 0.1.2 -> 1.0.0 (breaking changes)
```

**Note:** `npm version` automatically:
- Updates `package.json`
- Creates a git commit
- Creates a git tag

**Remember to also update:**
- `src/index.ts` (CURRENT_VERSION constant)
- `docs/CHANGELOG.md`

## Quick Release (All-in-One)

For streamlined releases after version is bumped:

```bash
# Push changes and tag
git push origin main
git push origin v0.x.x

# Publish to NPM
npm publish

# Done!
```

## Rollback a Release

If you need to unpublish a version (within 72 hours of publishing):

```bash
# Unpublish specific version
npm unpublish mcp-shared-memory@0.x.x

# Delete tag locally and remotely
git tag -d v0.x.x
git push origin :refs/tags/v0.x.x
```

**Warning:** Unpublishing is discouraged. Consider publishing a patch version instead.

## Release Automation (Future)

Consider setting up GitHub Actions to automate:
- Run tests on tag push
- Auto-publish to NPM on new tags
- Create GitHub releases automatically
- Update documentation sites

Example workflow: `.github/workflows/release.yml`

## Checking Current Version

```bash
# NPM
npm view mcp-shared-memory version

# Git tags
git tag -l

# Package.json
cat package.json | grep version
```

## Example Release (v0.1.2)

```bash
# 1. All changes committed and pushed to main
git push origin main

# 2. Create and push tag
git tag -a v0.1.2 -m "Release v0.1.2: Version Management"
git push origin v0.1.2

# 3. Publish to NPM
npm publish

# 4. Verify
npm view mcp-shared-memory@0.1.2
```

## Notes

- Always test locally before publishing
- Use `npm pack` to preview what will be published
- Tag format: `v{MAJOR}.{MINOR}.{PATCH}` (e.g., v0.1.2)
- Keep CHANGELOG.md updated for every release
- Coordinate major releases with documentation updates
