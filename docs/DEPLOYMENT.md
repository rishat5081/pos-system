# Deployment Guide

## Development

```bash
pnpm install
pnpm dev
```

Opens Electron window with Vite HMR. Changes to renderer code hot-reload. Main process changes require restart.

## Production Build

```bash
pnpm build
```

Outputs to `out/`:
- `out/main/index.js` — Main process (25 KB)
- `out/preload/index.mjs` — Preload script (1.2 KB)
- `out/renderer/` — Static SPA (index.html + ~1.5 MB JS + ~46 KB CSS)

## Release Process

### Automated (GitHub Actions)

Push a version tag to trigger cross-platform builds:

```bash
# Update version in package.json
pnpm version patch   # or minor, or major

# Push tag
git push origin main --tags
```

The `release.yml` workflow:
1. Builds on Ubuntu, macOS, and Windows
2. Uploads artifacts
3. Creates a GitHub Release with auto-generated notes

### Manual

```bash
pnpm build
# Distribute out/ directory
```

## Environment Configuration

### Data Storage

| File | Location | Purpose |
|------|----------|---------|
| `data/localDatabase.json` | Project root | Auth DB (users, roles, stores) |
| `data/syncState.json` | Project root | Sync queue and remote snapshots |

These files are created automatically on first run. To reset the app, delete both files.

### Default Admin Account

Created on first run:
- Username: `admin`
- Password: `admin123`
- Role: `super_admin`

### Sync Server

Configure in Settings > Sync. Leave empty for offline-only mode.

## CI/CD Pipeline

### Branch Protection

The `main` branch requires these checks to pass:
- Typecheck
- Lint
- Unit Tests (Node 20)
- Unit Tests (Node 22)
- Build

Force pushes and deletions are blocked.

### Workflow Summary

| Workflow | File | Trigger |
|----------|------|---------|
| CI | `ci.yml` | Push/PR to main |
| E2E | `e2e.yml` | PR to main |
| Code Quality | `code-quality.yml` | PR + weekly Monday |
| Release | `release.yml` | `v*` tags |
| Dependency Review | `dependency-review.yml` | PR to main |
| Stale | `stale.yml` | Daily midnight |
| PR Checks | `pr-checks.yml` | PR opened/edited |

### Dependabot

Configured in `.github/dependabot.yml`:
- Weekly npm dependency updates (grouped by dev/production)
- Weekly GitHub Actions version updates
- Conventional commit prefixes (`chore(deps):`, `ci(actions):`)

## Troubleshooting

### Build fails on CI

Check that `pnpm install --frozen-lockfile` succeeds. If lockfile is out of date:
```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: update lockfile"
```

### Electron fails to start

Ensure native dependencies installed:
```bash
pnpm install
node node_modules/electron/install.js
```

### Tests pass locally but fail in CI

Check Node version. CI runs on Node 20 and 22. Local version should match:
```bash
node --version  # Should be >= 20
```
