# API integration

Every call the frontend makes, the hook that makes it, and what comes back.

Base URL: `${VITE_APP_BASE_URL}api/v1` — e.g. `http://localhost:8000/api/v1`.
The `/health` probe is the one exception; it sits outside the version prefix.

---

## Response envelope

Every endpoint answers with the same wrapper:

```jsonc
{
  "success": true,
  "message": "Room reserved successfully",  // not always present
  "count": 12,                              // list endpoints only
  "data": { /* payload */ }
}
```

`requests<T>()` throws an `APIError` when the HTTP status is not `ok` **or**
`success` is `false`. Query hooks then `select` the useful branch of `data`, so
components receive `Room[]`, not `{ data: { rooms: Room[] } }`.

### Errors

| Status | Meaning | Handling |
| --- | --- | --- |
| 400 | Validation or a business rule (overlapping dates, wrong room category, illegal status transition) | `APIError.message` is the API's own text; `fieldErrors` carries `{ field, message }[]` from the Zod middleware |
| 401 | Missing, invalid or expired token | Cookie cleared, toast raised, guard redirects to `/login`. Not retried |
| 403 | Authenticated but wrong role | Message shown. Not retried |
| 404 | Room or reservation not found | Message shown |
| 500 | Server fault | Message shown; retried up to twice |

Mutations surface `error.message` through a Sonner toast, so route components
can `catch {}` and simply not navigate on failure.

---

## Authentication — `/auth`

| Endpoint | Hook | Notes |
| --- | --- | --- |
| `POST /auth/register` | `useRegister()` | Public. Stores the JWT and primes the session cache |
| `POST /auth/login` | `useLogin()` | Public. Same |
| `GET /auth/me` | `useGetSession()` | Enabled only when a token cookie exists |
| — | `useLogout()` | Client-only: drops the cookie, clears the cache |

**Shape mismatch to know about.** `register` and `login` return the user keyed by
`id`; `/auth/me` and the populated reservation payloads use `_id`.
`normalizeAuthUser()` in `src/lib/auth.ts` reconciles them so the UI sees one
`User` type.

**A note on roles at registration.** The API accepts any `role` on
`POST /auth/register`, including `ADMIN` — anyone who can reach the endpoint can
mint themselves an administrator account. The frontend's registration form only
offers `GUEST` and `STUDENT`, but that is cosmetic; a direct HTTP call bypasses
it. Restricting the accepted roles server-side is worth doing before this is
exposed beyond a local machine.

```ts
const { mutateAsync: login, isPending } = useLogin();
await login({ email, password });
```

---

## Rooms — `/rooms`

| Endpoint | Hook | Role |
| --- | --- | --- |
| `GET /rooms` | `useGetRooms(filters)` | Any signed-in user |
| `GET /rooms/:id` | `useGetRoom(id)` | Any signed-in user |
| `POST /rooms` | `useCreateRoom()` | Admin |
| `PUT /rooms/:id` | `useUpdateRoom()` | Admin |
| `DELETE /rooms/:id` | `useDeleteRoom()` | Admin |

**Query parameters** on the list: `category`, `status`, `isAvailable`. A filter
set to `"ALL"` is dropped by the client rather than sent. Free-text search has no
server counterpart and is applied client-side on `roomNumber`.

**`POST /rooms` is dual-purpose:**

```ts
// One room
await createRoom({ roomNumber: "G-104", category: "GUEST", roomType: "SINGLE", costPerNight: 15000 });

// A batch — numbering continues from the highest existing suffix for the prefix
await createRoom({ numberOfRooms: 20, prefix: "S-", category: "STUDENT", roomType: "DOUBLE", costPerNight: 5000 });
```

The API derives `totalBedspaces` from `roomType` (SINGLE 1, DOUBLE 2, TRIPLE 3)
and rejects mismatched pairings: guest rooms must be `SINGLE`, student rooms
`DOUBLE` or `TRIPLE`. `roomSchema` enforces both client-side, and the create form
keeps the two selects in step so an invalid pair cannot be submitted.

The response returns both `rooms` (the full batch) and `room` (the first),
covering either call style.

---

## Reservations — `/reservations`

| Endpoint | Hook | Role |
| --- | --- | --- |
| `POST /reservations` | `useCreateReservation()` | Any signed-in user |
| `GET /reservations/my-reservations` | `useGetMyReservations()` | Any signed-in user |
| `GET /reservations` | `useGetAllReservations(filters)` | Receptionist, Admin |
| `POST /reservations/:id/check-in` | `useCheckInReservation()` | Receptionist, Admin |
| `POST /reservations/:id/check-out` | `useCheckOutReservation()` | Receptionist, Admin |
| `POST /reservations/:id/unreserve` | `useUnreserveReservation()` | Admin, Receptionist, or the owner |

**Booking rules the service enforces**, all mirrored in the UI:

- Only `GUEST` users may reserve guest / `SINGLE` rooms.
- Only `STUDENT` users may reserve student / `DOUBLE` / `TRIPLE` rooms.
- The room must be available and not in `MAINTENANCE`.
- `checkOutDate` must be after `checkInDate`.
- No overlap with an existing `RESERVED` or `CHECKED_IN` stay on that room.

**Status machine:**

```
RESERVED ──check-in──▶ CHECKED_IN ──check-out──▶ CHECKED_OUT
    │                       │
    └────── unreserve ──────┴──▶ CANCELLED
```

Check-in only from `RESERVED`; check-out only from `CHECKED_IN`; cancellation
only while still open. `ReservationLedger` renders exactly the buttons the
current status permits.

**Room side effects.** Reserving marks the room `RESERVED`; check-in marks it
`OCCUPIED`; check-out and cancellation return it to `AVAILABLE` *unless* another
active reservation exists on that room, in which case it inherits that one's
state. This is why all three mutations invalidate rooms as well as reservations.

**Populated vs. raw references.** List endpoints populate `room` and `user` into
full documents; write endpoints return bare ObjectId strings. The `Reservation`
type models both, and `utils/reservation.ts` provides
`getReservationRoom()` / `getReservationUser()` guards so one component handles
either shape.

**Dates.** Send ISO strings snapped to the noon cutoff:

```ts
await createReservation({
  roomId: room._id,
  checkInDate: toCutoffISOString(values.checkInDate),
  checkOutDate: toCutoffISOString(values.checkOutDate),
  notes: values.notes || undefined,
});
```

**`targetUserId`.** Staff may pass it to book on another user's behalf. The type
supports it; no screen uses it yet.

---

## Reports — `/reports`

| Endpoint | Hook | Role |
| --- | --- | --- |
| `GET /reports` | `useGetReport(query)` | Admin |

`period` is one of `day` \| `week` \| `month` \| `year` (default `month`).
Supplying **both** `startDate` and `endDate` overrides `period`, and the response
reports `period: "custom"`. The reports screen disables the period select while a
custom range is active, because a partially-filled range is silently ignored by
the API.

```jsonc
{
  "period": "month",
  "startDate": "2026-07-27T…",
  "endDate":   "2026-08-26T…",
  "checkoutCutoffPolicy": "12:00 PM (Noon)",
  "summary":   { "totalReservations": 42, "checkedInCount": 5,
                 "checkedOutCount": 30, "cancelledCount": 4, "totalRevenue": 890000 },
  "categoryBreakdown": { "guest":   { "reservationsCount": 18, "revenue": 620000 },
                         "student": { "reservationsCount": 20, "revenue": 270000 } },
  "roomOccupancy": { "totalRooms": 25, "occupiedRooms": 9, "reservedRooms": 7,
                     "availableRooms": 9, "occupancyRatePercentage": "64%" }
}
```

Two things worth knowing when reading the numbers:

- **Revenue excludes cancelled stays** but includes ones still merely `RESERVED`,
  so it is *booked* value, not collected cash.
- **`roomOccupancy` is a live snapshot**, not a figure for the selected period.
  It counts current room statuses regardless of the date range. The reports
  screen labels it accordingly.

`occupancyRatePercentage` arrives as a **string** (`"64%"`); parse before using
it numerically.

---

## Cache keys and invalidation

```ts
queryKeys.session                       // ["session"]
queryKeys.rooms.all                     // ["rooms"]
queryKeys.rooms.list(filters)           // ["rooms", "list", {…}]
queryKeys.rooms.detail(id)              // ["rooms", "detail", id]
queryKeys.reservations.all              // ["reservations"]
queryKeys.reservations.mine             // ["reservations", "mine"]
queryKeys.reservations.list(filters)    // ["reservations", "list", {…}]
queryKeys.reports.detail(query)         // ["reports", "detail", {…}]
```

Invalidating by prefix (`queryKeys.rooms.all`) clears every filtered variant.

| Mutation | Invalidates |
| --- | --- |
| Create / check-in / check-out / unreserve reservation | reservations, rooms, reports |
| Create / delete room | rooms, reports |
| Update room | rooms, that room's detail |
| Login / register | sets `session` directly |
| Logout | clears the entire cache |

---

## Adding an endpoint

```ts
// 1. utils/types/Room.type.ts
export type RoomStatsResponse = { stats: { … } };

// 2. services/queryKeys.ts
rooms: { …, stats: () => ["rooms", "stats"] as const }

// 3. services/queries/Room.ts
export const useGetRoomStats = () =>
  useQuery({
    queryKey: queryKeys.rooms.stats(),
    queryFn: () => requests<RoomStatsResponse>("rooms/stats"),
    select: (response) => response.data.stats,
  });
```
