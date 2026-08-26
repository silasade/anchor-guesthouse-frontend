# StayHub — Guest House & Student Hostel Frontend

React frontend for the **Guest House & Student Hostel Reservation Management
System**. Guests and students reserve rooms and bedspaces, receptionists run
check-in and check-out at the front desk, and administrators manage inventory
and pull period analytics.

It is a client for the [reservation API](#backend); it holds no business rules
of its own beyond mirroring the ones the API enforces.

---

## Stack

| Concern | Choice |
| --- | --- |
| Build tool | Vite 8 |
| Language | TypeScript 6 (strict) |
| UI | React 19 |
| Routing | TanStack Router (file-based, auto code-split) |
| Server state | TanStack Query v5 |
| Styling | Tailwind CSS v4 + shadcn/ui primitives on Radix |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Notifications | Sonner |
| Dates | Day.js |
| Linting | oxlint |

---

## Quick start

### 1. Install

```bash
npm install
```

### 2. Configure

```bash
cp .env.example .env
```

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_APP_BASE_URL` | API origin. **Must end with a trailing slash** — the client appends `api/v1/<path>`. | `http://localhost:8000/` |
| `VITE_APP_NAME` | Product name in the header, footer and page title. | `StayHub` |
| `VITE_APP_CURRENCY` | ISO 4217 code used to format every money value. | `NGN` |

### 3. Run

```bash
npm run dev
```

The dev server listens on <http://localhost:3001>.

### Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server with HMR on port 3001 |
| `npm run build` | Type-check (`tsc -b`) then production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | oxlint over `src/` |

---

## Backend

The API lives in a separate repository and must be running for anything past the
landing and auth pages to work.

```bash
cd "../Multi-Tenant Organization Management System"
npm install
npm run seed   # sample admin, receptionist, guest, student + rooms
npm run dev    # http://localhost:8000, Swagger UI at /api-docs
```

The API requires MongoDB — either a reachable Atlas cluster (with your current
IP allow-listed) or a local `mongod` on `127.0.0.1:27017`. It exits on startup
if it can reach neither.

CORS is open on the API, so the frontend calls it directly; no dev proxy is
configured.

### Seeded accounts

`npm run seed` in the API repository creates:

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@guesthouse.com` | `adminpassword123` |
| Receptionist | `receptionist@guesthouse.com` | `receptionpassword123` |
| Guest | `guest@example.com` | `password123` |
| Student | `student@university.edu` | `password123` |

Change these before any deployment that is reachable from outside your machine.

---

## What each role sees

Navigation and route guards mirror the API's `authenticate` / `authorize`
middlewares. The server stays the authority; the UI only avoids showing people
screens that would return 401 or 403.

| Screen | Route | Guest | Student | Receptionist | Admin |
| --- | --- | :-: | :-: | :-: | :-: |
| Landing | `/` | ✅ | ✅ | ✅ | ✅ |
| Sign in / Register | `/login`, `/register` | ✅ | ✅ | ✅ | ✅ |
| Overview | `/dashboard` | ✅ | ✅ | ✅ | ✅ |
| Room catalogue | `/dashboard/rooms` | ✅ | ✅ | ✅ | ✅ |
| My reservations | `/dashboard/reservations` | ✅ | ✅ | — | — |
| Front desk | `/dashboard/front-desk` | — | — | ✅ | ✅ |
| Manage rooms | `/dashboard/manage-rooms` | — | — | — | ✅ |
| Reports | `/dashboard/reports` | — | — | — | ✅ |

Booking is category-locked by the API: guests may only reserve `SINGLE` guest
rooms, students only `DOUBLE` / `TRIPLE` bedspaces. Staff roles hold no booking
rights, so the catalogue renders read-only for them.

---

## Project layout

```
src/
├── components/ui/       shadcn primitives (button, dialog, table, …)
├── global_components/   Cross-route components, one folder per component
├── hooks/               useSession, useTheme, useDebouncedValue
├── lib/                 cn, formatters, date maths, auth cookie, toasts
├── routes/              File-based routes; route-local UI in local_components/
├── services/            api.ts + queries/ + mutations/ + queryKeys.ts
└── utils/               types/, constants, navigation, reservation helpers
```

Full conventions, including where a new component or endpoint belongs, are in
[docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md).

---

## Documentation

| Document | Covers |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layers, data flow, auth and session lifecycle, caching |
| [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) | Directory conventions and how to add a feature |
| [docs/API_INTEGRATION.md](docs/API_INTEGRATION.md) | Every endpoint, its hook, payloads and error handling |
| [docs/UI_GUIDE.md](docs/UI_GUIDE.md) | Design tokens, the monochrome system, component inventory |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Building, environment, SPA hosting and rewrites |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common failures and their causes |

---

## Licence

ISC.
