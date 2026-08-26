# Folder structure & conventions

The layout follows the conventions used in the sibling projects `plentlypay`
(Vite + TanStack Router) and `cloudivi2.0` (Next.js): a **global vs. local**
component split, a **services** layer divided into queries and mutations, and
domain **types** kept apart from the code that uses them.

---

## Tree

```
guesthouse-frontend/
├── .claude/launch.json          Dev-server config for tooling
├── .env / .env.example          Vite environment variables
├── components.json              shadcn/ui CLI config
├── docs/                        This documentation
├── index.html                   SPA shell
├── public/                      Static assets copied verbatim
├── vite.config.ts               Router plugin, Tailwind, @ alias, port 3001
└── src/
    ├── main.tsx                 QueryClient + Router + Toaster; theme bootstrap
    ├── index.css                Design tokens, Tailwind theme bridge, base layer
    ├── routeTree.gen.ts         GENERATED — never edit
    │
    ├── assets/                  Images imported by components
    │
    ├── components/ui/           shadcn primitives
    │   ├── alert.tsx            alert-dialog.tsx  avatar.tsx   badge.tsx
    │   ├── button.tsx           card.tsx          dialog.tsx   dropdown-menu.tsx
    │   ├── input.tsx            label.tsx         progress.tsx select.tsx
    │   ├── separator.tsx        skeleton.tsx      sonner.tsx   table.tsx
    │   └── tabs.tsx             textarea.tsx
    │
    ├── global_components/       Used by more than one route
    │   ├── -formSchemas.ts      Shared Zod schemas (`-` = not a route)
    │   ├── ConfirmationModal/index.tsx
    │   ├── DashboardShell/index.tsx
    │   ├── EmptyState/index.tsx
    │   ├── ErrorBoundaryPage/index.tsx
    │   ├── Footer/index.tsx
    │   ├── Header/index.tsx
    │   ├── LoadingPage/index.tsx
    │   ├── Logo/index.tsx
    │   ├── NotFoundPage/index.tsx
    │   ├── PageHeader/index.tsx
    │   ├── ProtectedRoute/index.tsx
    │   ├── ReservationCard/index.tsx
    │   ├── ReserveRoomModal/index.tsx
    │   ├── RoomCard/index.tsx
    │   ├── SearchInput/index.tsx
    │   ├── Sidebar/index.tsx
    │   ├── StatCard/index.tsx
    │   ├── StatusBadge/index.tsx
    │   ├── TablePagination/index.tsx
    │   └── ThemeToggle/index.tsx
    │
    ├── hooks/
    │   ├── useDebouncedValue.ts
    │   ├── useSession.ts        Who is signed in, and what may they do
    │   └── useTheme.ts
    │
    ├── lib/
    │   ├── auth.ts              Token cookie + auth-user normalisation
    │   ├── date.ts              Noon-cutoff maths and date formatting
    │   ├── generateToast.ts     Sonner wrapper
    │   └── utils.ts             cn(), currency and number formatting
    │
    ├── routes/                  File-based routing
    │   ├── __root.tsx
    │   ├── index.tsx
    │   ├── login.tsx
    │   ├── register.tsx
    │   └── dashboard/
    │       ├── route.tsx        Layout route: guard + shell
    │       ├── index.tsx
    │       ├── rooms/
    │       │   ├── index.tsx
    │       │   └── local_components/RoomFilterBar/-index.tsx
    │       ├── reservations/index.tsx
    │       ├── front-desk/
    │       │   ├── index.tsx
    │       │   └── local_components/ReservationLedger/-index.tsx
    │       ├── manage-rooms/
    │       │   ├── index.tsx
    │       │   └── local_components/
    │       │       ├── EditRoomModal/-index.tsx
    │       │       ├── RoomFormModal/-index.tsx
    │       │       └── RoomInventoryTable/-index.tsx
    │       └── reports/
    │           ├── index.tsx
    │           └── local_components/
    │               ├── ReportCharts/-index.tsx
    │               └── ReportFilters/-index.tsx
    │
    ├── services/
    │   ├── api.ts               requests<T>() + APIError + checkHealth()
    │   ├── queryKeys.ts         Cache-key registry
    │   ├── queries/             Read hooks — Auth, Room, Reservation, Report
    │   └── mutations/           Write hooks — Auth, Room, Reservation
    │
    └── utils/
        ├── constants.ts         Labels, role rules, cutoff policy
        ├── navigation.ts        Role-gated dashboard nav
        ├── reservation.ts       Populated-vs-id guards, search matching
        └── types/
            ├── Auth.type.ts     Report.type.ts   Reservation.type.ts
            ├── Room.type.ts     common.ts
```

---

## The conventions

### Global vs. local components

| | `global_components/` | `routes/**/local_components/` |
| --- | --- | --- |
| Used by | Two or more routes | Exactly one route |
| Naming | `<Name>/index.tsx` | `<Name>/-index.tsx` |
| Import | `@/global_components/RoomCard` | `./local_components/RoomFilterBar/-index` |

Start local. Promote to `global_components/` the moment a second route needs it —
that move is the only signal that something is genuinely shared.

**Why the `-` prefix?** TanStack Router treats every file under `routes/` as a
potential route. A leading `-` excludes it, which is what allows UI to live
beside the screen that uses it instead of in a distant folder.

Each component gets its own **folder**, not a bare file, so styles, sub-parts and
fixtures can join it later without a rename cascade.

### `components/ui/` is generated, not authored

These are shadcn/ui primitives. Regenerate or update them with the CLI:

```bash
npx shadcn@latest add <component>
```

Keep app-specific logic out of them. `StatusBadge` is a good example of the right
seam: it wraps `ui/badge` with the project's status vocabulary rather than
editing the primitive.

### Services: queries vs. mutations

| Folder | Contains | Naming |
| --- | --- | --- |
| `services/queries/` | `useQuery` hooks — reads | `useGetRooms`, `useGetReport` |
| `services/mutations/` | `useMutation` hooks — writes | `useCreateRoom`, `useCheckInReservation` |

One file per domain (`Auth`, `Room`, `Reservation`, `Report`), matching the API's
route files. Toasts and cache invalidation live in the mutation, never in the
component that calls it.

### Types

`utils/types/<Domain>.type.ts` holds request and response shapes plus the enum
unions, exported as `as const` tuples so they can drive both types and `<Select>`
options:

```ts
export const ROOM_STATUSES = ["AVAILABLE", "RESERVED", "OCCUPIED", "MAINTENANCE"] as const;
export type RoomStatus = (typeof ROOM_STATUSES)[number];
```

`common.ts` holds the `APIResponse<T>` envelope and shared primitives.

### Import alias

`@/` maps to `src/` in both `vite.config.ts` and `tsconfig.app.json`. Use it for
everything except a sibling inside the same route folder, where a relative
`./local_components/…` reads better.

---

## Recipes

### Add a screen

1. Create `src/routes/dashboard/<name>/index.tsx` with
   `createFileRoute("/dashboard/<name>/")`.
2. Wrap the body in `<ProtectedRoute roles={[…]}>` if it is role-limited.
3. Add an entry to `DASHBOARD_NAV` in `src/utils/navigation.ts`, with `roles` set
   to match the guard.
4. Put screen-only UI in `local_components/<Part>/-index.tsx`.

`routeTree.gen.ts` regenerates automatically on the next dev-server tick.

### Add an endpoint

1. Type the request and response in `utils/types/<Domain>.type.ts`.
2. Add a key to `services/queryKeys.ts`.
3. Write the hook in `services/queries/` or `services/mutations/`, using
   `requests<T>()` and a `select` that unwraps to the payload.
4. For mutations, invalidate every key the write touches, and toast on both
   success and error.

### Add a shared component

Create `src/global_components/<Name>/index.tsx` with a default export. Compose it
from `components/ui/` primitives and semantic Tailwind tokens — never raw colour
literals, or it will not survive a theme change.
