# Food Catalog Resilience Design

## Goal

Keep the full food catalog available across local computer restarts, remove duplicate offline categories, and make the food picker feel like one stable mobile workspace instead of several competing scroll areas.

## Runtime Boundary

- Local development uses Docker Desktop, PostgreSQL, Redis, and the local NestJS API.
- `postgres_data` remains the persistent source for local food data. Restarting the computer or containers must not recreate the database.
- Production keeps food metadata and user records in Azure Database for PostgreSQL behind the NestJS API.
- CloudBase is used for WeChat integration, private food-photo storage, and approved AI calls. It is not a second food catalog database.

## Startup Behavior

`start-dev.bat` delegates infrastructure setup to a PowerShell script. The script starts Docker Desktop when necessary, runs `docker compose up -d --wait`, applies Prisma migrations, checks the active food count, and imports `food.sql` only when the catalog is absent or incomplete. It then builds and starts the API before starting the mini-program watcher with npm.

The Docker services use named volumes and `restart: unless-stopped`. No startup path uses hard-coded container names or pnpm.

## Offline Behavior

The bundled common-food list remains available for limited offline recording, but API failure must be visible. Search results carry a `source` value of `remote` or `offline`. Offline categories are normalized by canonical slug, so legacy IDs such as `grain`, `egg`, `meat`, and `protein` cannot create duplicate navigation entries.

## Food Picker Layout

The page is a viewport-height column: navigation and compact controls at the top, a flexible catalog workspace in the middle, and the selected-meal bar at the bottom. The workspace contains a narrow category rail and one independently scrolling result list. Results load the next page when the user reaches the bottom; changing search or category resets the list. The offline notice sits above results and explains why only common foods are available.

## Verification

- Unit tests cover offline source labelling and category normalization.
- Presentation tests cover the stable catalog workspace, offline notice, and incremental loading.
- Startup contract tests cover persistent Docker services, npm-only startup, health waiting, and conditional food import.
- A real Docker restart verifies that the active food count remains above 49,000 without re-importing.
- The mini-program test suite and WeChat build must pass.
