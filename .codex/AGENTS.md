# Codex Agent Instructions

> This file is read by OpenAI Codex when initialized in this project.
> For Claude Code, see CLAUDE.md in the project root.

## Project: POS System

Enterprise desktop POS application. Electron 41 + React 19 + TypeScript 5.9 + Tailwind 3 + Zustand 5.

## Quick Commands

```bash
pnpm install              # Install deps
pnpm dev                  # Dev server (Electron + Vite HMR)
pnpm typecheck            # TypeScript strict check
pnpm exec eslint . --ext .ts,.tsx  # Lint
pnpm test                 # 43 unit/integration tests
pnpm build                # Production build
```

## Critical Rules

1. **Never add `JSX.Element` return types** — React 19 removed global JSX namespace
2. **Never use `setState` inside `useEffect`** — Use `useMemo` for derived state
3. **Business data is NOT in SQL** — It's in Zustand (`storeOpsStore.ts`). Only auth uses the DB.
4. **Offline-first** — Never make features require server connectivity
5. **Always run `pnpm typecheck && pnpm test`** before finishing

## Architecture

- `src/main/` — Electron main process (auth DB, sync, IPC handlers)
- `src/preload/` — Context bridge (`window.api`)
- `src/renderer/src/` — React SPA
  - `stores/storeOpsStore.ts` — 4136-line business state (96+ actions, 50+ types)
  - `stores/authStore.ts` — User session
  - `stores/themeStore.ts` — Light/dark theme
  - `pages/` — 14 route pages
  - `lib/accessControl.ts` — Role + feature permission checks
  - `lib/deploymentConfig.ts` — Industry templates
  - `lib/dataExchange.ts` — Import/export (CSV/JSON/PDF)

## Path Aliases

- `@/` → `src/renderer/src/`
- `@main/` → `src/main/`
- `@preload/` → `src/preload/`

## Conventions

- Conventional commits: `feat:`, `fix:`, `chore:`, `ci:`
- Branch naming: `type/description`
- Type suffix: `Record` (e.g., `OrderRecord`, `StaffRecord`)
- shadcn/ui components in `components/ui/`

## Full Documentation

See `AGENTS.md` in project root for complete reference (all types, all actions, all IPC channels, all routes).
