# AGENTS.md

## Project Overview

Mini Cal — a simplified booking calendar app (like cal.com). Two roles: calendar owner (admin) and guest. No auth.

## Setup & Run

### Docker (full stack)
```bash
docker compose up --build
```
Frontend: http://localhost:5173, Prism API: http://localhost:8080

### Local development (without Docker)
Must run these in order:
1. Generate OpenAPI spec from TypeSpec:
   ```bash
   cd spec && npm install && npm run build && cd ..
   ```
2. Generate TypeScript API types:
   ```bash
   cd frontend && npm install && npm run generate:api
   ```
3. Start Prism mock server (separate terminal):
   ```bash
   npx @stoplight/prism-cli mock ../spec/tsp-output/openapi.yaml -p 8080
   ```
4. Start frontend dev server:
   ```bash
   npm run dev
   ```

## Code Generation Pipeline

TypeSpec (`spec/main.tsp`) → OpenAPI (`spec/tsp-output/openapi.yaml`) → TypeScript types (`frontend/src/api/generated.ts`)

**After changing TypeSpec models/endpoints**, you must regenerate both:
```bash
cd spec && npm run build && cd ../frontend && npm run generate:api
```

The generated file `frontend/src/api/generated.ts` is committed to the repo — do not edit it by hand.

## Key Commands (run from `frontend/`)

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | `tsc -b && vite build` — typecheck + production build |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier (single quotes, 100 print width, trailing commas es5) |
| `npm run generate:api` | Regenerate TS types from OpenAPI spec |
| `npm run preview` | Preview production build |

## Architecture

- **`spec/`** — TypeSpec API contract (single file `main.tsp`). Admin routes prefixed `/api/admin/`, public routes prefixed `/api/`.
- **`mock/`** — Prism mock server Docker image. Uses `--dynamic` flag for realistic mock responses.
- **`frontend/`** — React 19 + Vite + Mantine 9 + TanStack Query + Zod 4 + dayjs. React Router with `createBrowserRouter`.

### Frontend structure
- `src/api/` — API client (`client.ts`), TanStack Query hooks (`hooks.ts`), query key factories (`queryKeys.ts`), generated types (`generated.ts`)
- `src/pages/public/` — Guest-facing pages (event types list, slot booking, booking confirmation)
- `src/pages/admin/` — Admin pages (bookings list, event type management)
- `src/lib/` — Utilities and config (env vars)
- `src/theme.ts` — Mantine theme

### API proxy
Vite dev server proxies `/api` → `VITE_API_PROXY_TARGET` (defaults to `http://localhost:8080`), so frontend calls `/api/...` and it reaches Prism.

## Environment Variables

`frontend/.env` (from `.env.example`):
- `VITE_API_BASE_URL` — base path for API calls (default `/api`)
- `VITE_API_PROXY_TARGET` — Vite proxy target (local dev only, default `http://localhost:8080`)
- `VITE_HOST_NAME`, `VITE_HOST_ROLE`, `VITE_HOST_TIMEZONE` — host identity config
- `VITE_WORK_START_HOUR`, `VITE_WORK_END_HOUR` — work hours for slot grid (integers)

## Conventions

- Prettier: single quotes, 100 char width, 2-space indent, semicolons, trailing commas es5
- ESLint: flat config with react-hooks + react-refresh plugins
- TypeScript: strict — `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `verbatimModuleSyntax`
- No tests configured yet

## Lint → Typecheck → Build

```bash
cd frontend && npm run lint && npm run build
```

`npm run build` runs `tsc -b` first, so type errors will fail the build.