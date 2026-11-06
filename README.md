# Towing Admin Web Application

A Next.js (TypeScript + Tailwind CSS) administration portal for the Towing Application ecosystem. It connects with the live REST backend to monitor dispatches, manage active tows, verify drivers, track fleet movements, and configure distance pricing.

---

## 🏗️ Architecture & Folder Structure

```text
towing_admin_app/
├── public/                       # Static public assets
├── src/
│   ├── app/                      # Next.js App Router (pages & layouts)
│   │   ├── (auth)/               # Auth route group
│   │   │   ├── login/            # Admin login screen
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/          # Authenticated dashboard route group
│   │   │   ├── customers/        # Customer directory & history
│   │   │   ├── drivers/          # Driver fleet & verification approvals
│   │   │   ├── live-map/         # Real-time GPS fleet tracking radar
│   │   │   ├── pricing/          # Distance, hook fee & surcharge configuration
│   │   │   ├── settings/         # API endpoints & access control settings
│   │   │   ├── tows/             # Tow dispatch requests & status filters
│   │   │   │   └── [id]/         # Detailed tow job & route inspection
│   │   │   ├── layout.tsx        # Dashboard shell layout wrapper
│   │   │   └── page.tsx          # Primary command center & KPI overview
│   │   ├── api/
│   │   │   └── health/           # Next.js BFF health check endpoint
│   │   ├── globals.css           # Tailwind v4 theme & global stylesheets
│   │   ├── layout.tsx            # Root HTML layout with context providers
│   │   └── providers.tsx         # Auth & Toast notification providers
│   │
│   ├── components/               # Modular React UI components
│   │   ├── common/               # EmptyState, LoadingSpinner, SearchBar
│   │   ├── dashboard/            # StatCard, KPI widgets
│   │   ├── layout/               # Sidebar, Topbar, DashboardShell
│   │   ├── tows/                 # TowStatusBadge, TowFilters
│   │   └── ui/                   # Reusable UI primitives (Button, Card, Badge, Input, Modal)
│   │
│   ├── context/                  # Global React state providers
│   │   ├── AuthContext.tsx       # Admin authentication & session state
│   │   └── NotificationContext.tsx # Toast alerts & flash notifications
│   │
│   ├── hooks/                    # Reusable React hooks
│   │   ├── useAuth.ts            # Auth state hook
│   │   ├── useDebounce.ts        # Search input debouncer
│   │   └── useLocalStorage.ts    # Browser storage sync hook
│   │
│   ├── lib/                      # Core helpers & utilities
│   │   ├── api/
│   │   │   ├── client.ts         # Type-safe fetch client with auth token headers
│   │   │   └── endpoints.ts      # Backend REST endpoint path mappings
│   │   ├── constants.ts          # App configuration, status enums & nav items
│   │   └── utils.ts              # Class name merger (cn), currency & date formatters
│   │
│   ├── services/                 # API integration service layer
│   │   ├── auth.service.ts       # Login, session verification
│   │   ├── customers.service.ts  # Customer management API calls
│   │   ├── drivers.service.ts    # Driver approval & verification API calls
│   │   └── tows.service.ts       # Tow booking dispatch & lifecycle API calls
│   │
│   └── types/                    # Strict TypeScript interfaces
│       ├── auth.ts               # Admin user & credential models
│       ├── customer.ts           # Customer profile models
│       ├── driver.ts             # Driver, tow truck & verification models
│       ├── index.ts              # Coordinates & pagination types
│       └── tow.ts                # Tow job, vehicle & pricing models
│
├── .env.example                  # Template environment variables
├── .env.local                    # Local environment config (live API URL)
├── next.config.ts                # Next.js build configuration
├── package.json                  # Scripts & dependencies
├── tsconfig.json                 # TypeScript compiler configuration
└── README.md
```

---

## 🚀 Getting Started

### 1. Install dependencies (already installed)
```bash
npm install
```

### 2. Start the development server
```bash
npm run dev
```

The portal runs by default at `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
npm start
```
