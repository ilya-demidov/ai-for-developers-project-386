# AGENTS.md

## Project Overview

Mini Cal — a simplified booking calendar app (like cal.com). Two roles: calendar owner (admin) and guest. No auth.

## Setup & Run

### Docker (full stack)
```bash
docker compose up --build
```
Frontend: http://localhost:5173, API: http://localhost:8081

### With Prism mock (instead of real backend)
```bash
VITE_API_PROXY_TARGET=http://mock:8080 docker compose --profile mock up --build
```
Frontend: http://localhost:5173, Mock: http://localhost:8080

### Local development (without Docker)
1. Start backend:
   ```bash
   cd backend && dotnet run
   ```
2. Start frontend dev server:
   ```bash
   cd frontend && npm install && npm run dev
   ```
3. (Optional) use Prism mock instead of backend:
   ```bash
   cd spec && npm run build
   # terminal 1:
   cd spec && npx @stoplight/prism-cli mock ./tsp-output/openapi.yaml -p 8080
   # terminal 2:
   cd frontend && VITE_API_PROXY_TARGET=http://localhost:8080 npm run dev
   ```

## Code Generation Pipeline

TypeSpec (`spec/main.tsp`) → OpenAPI (`spec/tsp-output/openapi.yaml`) → TypeScript types (`frontend/src/api/generated.ts`)

**After changing TypeSpec models/endpoints**, you must regenerate both:
```bash
cd spec && npm run build && cd ../frontend && npm run generate:api
```

The generated file `frontend/src/api/generated.ts` is committed to the repo — do not edit it by hand.

## Key Commands

### Frontend (run from `frontend/`)
| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | `tsc -b && vite build` — typecheck + production build |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier (single quotes, 100 print width, trailing commas es5) |
| `npm run generate:api` | Regenerate TS types from OpenAPI spec |
| `npm run preview` | Preview production build |
| `npm run e2e:real` | Run Playwright scenarios against real backend |
| `npm run e2e:mock` | Run Playwright smoke scenarios against Prism mock |

### Backend (run from `backend/`)
| Command | Purpose |
|---|---|
| `dotnet run` | Start API server (port 8080) |
| `dotnet build` | Build |
| `dotnet format` | Format code |

## Architecture

- **`spec/`** — TypeSpec API contract (single file `main.tsp`). Admin routes prefixed `/api/admin/`, public routes prefixed `/api/`.
- **`mock/`** — Prism mock server Docker image. Returns examples from OpenAPI spec (defined via `@opExample` in TypeSpec).
- **`backend/`** — .NET 8 Minimal API. In-memory storage (ConcurrentDictionary). All dates in UTC. Host timezone configurable (default Europe/Moscow). Work hours interpreted in host timezone.
- **`frontend/`** — React 19 + Vite + Mantine 9 + TanStack Query + Zod 4 + dayjs. React Router with `createBrowserRouter`.

### Backend structure
- `Program.cs` — All route definitions (Minimal API)
- `Models/` — Domain models (EventType, Booking), DTOs, Options
- `Storage/` — In-memory stores (ConcurrentDictionary-based, Singleton)
- `Services/` — SlotService (slot generation + timezone conversion), BookingService (overlap check)

### Frontend structure
- `src/api/` — API client (`client.ts`), TanStack Query hooks (`hooks.ts`), query key factories (`queryKeys.ts`), generated types (`generated.ts`)
- `src/pages/public/` — Guest-facing pages (event types list, slot booking, booking confirmation)
- `src/pages/admin/` — Admin pages (bookings list, event type management)
- `src/lib/` — Utilities and config (env vars, time.ts with UTC + timezone handling)
- `src/theme.ts` — Mantine theme

### API proxy
Vite dev server proxies `/api` → `VITE_API_PROXY_TARGET` (defaults to `http://localhost:8080`), so frontend calls `/api/...` and it reaches the backend.

## Time Handling

All dates are stored and transmitted in UTC. Host timezone (Europe/Moscow by default) is used for:
- Converting work hours to UTC (9-18 Moscow = 06:00-15:00 UTC)
- Displaying times in the host's local timezone on the frontend
- Day grid generation aligned to host's local calendar days

## Environment Variables

`frontend/.env` (from `.env.example`):
- `VITE_API_BASE_URL` — base path for API calls (default `/api`)
- `VITE_HOST_NAME`, `VITE_HOST_ROLE`, `VITE_HOST_TIMEZONE` — host identity config
- `VITE_DISPLAY_TIMEZONE` — display/calendar timezone (`local` | `host` | IANA timezone | `+3` / `+03:00` / `UTC+3`)
- `VITE_WORK_START_HOUR`, `VITE_WORK_END_HOUR` — work hours for slot grid (integers)
- `VITE_BOOKING_WINDOW_DAYS` — booking window in days for frontend date/range filtering (should match backend)

`VITE_API_PROXY_TARGET` is not in `.env.example`; set it in shell (or Docker env) to override Vite proxy target in local development.

`backend/appsettings.json`:
- `WorkHours:StartHour`, `WorkHours:EndHour` — work hours in host timezone (default 9, 18)
- `Host:Name`, `Host:TimeZone` — host identity (default Tota, Europe/Moscow)
- `BookingWindowOptions:Days` — booking window in days (default 14)

## Conventions

- Prettier: single quotes, 100 char width, 2-space indent, semicolons, trailing commas es5
- ESLint: flat config with react-hooks + react-refresh plugins
- TypeScript: strict — `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `verbatimModuleSyntax`
- .NET: Minimal APIs, no controllers, record types for models
- Playwright e2e tests are configured in `frontend/e2e` (`real` and `mock` projects)

## Lint → Typecheck → Build

### Frontend
```bash
cd frontend && npm run lint && npm run build
```

### Backend
```bash
cd backend && dotnet build
```
