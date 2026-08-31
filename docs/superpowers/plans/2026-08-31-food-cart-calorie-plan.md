# Food Cart And Calorie Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make food selection feel like Mint Health: add foods with plus controls, review the meal cart, save entries, and show today's consumed and remaining calories with a refined cream-green visual system.

**Architecture:** Keep food selection state local to `MealAddPage.vue` and persist nutrition through the existing `createMealEntry` service. Add a small pure calorie-goal helper in `features/food` so the UI can calculate consumed/remaining values without coupling to pages or the API. Restyle only food-search and meal-add surfaces; do not change home or plan modules.

**Tech Stack:** Vue 3 `<script setup>`, uni-app components, TypeScript, Vitest, existing `food.service.ts` and `food.summary.ts`.

---

### Task 1: Add pure daily calorie calculations

**Files:**
- Create: `apps/mini/src/features/food/calorie-budget.ts`
- Test: `apps/mini/src/features/food/calorie-budget.spec.ts`

- [ ] **Step 1: Write the failing test** for consumed, remaining, and over-budget values using a 1800 kcal target.
- [ ] **Step 2: Run** `pnpm --filter @heban/mini exec vitest run src/features/food/calorie-budget.spec.ts` and confirm failure.
- [ ] **Step 3: Implement** typed functions `sumCalories(entries)`, `remainingCalories(target, consumed)`, and `calorieBudget(target, consumed)` that clamp remaining at zero while exposing `overBy`.
- [ ] **Step 4: Run the focused test** and confirm PASS.

### Task 2: Upgrade meal-add cart and calorie review

**Files:**
- Modify: `apps/mini/src/pages/meal-add/MealAddPage.vue`

- [ ] **Step 1: Add local cart item shape** with `grams` and derived kcal, preserving the existing food catalog fallback.
- [ ] **Step 2: Add plus/minus quantity controls** and a bottom cart drawer that lists selected foods, servings, and total kcal.
- [ ] **Step 3: Load today's `MealEntry[]` on page show** and calculate consumed calories with the new pure helper; use an explicit 1800 kcal estimate label when no profile target exists.
- [ ] **Step 4: Update `done()`** to create entries with each item's grams and nutrition, then show consumed, target, and remaining in the success state before navigating back.
- [ ] **Step 5: Replace placeholder quick actions** with working search navigation and clear, non-misleading disabled states for unsupported copy/scan actions.
- [ ] **Step 6: Restyle page using cream/green tokens, remove legacy pink/red/gray colors, and ensure bottom controls respect safe-area insets.

### Task 3: Refine food search cards and pagination

**Files:**
- Modify: `apps/mini/src/pages/food-search/FoodSearchPage.vue`
- Test: `apps/mini/src/pages/food-search/food-search-presentation.spec.ts`

- [ ] **Step 1: Write/update presentation assertions** for a visible add affordance and icon-based pagination labels.
- [ ] **Step 2: Add a lightweight selected-count bridge** using the existing `pendingFoodSelection` storage/event contract without changing the home route.
- [ ] **Step 3: Replace thick rectangular pagination buttons** with compact previous/next arrow controls, current-page indicator, and disabled states.
- [ ] **Step 4: Normalize colors and spacing** to the current cream-green system and remove stale pink accent declarations.
- [ ] **Step 5: Run the focused presentation test** and confirm PASS.

### Task 4: Verify the food workflow and hand off

**Files:**
- Modify: `docs/PLAN-FEATURES.md` (append food-page boundary note)

- [ ] **Step 1: Run** `pnpm --filter @heban/mini exec vitest run src/features/food src/pages/food-search`.
- [ ] **Step 2: Run** `node scripts/verify-mini-build.mjs apps/mini/dist/dev/mp-weixin` after the active watcher/build refreshes assets.
- [ ] **Step 3: Use browser screenshots to verify mobile layout, add/remove state, cart drawer, completion summary, and pagination without overlap.
- [ ] **Step 4: Run** `git diff --check`, commit only food files and docs, and push to `origin main`.
