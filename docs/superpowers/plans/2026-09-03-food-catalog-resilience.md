# Food Catalog Resilience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the full local food catalog across restarts, expose offline fallback honestly, normalize categories, and improve food-picker scrolling.

**Architecture:** A PowerShell startup coordinator owns Docker, migrations, conditional import, and API startup. The mini client labels remote versus offline results and canonicalizes bundled categories before rendering them in a fixed catalog workspace with incremental loading.

**Tech Stack:** PowerShell, Docker Compose, PostgreSQL, NestJS, Prisma, Vue 3, uni-app, Vitest, npm.

---

### Task 1: Lock the startup contract

**Files:**
- Create: `scripts/local-dev-startup.spec.ts`
- Create: `scripts/start-local-dev.ps1`
- Modify: `start-dev.bat`
- Modify: `infra/docker/docker-compose.yml`

- [ ] Write a failing source-contract test asserting `restart: unless-stopped`, Compose health waiting, an active-food count threshold, conditional `food:import`, API health waiting, and npm-only commands.
- [ ] Run `npx -y vitest@2.1.9 run scripts/local-dev-startup.spec.ts` and confirm the missing coordinator behavior fails.
- [ ] Implement the coordinator and make the batch entrypoint delegate to it.
- [ ] Re-run the startup contract test and confirm it passes.

### Task 2: Normalize offline catalog state

**Files:**
- Modify: `apps/mini/src/features/food/food.service.spec.ts`
- Modify: `apps/mini/src/features/food/food.service.ts`

- [ ] Add failing tests requiring `source: offline`, unique canonical category slugs, and removal of legacy category slugs.
- [ ] Run the focused service test and confirm the assertions fail against the current silent fallback.
- [ ] Normalize bundled items to canonical slug IDs and attach source metadata to search results and category statistics.
- [ ] Re-run the focused service test and confirm it passes.

### Task 3: Stabilize picker scrolling and status

**Files:**
- Modify: `apps/mini/src/pages/food-search/food-search-presentation.spec.ts`
- Modify: `apps/mini/src/pages/food-search/FoodSearchPage.vue`

- [ ] Add failing presentation assertions for a `catalog-shell`, a vertically scrolling `food-results`, `@scrolltolower`, and a visible offline notice.
- [ ] Run the focused presentation test and confirm it fails.
- [ ] Replace the float/sticky catalog layout and numbered pagination with a bounded two-column workspace and append-on-scroll behavior.
- [ ] Re-run the focused presentation test and food service tests.

### Task 4: Verify persistence and build

**Files:**
- Modify: `docs/engineering/local-development.md`
- Modify: `docs/engineering/food-icon-system.md`

- [ ] Update local-development documentation to describe the one-click npm startup and explain that the 82-item list is an explicit offline fallback.
- [ ] Start Compose, record the active food count, restart services without deleting volumes, and confirm the count is unchanged.
- [ ] Run focused Vitest tests and `npm --prefix apps/mini run build:mp-weixin`.
- [ ] Run `git diff --check`, commit only this task's files, and push the result.
