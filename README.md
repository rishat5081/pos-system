<p align="center">
  <img src="https://img.shields.io/badge/Electron-41-47848F?style=for-the-badge&logo=electron&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Zustand-5.0-764ABC?style=for-the-badge" />
  <img src="https://img.shields.io/github/actions/workflow/status/rishat5081/pos-system/ci.yml?style=for-the-badge&label=CI" />
</p>

<h1 align="center">🏪 POS System</h1>
<p align="center"><strong>Enterprise-grade Point of Sale & Business Management Platform</strong></p>
<p align="center">
  A cross-platform desktop POS application built with Electron, React, TypeScript, and Tailwind CSS. Supports retail, restaurant, salon, field service, and grocery industries with a unified platform architecture.
</p>
<p align="center">
  <a href="#-getting-started">⚡ Getting Started</a> · <a href="#-features">✨ Features</a> · <a href="#-architecture">🏗️ Architecture</a> · <a href="CONTRIBUTING.md">🤝 Contributing</a>
</p>

---

## ✨ Features

### 🛒 Core Commerce
- 💳 **POS Checkout** — Cart management, stock deduction, payment processing, register open/close
- 📋 **Order Management** — Status tracking, CSV import with header analysis, custom fields, invoicing, due reminders, delivery tracking
- 📦 **Inventory** — Categories, stock adjustments, reorder alerts, product CRUD
- 👥 **Customers** — Loyalty programs, credit actions, activity history
- 📊 **Dashboard** — KPI summaries, visual analytics
- 📈 **Reports** — Operational and financial summaries
- 🖥️ **Counter Management** — Assignment and active work state tracking

### 👔 HR & Workforce
- Employee directory, attendance, payroll, and loan tracking
- Department transfers with export history
- Meetings, appointments, shift planning, and calendar views

### 🏭 Cross-Industry Modules
| | Industry | Capabilities |
|---|----------|-------------|
| 🏬 | **Retail** | Standard POS, inventory, customers |
| 🍽️ | **Restaurant** | Table management, kitchen tickets |
| 💇 | **Salon** | Services, bookings, deposits, no-show handling |
| 🔧 | **Field Service** | Job dispatch, estimates, invoice conversion |
| 🛒 | **Grocery & Dairy** | Subscriptions, route manifests |

### 📤 Data Exchange
- **Export** formats: CSV, TSV, JSON, TXT, PDF, XLSX
- **Import** formats: CSV, TSV, JSON, TXT with header analysis
- Full snapshot backup/restore via JSON with PDF summary

### 🔐 Platform Controls
- Role-based access: `super_admin`, `manager`, `cashier`
- Per-user feature overrides with job-function presets
- Light/dark theme, i18n (locale, currency, timezone, date format)
- Offline-first with sync controls

## 🛠️ Tech Stack

| | Layer | Technology |
|---|-------|-----------|
| ⚡ | **Runtime** | Electron 41 |
| ⚛️ | **Frontend** | React 19, TypeScript 5.9 |
| 🎨 | **Styling** | Tailwind CSS 3, shadcn/ui, Radix UI |
| 🧠 | **State** | Zustand 5.0 |
| 📝 | **Forms** | React Hook Form + Zod validation |
| 🧭 | **Routing** | React Router 6 |
| 🗄️ | **Database** | Drizzle ORM (SQLite) |
| 🔨 | **Build** | Vite 7, electron-vite 4 |
| 🧪 | **Testing** | Vitest 4, React Testing Library, Playwright |
| 🔍 | **Linting** | ESLint 9 with TypeScript plugin |

## 🏗️ Architecture

```
src/
├── main/                  # Electron main process
│   ├── index.ts           # App entry, window management
│   └── services/          # IPC handlers, database, auth
├── preload/               # Context bridge
└── renderer/              # React application
    └── src/
        ├── components/    # Reusable UI components (shadcn/ui)
        ├── pages/         # Route-level page components
        ├── stores/        # Zustand state management
        ├── flows/         # Business logic & integration tests
        ├── lib/           # Utilities and helpers
        └── types/         # TypeScript type definitions
```

## ⚡ Getting Started

### 📋 Prerequisites

- **Node.js** >= 20
- **pnpm** >= 10

### 📥 Installation

```bash
# Clone the repository
git clone https://github.com/rishat5081/pos-system.git
cd pos-system

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### 🔑 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Super Admin | `admin` | `admin123` |

### 🧙 First-Run Setup

After login, the setup wizard guides you through:
1. **Deployment template** — Retail, Restaurant, Salon, Field Service, Grocery + Dairy, or All In One
2. **Store identity** — Business name and details
3. **Industries** — Enable relevant industry modules
4. **Modules** — Configure active features

The wizard can be re-opened from Settings by a `super_admin` without losing operational data.

## ⌨️ Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Production build (main + renderer + preload) |
| `pnpm preview` | Preview production build |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint` | ESLint check |
| `pnpm test` | Run unit/integration tests (Vitest) |
| `pnpm test:e2e` | Run E2E tests (Playwright) |
| `pnpm test:watch` | Watch mode for tests |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:migrate:create` | Generate new migration |
| `pnpm db:seed` | Seed database with sample data |

## 🔐 Access Control

### 👥 Role Hierarchy

```
super_admin
├── Full platform access
├── Super Admin Console
├── User Management
└── Setup Wizard rerun

manager
├── Business Suite
├── HR modules
├── Inventory, Counters
├── Reports, Settings
└── Vertical operating modules

cashier
├── Dashboard
├── POS
├── Orders
└── Customers
```

### 🔧 Per-User Overrides

Features can be explicitly `allowed` or `revoked` per account, applied on top of role defaults. Job-function presets provide curated override bundles for common roles.

## 🏗️ CI/CD

This project uses GitHub Actions for continuous integration:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **CI** | Push/PR to main | Typecheck, lint, test (Node 20+22), build |
| **E2E** | PR to main | Playwright browser tests |
| **Code Quality** | PR + weekly | Security audit, license check, bundle size |
| **Release** | `v*` tags | Cross-platform build + GitHub Release |
| **Dependency Review** | PR to main | Vulnerability scanning |
| **Stale** | Daily cron | Auto-close inactive issues/PRs |
| **PR Checks** | PR events | Conventional commit titles, branch naming |

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [AGENTS.md](AGENTS.md) | AI agent context (Claude Code, Codex, Cursor) |
| [CLAUDE.md](CLAUDE.md) | Claude Code project instructions |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development setup, coding standards, PR guidelines |
| [docs/HANDBOOK.md](docs/HANDBOOK.md) | Developer handbook (full reference) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, data flow, security model |
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | IPC channels, store actions, utility functions |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Complete type reference (50+ interfaces) |
| [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) | Functional & non-functional requirements |
| [docs/TESTING.md](docs/TESTING.md) | Test strategy, writing tests, CI |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Build, release, CI/CD pipeline |

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding standards, and pull request guidelines.

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ⚡ Electron &nbsp;·&nbsp; ⚛️ React &nbsp;·&nbsp; 🔷 TypeScript &nbsp;·&nbsp; 🎨 Tailwind CSS
</p>
<p align="center">
  <sub>Made by <a href="https://github.com/rishat5081">@rishat5081</a></sub>
</p>
