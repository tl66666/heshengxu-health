# Cycle And Medication Product Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing demo-like period and medication surfaces with real, empty-state-first health workflows that persist user-entered data and match the existing Heshengxu watercolor design system.

**Architecture:** Add focused feature modules for cycle settings, period-day records, medication reminders, and medication check-ins. Pages consume these modules through small local-storage services; HomePage reads summary selectors only and never seeds health data. The first period route is a setup state, then transitions to a calendar-led tracking state.

**Tech Stack:** UniApp, Vue 3 `<script setup>`, TypeScript, Vitest, existing `AppNavBar`, existing watercolor assets and tokens.

---

### Task 1: Add domain models and local persistence services

**Files:**
- Create: `apps/mini/src/features/menstruation/menstruation.types.ts`
- Create: `apps/mini/src/features/menstruation/menstruation.service.ts`
- Create: `apps/mini/src/features/menstruation/menstruation.service.spec.ts`
- Create: `apps/mini/src/features/medication/medication.types.ts`
- Create: `apps/mini/src/features/medication/medication.service.ts`
- Create: `apps/mini/src/features/medication/medication.service.spec.ts`

- [ ] **Step 1: Define serializable domain types**

  Implement `CycleSettings`, `PeriodDayRecord`, `MedicationReminder`, and `MedicationCheckin` exactly as specified in `docs/superpowers/specs/2026-08-30-cycle-medication-product-redesign.md`. Use string unions for pain and medication frequency values.

- [ ] **Step 2: Write failing service tests**

  Mock `uni.getStorageSync` and `uni.setStorageSync`. Cover: missing cycle returns `null`; invalid cycle values are rejected; daily records round-trip by date; medication reminders round-trip; check-ins are scoped to `YYYY-MM-DD`; malformed JSON falls back to empty state.

- [ ] **Step 3: Implement storage services**

  Export `loadCycleSettings`, `saveCycleSettings`, `loadPeriodDay`, `savePeriodDay`, `listPeriodDays`, `loadMedicationReminders`, `saveMedicationReminder`, `deleteMedicationReminder`, `loadCheckinsForDate`, and `setMedicationCheckin`. Keep storage keys private constants and normalize old records without `checkedDate` instead of treating them as checked today.

- [ ] **Step 4: Run feature tests**

  Run `pnpm --filter @heban/mini test -- src/features/menstruation/menstruation.service.spec.ts src/features/medication/medication.service.spec.ts`.

- [ ] **Step 5: Commit**

  `git add apps/mini/src/features/menstruation apps/mini/src/features/medication && git commit -m "feat: add cycle and medication persistence services"`

### Task 2: Build the first-visit cycle setup flow

**Files:**
- Create: `apps/mini/src/pages/menstruation/MenstruationSetupPage.vue`
- Modify: `apps/mini/src/pages.json`
- Create: `apps/mini/src/pages/menstruation/menstruation-setup.spec.ts`

- [ ] **Step 1: Add setup presentation tests**

  Test pure helpers for cycle length range `20..45`, period length range `2..10`, required start date, and disabled submit state until all required fields are valid.

- [ ] **Step 2: Implement setup page**

  Use `AppNavBar`, empty inputs for cycle length, period length, and last-period start date, plus optional end date. Use `uni.showModal` or platform date picker for dates. On save, validate, persist `CycleSettings`, show success feedback, and redirect to `MenstruationDetailPage`. Never render forecast numbers before save.

- [ ] **Step 3: Register the route**

  Add `pages/menstruation/MenstruationSetupPage` with custom navigation styling. Keep `MenstruationDetailPage` registered for the post-setup state.

- [ ] **Step 4: Run setup tests and commit**

  Run `pnpm --filter @heban/mini test -- src/pages/menstruation/menstruation-setup.spec.ts`, then commit with `feat: add first visit cycle setup flow`.

### Task 3: Rebuild the cycle detail page around real settings

**Files:**
- Modify: `apps/mini/src/pages/menstruation/MenstruationDetailPage.vue`
- Create: `apps/mini/src/pages/menstruation/menstruation-calendar.ts`
- Create: `apps/mini/src/pages/menstruation/menstruation-calendar.spec.ts`

- [ ] **Step 1: Add calendar and forecast tests**

  Cover month-cell generation, period interval calculation, predicted interval calculation, current cycle day, and days-until-next-period for leap and month-boundary dates.

- [ ] **Step 2: Replace inline storage code with service calls**

  Load settings on `onShow`; redirect to setup when absent. Load the selected date's `PeriodDayRecord`; save only the selected date's record. Keep cycle settings and daily records separate.

- [ ] **Step 3: Implement the calendar-led UI**

  Keep the approved watercolor visual language: soft pink for recorded period, pale purple for predicted days, thin outline for today, open whitespace, shared typography and navigation. Provide month navigation, date selection, period mark/unmark, pain chips, symptom chips, note field, and cycle-settings adjustment.

- [ ] **Step 4: Verify no seeded health data**

  With empty storage, assert the setup route is rendered and no “8 days”, sample dates, or sample period ranges appear in the page source.

- [ ] **Step 5: Run calendar tests and commit**

  Run `pnpm --filter @heban/mini test -- src/pages/menstruation/menstruation-calendar.spec.ts`, then commit `feat: rebuild cycle tracking page`.

### Task 4: Rebuild medication management with real reminder records

**Files:**
- Modify: `apps/mini/src/pages/medication/MedicationManagePage.vue`
- Create: `apps/mini/src/pages/medication/medication-presentation.ts`
- Create: `apps/mini/src/pages/medication/medication-presentation.spec.ts`

- [ ] **Step 1: Add medication presentation tests**

  Test sorting by reminder time, today-only check-in mapping, empty-state copy, progress calculation with zero reminders, and frequency label mapping.

- [ ] **Step 2: Replace page-local storage with medication services**

  Load reminders and today's check-ins on `onShow`. Do not construct sample reminders. Persist a check-in with reminder id and date; loading a new day must show all active reminders as pending.

- [ ] **Step 3: Implement add / delete / check-in states**

  Keep the blue-mint watercolor surface. Add fields for name, dose note, frequency, reminder time, and optional note. Require a name. Add confirmation before deletion. Hide percentage progress when the reminder list is empty.

- [ ] **Step 4: Run medication tests and commit**

  Run `pnpm --filter @heban/mini test -- src/pages/medication/medication-presentation.spec.ts`, then commit `feat: rebuild medication reminders`.

### Task 5: Make HomePage a real summary consumer

**Files:**
- Modify: `apps/mini/src/pages/home/HomePage.vue`
- Create: `apps/mini/src/pages/home/home-personal-signals.ts`
- Create: `apps/mini/src/pages/home/home-personal-signals.spec.ts`

- [ ] **Step 1: Add summary selector tests**

  Test no-data copy, cycle summary text from saved settings, next-period calculation, medication completed / total counts, and malformed storage fallback.

- [ ] **Step 2: Implement summary selectors**

  Read through feature services or a small adapter. Return explicit empty states for missing configuration. Keep navigation handlers pointed to setup/detail and medication routes.

- [ ] **Step 3: Update HomePage cards**

  Replace hardcoded “暂无记录” and “暂无用药计划” strings with selector output. Keep the existing card layout and watercolor assets; do not introduce sample values or extra dashboard cards.

- [ ] **Step 4: Run summary tests and commit**

  Run `pnpm --filter @heban/mini test -- src/pages/home/home-personal-signals.spec.ts`, then commit `feat: connect home personal health summaries`.

### Task 6: Full validation and visual review

**Files:**
- Modify: `docs/engineering/mini-frontend-implementation.md` only if route or storage documentation needs updating.

- [ ] **Step 1: Run focused tests and SFC compilation**

  Run the new feature tests and a Vue compiler script against the three affected pages. Record existing unrelated failures separately.

- [ ] **Step 2: Run full mini-app tests**

  Run `pnpm --filter @heban/mini test`. Confirm new tests pass and identify any pre-existing contract failures without masking them.

- [ ] **Step 3: Start preview**

  Start the existing mini-app preview command. Open the setup route, complete a cycle setup, return to the cycle page, add a symptom, add a medication reminder, check it off, and return home to verify summaries.

- [ ] **Step 4: Inspect responsive states**

  Check desktop-width browser preview and a narrow mobile viewport for clipped calendar cells, overflowing chips, button text wrapping, and bottom safe-area overlap.

- [ ] **Step 5: Commit documentation or fixes**

  Commit any validation-driven fixes separately with a focused message.

