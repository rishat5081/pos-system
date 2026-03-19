# CLAUDE.md — Claude Code Project Instructions

> Read by Claude Code at the start of every conversation. These are binding instructions.

## Project Overview

Enterprise-grade desktop Point of Sale and Business Management platform. Built with Electron 41, React 19, TypeScript 5.9, Tailwind CSS 3, and Zustand 5. Supports 5 industry verticals (retail, restaurant, salon, field service, grocery) with role-based access control and offline-first architecture.

## Tech Stack

- **Runtime**: Electron 41, Node >= 20
- **Frontend**: React 19, TypeScript 5.9 (strict)
- **Styling**: Tailwind CSS 3, shadcn/ui, Radix UI
- **State**: Zustand 5 (storeOpsStore.ts — 4136 lines, 96+ actions)
- **Forms**: React Hook Form + Zod 4
- **Routing**: React Router 6
- **Database**: JSON file (auth only) + Zustand snapshots (business data)
- **Build**: electron-vite 4 (Vite 7)
- **Testing**: Vitest 4, React Testing Library, Playwright
- **Linting**: ESLint 9 (flat config) + typescript-eslint + react-hooks v7
- **Package manager**: pnpm 10

## Build & Test Commands

```bash
pnpm dev              # Dev server (Electron + Vite HMR)
pnpm build            # Production build
pnpm typecheck        # tsc --noEmit
pnpm lint             # ESLint (may race with build - use exec variant below)
pnpm exec eslint . --ext .ts,.tsx   # Reliable direct lint
pnpm test             # Vitest (43 tests)
pnpm test:e2e         # Playwright E2E
pnpm test:watch       # Vitest watch mode
```

## Key Architectural Decisions

1. **Offline-first**: All business state in Zustand. Sync is optional and async. Never make features depend on server connectivity.
2. **Two-layer storage**: Auth in `data/localDatabase.json` (main process, scrypt). Business ops in Zustand store (renderer process).
3. **Feature flags**: Deployment templates control enabled features. Access control checks feature keys at both route and UI level.
4. **Role + overrides**: 3 roles (super_admin, manager, cashier) + per-user feature grants/revokes.
5. **Snapshot sync**: Entire store state serialized → queue → server. Local state wins conflicts.

## Path Aliases

```
@/        → src/renderer/src/
@main/    → src/main/
@preload/ → src/preload/
```

## Critical Files

| File | Lines | Purpose |
|------|-------|---------|
| `src/renderer/src/stores/storeOpsStore.ts` | 4136 | All business state + 96 actions + 50 types |
| `src/renderer/src/lib/accessControl.ts` | ~200 | Permission logic |
| `src/renderer/src/App.tsx` | ~80 | All routes |
| `src/main/database/localDatabase.ts` | ~300 | Auth DB |
| `src/renderer/src/lib/deploymentConfig.ts` | ~150 | Industry templates |

## Conventions

- **State**: Business data in `storeOpsStore`, auth in `authStore`, theme in `themeStore`
- **Types**: `Record` suffix for data types (`OrderRecord`, `StaffRecord`)
- **Components**: shadcn/ui in `components/ui/`, layout in `components/layout/`
- **No global JSX**: React 19 — never use `JSX.Element` as return type
- **Tailwind 3**: Not v4 — uses `tailwind.config.ts` with CSS variable theme
- **React Router 6**: Not v7 — uses `<Routes>/<Route>` pattern
- **Commits**: Conventional commits (`feat:`, `fix:`, `chore:`, `ci:`)
- **Branches**: `type/description` (`feat/add-printing`, `fix/cart-total`)
- **Tests must pass**: 43/43 unit tests + typecheck + lint before any commit

## Do NOT

- Add `JSX.Element` return type annotations
- Use `setState` directly inside `useEffect` (use `useMemo` for derived state)
- Create SQL tables for business data (products, orders, etc. are in Zustand)
- Break offline functionality by requiring server connectivity
- Skip running `pnpm typecheck && pnpm lint && pnpm test` before committing
- Use Tailwind v4 syntax or React Router v7 APIs

## Important Context

- **Demo credentials**: admin / admin123
- **Setup wizard**: First login redirects to `/setup` if deployment not configured
- **Deployment templates**: Retail, Restaurant, Salon, Field Service, Grocery + Dairy, All In One
- **13 IPC channels**: 8 auth + 5 sync (see AGENTS.md for full list)
- **CI/CD**: GitHub Actions — CI (typecheck/lint/test/build), E2E, code quality, release, dependency review, stale management, PR checks
- **Branch protection**: main requires passing CI status checks

## For Full Details

See `AGENTS.md` for comprehensive architecture reference, all types, all actions, all IPC channels, and agent task guides.
