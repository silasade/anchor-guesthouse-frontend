# UI guide

The interface is a **cool monochrome system**. Every surface, control and chart
series is drawn from a single neutral ramp with a faint blue cast (hue 260 in
OKLCH, chroma ≤ 0.006). Hierarchy comes from contrast, weight and spacing rather
than from colour.

There is exactly one chromatic token — `--destructive` — kept desaturated but
distinguishable, because irreversible actions need to read as dangerous at a
glance.

---

## Tokens

All tokens live in `src/index.css`, defined twice (`:root` and `.dark`) and
bridged into Tailwind through `@theme inline`. Components reference the semantic
utility, never the raw value.

| Token | Utility | Used for |
| --- | --- | --- |
| `--background` / `--foreground` | `bg-background`, `text-foreground` | Page base |
| `--card` / `--card-foreground` | `bg-card` | Panels, cards, tables |
| `--popover` | `bg-popover` | Dialogs, dropdowns, select menus, toasts |
| `--primary` | `bg-primary` | Primary buttons, active nav — near-black in light, near-white in dark |
| `--secondary` | `bg-secondary` | Secondary buttons, mid-weight badges |
| `--muted` / `--muted-foreground` | `bg-muted`, `text-muted-foreground` | Fills, hints, captions |
| `--accent` | `bg-accent` | Hover states |
| `--destructive` | `bg-destructive`, `text-destructive` | Delete, cancel, field errors |
| `--success` / `--warning` | `bg-success`, `bg-warning` | Retained as neutral steps, not hues |
| `--border` / `--input` / `--ring` | `border-border`, `ring-ring` | Edges and focus rings |
| `--chart-1…5` | `var(--chart-n)` | Chart series, light → dark ramp |
| `--sidebar-*` | `bg-sidebar`, … | Navigation rail |

Because `--primary` inverts between themes, a primary button is black-on-white in
light mode and white-on-black in dark mode without any per-theme class.

### Adding or changing colours

Edit `index.css` only. Define the token in **both** `:root` and `.dark`, then map
it inside `@theme inline`. A hard-coded `text-blue-500` anywhere in `src/` is a
bug — it will not respond to the theme.

---

## Status without colour

A monochrome palette cannot lean on red/amber/green, so status is carried by
**fill weight**, with a redundant dot marker on room statuses.

| Weight | Reads as | Room status | Reservation status |
| --- | --- | --- | --- |
| Solid (`default`) | Active right now | `OCCUPIED` | `CHECKED_IN` |
| Filled mid (`secondary`) | Committed | `RESERVED` | — |
| Outline | Open / pending | `AVAILABLE` | `RESERVED` |
| Muted | Closed | `MAINTENANCE` | `CHECKED_OUT` |
| Tinted destructive | Terminated | — | `CANCELLED` |

All of this is centralised in `global_components/StatusBadge/`, which exports
`RoomStatusBadge`, `ReservationStatusBadge`, `RoleBadge` and `CategoryBadge`.
Render one of those rather than a bare `<Badge>`, so a status means the same
thing on the catalogue, the front desk and the reports screen.

---

## Typography and spacing

- **Inter Variable**, self-hosted via `@fontsource-variable/inter`. No external
  font request, so nothing blocks first paint.
- Page titles `text-xl sm:text-2xl font-semibold tracking-tight`; section
  headings `text-lg`; body `text-sm`; metadata `text-xs text-muted-foreground`.
- Numeric emphasis (stat tiles, money) is `text-2xl font-semibold tracking-tight`.
- Radius scale derives from `--radius: 0.75rem`; cards use `rounded-xl`, controls
  `rounded-md`.
- Vertical rhythm inside a screen is `space-y-6`; grids gap `gap-4`.

---

## Primitives — `components/ui/`

Standard shadcn/ui components on Radix. Regenerate with
`npx shadcn@latest add <name>`.

`alert` · `alert-dialog` · `avatar` · `badge` · `button` · `card` · `dialog` ·
`dropdown-menu` · `input` · `label` · `progress` · `select` · `separator` ·
`skeleton` · `sonner` · `table` · `tabs` · `textarea`

Two are locally extended:

- **`badge`** adds `soft`, `soft-muted`, `soft-destructive`, `success` and
  `warning` variants for the status vocabulary above.
- **`progress`** is a plain element rather than the Radix primitive, so it can
  render inside tight table cells and stat panels.

---

## Shared components — `global_components/`

| Component | Purpose |
| --- | --- |
| `DashboardShell` | Sidebar + top bar chrome for `/dashboard/*` |
| `Sidebar` | Role-filtered navigation; drawer below `lg`, fixed rail above |
| `Header` / `Footer` | Public marketing shell |
| `PageHeader` | Screen title, description and action slot |
| `StatCard` | Metric tile with icon, hint and built-in skeleton state |
| `StatusBadge` | The four status badge components |
| `RoomCard` | Catalogue tile with a reserve action |
| `ReservationCard` | Stay summary with dates, nights, cost and cancel action |
| `ReserveRoomModal` | Date entry with a live nights-and-cost preview |
| `ConfirmationModal` | Confirm gate for check-in, check-out, cancel, delete |
| `SearchInput` | Debounced text filter with a clear affordance |
| `TablePagination` | Client-side pager with a range readout |
| `EmptyState` | Zero-result panel with an optional recovery action |
| `LoadingPage` / `NotFoundPage` / `ErrorBoundaryPage` | Full-page states |
| `ThemeToggle` | Light/dark switch |
| `ProtectedRoute` | Auth and role gate |
| `Logo` | Wordmark, with a `markOnly` variant |

---

## Loading, empty and error states

Every data screen handles three cases explicitly; none of them is optional.

1. **Loading** — skeletons shaped like the eventual content (card grids get card
   skeletons, tables get row bars), not a spinner. `StatCard` takes `isLoading`
   directly.
2. **Empty** — `EmptyState` with an icon, a plain-language reason, and an action
   that resolves it where one exists ("Browse the catalogue", "Add rooms").
3. **Error** — the API's own message, via a Sonner toast from the mutation, or
   `ErrorBoundaryPage` for a thrown render error.

---

## Responsiveness

Mobile-first. Breakpoints: `sm` 640, `lg` 1024, `xl` 1280.

- The sidebar is an overlay drawer below `lg` and a sticky rail above it.
- Card grids run 1 → 2 (`md`) → 3 (`xl`) columns.
- Tables scroll horizontally inside their own container; the page body never
  scrolls sideways.
- Filter bars stack vertically below `sm`.

---

## Accessibility

- Labels are bound to inputs with `htmlFor` / `id`; invalid fields set
  `aria-invalid` and render the message beneath.
- Icon-only buttons carry `aria-label`.
- Focus is a 3px `ring-ring` ring, never removed.
- Radix supplies focus trapping, escape handling and roles for every dialog,
  menu and select.
- Room status has a dot marker in addition to its fill weight, so it does not
  rely on a single visual channel.
