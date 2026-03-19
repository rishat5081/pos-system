# Contributing

Thanks for your interest in contributing to POS System! This guide covers the development workflow and conventions.

## Development Setup

```bash
# Fork and clone
git clone https://github.com/<your-username>/pos-system.git
cd pos-system

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

### Prerequisites

- Node.js >= 20
- pnpm >= 10

## Branch Naming

Use the format: `type/description`

```
feat/add-receipt-printing
fix/cart-total-rounding
docs/update-api-reference
refactor/extract-auth-service
test/add-checkout-coverage
chore/update-dependencies
```

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add receipt printing support
fix: correct cart total rounding for tax
docs: update deployment instructions
refactor: extract auth service from main process
test: add checkout flow integration tests
chore: update eslint config
```

### Types

| Type | When to use |
|------|------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructure, no behavior change |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `build` | Build system or dependencies |
| `ci` | CI/CD changes |
| `chore` | Maintenance tasks |
| `revert` | Reverting a previous commit |

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear, atomic commits
3. Ensure all checks pass:
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   pnpm build
   ```
4. Open a PR against `main`
5. Fill out the PR template
6. Wait for review from @rishat5081

### PR Title

PR titles must follow conventional commit format (enforced by CI):

```
feat: add barcode scanner support
fix: resolve inventory sync conflict
```

## Code Style

- TypeScript strict mode
- ESLint with the project config (`eslint.config.js`)
- Tailwind CSS for styling
- Zustand for state management
- Zod for runtime validation

## Testing

- **Unit/Integration**: Vitest + React Testing Library
- **E2E**: Playwright (Chromium)

```bash
pnpm test           # Run all unit/integration tests
pnpm test:watch     # Watch mode
pnpm test:e2e       # Run E2E tests
```

## Project Structure

```
src/
├── main/          # Electron main process
├── preload/       # Context bridge
└── renderer/src/
    ├── components/  # Reusable UI (shadcn/ui)
    ├── pages/       # Route pages
    ├── stores/      # Zustand stores
    ├── flows/       # Business logic + tests
    ├── lib/         # Utilities
    └── types/       # Type definitions
```

## Questions?

Open an issue or reach out to the maintainers.
