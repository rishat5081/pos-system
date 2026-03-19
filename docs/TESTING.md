# Testing Guide

## Overview

| Type | Tool | Files | Tests |
|------|------|-------|-------|
| Unit/Integration | Vitest 4 + React Testing Library | 11 | 43 |
| E2E | Playwright | 2 | Browser flows |

## Running Tests

```bash
pnpm test           # All unit/integration tests (single run)
pnpm test:watch     # Watch mode (re-runs on change)
pnpm test:e2e       # E2E tests (requires Chromium installed)
```

## Test Files

### Store Tests (`stores/__tests__/`)

| File | Scope |
|------|-------|
| `authStore.test.ts` | Login, logout, session hydration, error states |
| `storeOpsStore.test.ts` | All 96+ business actions (checkout, HR, orders, etc.) |
| `themeStore.test.ts` | Theme toggle, persistence, hydration |

### Page Tests (`pages/__tests__/`)

| File | Scope |
|------|-------|
| `loginPage.test.tsx` | Login form rendering, validation, error display |
| `homePage.test.tsx` | Feature showcase, module rendering |
| `dashboardSettings.test.tsx` | KPI calculations, data display |

### Utility Tests (`lib/__tests__/`)

| File | Scope |
|------|-------|
| `permissionPresets.test.ts` | Permission override logic, role presets |
| `dataExchange.test.ts` | CSV/JSON parsing, export formatting, header matching |

### Layout Tests (`components/layout/__tests__/`)

| File | Scope |
|------|-------|
| `layout.test.tsx` | Sidebar, topbar, main layout rendering |

### Integration Tests (`flows/__tests__/`)

| File | Scope |
|------|-------|
| `appFlow.test.tsx` | End-to-end business workflows |
| `apiExecutionReport.test.ts` | API invocation patterns and coverage |

### E2E Tests (`tests/e2e/`)

| File | Scope |
|------|-------|
| `authNavigation.spec.ts` | Login → app navigation → logout |
| `routeGuard.spec.ts` | Role-based route access enforcement |

## Test Configuration

### Vitest (`vitest.config.ts`)

- Environment: `jsdom`
- Setup: `src/renderer/src/test/setup.ts`
- Path aliases: Same as `tsconfig.json`
- Globals: enabled

### Playwright (`playwright.config.ts`)

- Browser: Chromium only
- Workers: 1 (serial execution)
- Dev server: `pnpm dev`

## Writing New Tests

### Store Action Test

```typescript
import { useStoreOpsStore } from '@/stores/storeOpsStore';

describe('myAction', () => {
  beforeEach(() => {
    useStoreOpsStore.setState(/* initial state */);
  });

  it('should do something', () => {
    const { myAction } = useStoreOpsStore.getState();
    myAction(params);

    const state = useStoreOpsStore.getState();
    expect(state.something).toBe(expected);
  });
});
```

### Component Test

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

### Mocking IPC

Tests mock `window.api` in the setup file. To customize:

```typescript
vi.spyOn(window, 'api', 'get').mockReturnValue({
  login: vi.fn().mockResolvedValue(mockUser),
  // ... other methods
});
```
