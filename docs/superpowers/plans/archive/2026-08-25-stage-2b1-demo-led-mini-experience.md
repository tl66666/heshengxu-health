# Stage 2B-1 Demo-Led Mini Experience Implementation Plan

> **状态：已完成。** 对应实现提交为 `d939160`；后续视觉整理提交为 `50ae9bb`。文中复选框保留为历史实施步骤，不是当前待办。当前图片源统一在 `assets/illustrations/`，小程序构建前由 `scripts/sync-illustrations.mjs` 同步。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the formal WeChat mini-program experience around the existing real daily-health-loop API, restoring Demo-grade illustration, sequence, and Xuxu companionship without fabricating health data.

**Architecture:** Add a pure mini-client view-model layer that maps the existing `DailyHomeDto` and `PersonalPlanDto` into presentation states. Pages render only those states and call the existing `healthLoopState` actions; no page creates health rules or hard-codes API URLs. Shared visual primitives establish a consistent illustration-first but data-honest interface.

**Tech Stack:** uni-app, Vue 3 Composition API, TypeScript, Vitest, existing NestJS API contracts, Sass, WeChat mini-program build.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `apps/mini/src/features/health-loop/daily-experience.ts` | Pure mapping from `DailyHomeDto` to home/record presentation state. |
| `apps/mini/src/features/health-loop/daily-experience.spec.ts` | Regression coverage for action ordering, empty states, and Xuxu copy. |
| `apps/mini/src/components/XuxuHint.vue` | Reusable embedded Xuxu companion module with neutral/supportive variants. |
| `apps/mini/src/components/IllustratedHero.vue` | Shared illustration hero with readable foreground copy and a single command. |
| `apps/mini/src/styles/tokens.scss` | Product-level color, spacing, radius, type, and elevation tokens. |
| `assets/illustrations/` | 唯一图片源；开发/构建脚本同步到小程序静态目录。 |
| `apps/mini/src/pages/bootstrap/BootstrapPage.vue` | Warm, illustration-led launch state while routing to onboarding or home. |
| `apps/mini/src/pages/onboarding/OnboardingPage.vue` | Welcome-led, locked onboarding using the existing saved profile fields and live BMI. |
| `apps/mini/src/pages/home/HomePage.vue` | Today companion dashboard driven by real daily state. |
| `apps/mini/src/pages/records/RecordsPage.vue` | Scene-first record chooser and focused form state. |
| `apps/mini/src/pages/plan/PlanPage.vue` | Illustration-led plan context and task completion state. |
| `apps/mini/src/pages/plan-setup/PlanSetupPage.vue` | Consistent selected-plan setup flow. |
| `apps/mini/src/pages/xuxu/XuxuPage.vue` | Xuxu’s scoped assistance page; no free-text AI input. |
| `apps/mini/src/pages/me/MePage.vue` | Factual account, plan, and data-management entry points. |
| `apps/mini/src/custom-tab-bar/index.vue` | Stable five-tab navigation with central Xuxu entry. |
| `apps/mini/src/App.vue` | Global page and button reset using product tokens. |

### Task 1: Add Tested Daily Experience View Models

**Files:**
- Create: `apps/mini/src/features/health-loop/daily-experience.ts`
- Create: `apps/mini/src/features/health-loop/daily-experience.spec.ts`

- [ ] **Step 1: Write the failing view-model tests**

```ts
import { describe, expect, it } from 'vitest';
import { deriveDailyExperience } from './daily-experience.js';

const base = {
  date: '2026-08-25', displayName: '小乐', activePlan: null,
  todayRecords: { weight: null, meals: [], activities: [], sleep: null, timeZone: 'Asia/Shanghai' },
  todayTasks: [],
  dailyAction: { type: 'setup_plan', title: '设置你的第一份计划', description: '选一个方向开始。', route: '/pages/plan-setup/PlanSetupPage' },
  recordingProgress: { completed: 0, total: 4, hasWeight: false, hasMeal: false, hasActivity: false, hasSleep: false },
} as const;

describe('deriveDailyExperience', () => {
  it('keeps the API daily action as the only home primary action', () => {
    const result = deriveDailyExperience(base);
    expect(result.hero).toMatchObject({ title: '设置你的第一份计划', route: base.dailyAction.route });
    expect(result.hero.eyebrow).toBe('今日陪伴');
  });

  it('puts incomplete plan tasks before completed tasks and limits them to three', () => {
    const result = deriveDailyExperience({ ...base, todayTasks: [
      { id: 'done', actionType: 'record_weight', status: 'completed', scheduledFor: base.date, completedAt: '2026-08-25T01:00:00.000Z' },
      { id: 'sleep', actionType: 'record_sleep', status: 'pending', scheduledFor: base.date, completedAt: null },
      { id: 'meal', actionType: 'record_meal', status: 'pending', scheduledFor: base.date, completedAt: null },
      { id: 'walk', actionType: 'walk_15_minutes', status: 'pending', scheduledFor: base.date, completedAt: null },
    ] });
    expect(result.tasks.map((task) => task.id)).toEqual(['sleep', 'meal', 'walk']);
  });

  it('uses a record reminder only when a record is actually missing', () => {
    expect(deriveDailyExperience(base).recording.message).toContain('从一件最容易的小事开始');
    expect(deriveDailyExperience({ ...base, recordingProgress: { ...base.recordingProgress, completed: 4, hasWeight: true, hasMeal: true, hasActivity: true, hasSleep: true } }).recording.message).toContain('今天的记录已经齐了');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @heban/mini test -- daily-experience.spec.ts`

Expected: FAIL because `daily-experience.ts` does not exist.

- [ ] **Step 3: Implement the pure mapper**

```ts
import type { DailyHomeDto, PlanTaskDto } from '../../../../../packages/contracts/src/health-loop.js';

const taskLabels: Record<PlanTaskDto['actionType'], { title: string; subtitle: string }> = {
  record_weight: { title: '记录今天体重', subtitle: '一次记录就够了' },
  record_meal: { title: '记录一餐的结构', subtitle: '看看主食、蛋白质和蔬菜' },
  walk_15_minutes: { title: '步行 15 分钟', subtitle: '给身体一点活动空间' },
  record_sleep: { title: '补记昨晚睡眠', subtitle: '帮助理解今天的精力' },
};

export function deriveDailyExperience(today: DailyHomeDto) {
  const tasks = [...today.todayTasks]
    .sort((left, right) => Number(left.status !== 'pending') - Number(right.status !== 'pending'))
    .filter((task) => task.status === 'pending')
    .slice(0, 3)
    .map((task) => ({ id: task.id, ...taskLabels[task.actionType], route: routeFor(task.actionType) }));
  const complete = today.recordingProgress.completed === today.recordingProgress.total;
  return {
    hero: { eyebrow: '今日陪伴', title: today.dailyAction.title, description: today.dailyAction.description, route: today.dailyAction.route },
    tasks,
    recording: {
      completed: today.recordingProgress.completed,
      total: today.recordingProgress.total,
      message: complete ? '今天的记录已经齐了，慢慢保持这个节律。' : '从一件最容易的小事开始，序序会陪你慢慢补齐。',
      image: complete ? 'complete' : 'reminder',
    },
  };
}

function routeFor(action: PlanTaskDto['actionType']) {
  return action === 'record_sleep' ? '/pages/records/RecordsPage?type=sleep' :
    action === 'record_weight' ? '/pages/records/RecordsPage?type=weight' :
    action === 'record_meal' ? '/pages/records/RecordsPage?type=meal-structure' :
    '/pages/records/RecordsPage?type=activity';
}
```

- [ ] **Step 4: Run the focused test and mini typecheck**

Run:

```powershell
pnpm --filter @heban/mini test -- daily-experience.spec.ts
pnpm --filter @heban/mini typecheck
```

Expected: both commands PASS.

- [ ] **Step 5: Commit the view-model boundary**

```powershell
git add apps/mini/src/features/health-loop/daily-experience.ts apps/mini/src/features/health-loop/daily-experience.spec.ts
git commit -m "feat: add daily experience view model"
```

### Task 2: Establish Shared Visual Primitives and Tokens

**Files:**
- Modify: `apps/mini/src/styles/tokens.scss`
- Modify: `apps/mini/src/App.vue`
- Modify: `apps/mini/src/components/XuxuHint.vue`
- Create: `apps/mini/src/components/IllustratedHero.vue`

- [ ] **Step 1: Add token and component rendering tests**

Create `apps/mini/src/components/IllustratedHero.spec.ts` with the following source-level contract test, consistent with the existing mini test setup:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const hero = readFileSync(new URL('./IllustratedHero.vue', import.meta.url), 'utf8');
const hint = readFileSync(new URL('./XuxuHint.vue', import.meta.url), 'utf8');

describe('shared companion primitives', () => {
  it('keeps a text layer and one command above every hero image', () => {
    expect(hero).toContain('class="copy"');
    expect(hero).toContain('@tap="$emit(\'action\')"');
  });
  it('keeps Xuxu copy scoped to an embedded companion module', () => {
    expect(hint).toContain("variant?: 'sunny' | 'note' | 'complete'");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @heban/mini test -- IllustratedHero.spec.ts`

Expected: FAIL because `IllustratedHero.vue` does not exist.

- [ ] **Step 3: Implement tokens and the two focused primitives**

Replace `tokens.scss` with semantic tokens used by all altered pages:

```scss
$color-canvas: #f7fbf8;
$color-surface: #ffffff;
$color-ink: #183425;
$color-muted: #668071;
$color-brand: #2e7d4f;
$color-brand-soft: #e8f4e8;
$color-sun-soft: #fffbed;
$color-sun-line: #eee0b5;
$color-line: #dceadd;
$space-page: 32rpx;
$radius-card: 16rpx;
$radius-hero: 20rpx;
```

Create `IllustratedHero.vue` with props `image`, `eyebrow`, `title`, `description`, `actionLabel`, emits `action`, an `image` set to `mode="aspectFill"`, a left-side `.copy` layer, and an explicit primary `button`. Update `XuxuHint.vue` to accept `variant?: 'sunny' | 'note' | 'complete'`, map it to modifier classes, and retain its existing `tap` event. Update `App.vue` to import tokens and set `page` to `$color-canvas`; globally remove only the native button border.

- [ ] **Step 4: Run component tests, typecheck, and format**

Run:

```powershell
pnpm --filter @heban/mini test -- IllustratedHero.spec.ts
pnpm --filter @heban/mini typecheck
pnpm exec prettier --check apps/mini/src/components apps/mini/src/styles/tokens.scss apps/mini/src/App.vue
```

Expected: all commands PASS.

- [ ] **Step 5: Commit the shared visual layer**

```powershell
git add apps/mini/src/styles/tokens.scss apps/mini/src/App.vue apps/mini/src/components
git commit -m "feat: add companion visual primitives"
```

### Task 3: Rebuild Entry and Onboarding as a Guided Welcome

**Files:**
- Modify: `apps/mini/src/pages/bootstrap/BootstrapPage.vue`
- Modify: `apps/mini/src/pages/onboarding/OnboardingPage.vue`
- Create: `apps/mini/src/static/illustrations/hero.jpg`

- [ ] **Step 1: Add onboarding visual-state tests**

Create `apps/mini/src/pages/onboarding/onboarding-flow.spec.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('../OnboardingPage.vue', import.meta.url), 'utf8');
describe('onboarding experience', () => {
  it('keeps the profile flow behind the welcome step and live BMI step', () => {
    expect(source).toContain('欢迎来到和生序');
    expect(source).toContain('form.heightCm');
    expect(source).toContain('BMI · {{ bmiLabel }}');
  });
  it('does not unlock tab navigation before a profile save succeeds', () => {
    expect(source).toContain("uni.switchTab({ url: '/pages/home/HomePage' })");
    expect(source).toContain('await client.update');
  });
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run: `pnpm --filter @heban/mini test -- onboarding-flow.spec.ts`

Expected: FAIL because the welcome copy is absent.

- [ ] **Step 3: Implement the entry experience without adding profile fields**

Copy `prototypes/web-demo/assets/hero.jpg` to `apps/mini/src/static/illustrations/hero.jpg`. In `BootstrapPage.vue`, use that image and the existing avatar in a full-page launch state while retaining the current API profile check and redirect logic. In `OnboardingPage.vue`, insert a welcome step before current form step 0, display the `hero.jpg` image, Xuxu identity, a primary “开始了解我” command, a non-medical disclaimer, and keep `onboardingState.completed` false until the existing profile update resolves. Shift existing steps by one, retain current `displayName`, `sex`, `heightCm`, `weightKg`, and `primaryGoal` persistence, and retain the live BMI classification wording.

- [ ] **Step 4: Run focused checks and build**

Run:

```powershell
pnpm --filter @heban/mini test -- onboarding-flow.spec.ts
pnpm --filter @heban/mini typecheck
pnpm --filter @heban/mini build:mp-weixin:check
```

Expected: all commands PASS and the output contains `pages/onboarding/OnboardingPage.js`.

- [ ] **Step 5: Commit the guided onboarding**

```powershell
git add apps/mini/src/pages/bootstrap apps/mini/src/pages/onboarding apps/mini/src/static/illustrations/hero.jpg
git commit -m "feat: redesign guided onboarding"
```

### Task 4: Turn Home and Plan Into an Illustrated Daily Action Loop

**Files:**
- Modify: `apps/mini/src/pages/home/HomePage.vue`
- Modify: `apps/mini/src/pages/plan/PlanPage.vue`
- Modify: `apps/mini/src/pages/plan-setup/PlanSetupPage.vue`
- Modify: `apps/mini/src/custom-tab-bar/index.vue`

- [ ] **Step 1: Write home/plan state tests**

Create `apps/mini/src/pages/home/home-experience.spec.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const home = readFileSync(new URL('../HomePage.vue', import.meta.url), 'utf8');
const plan = readFileSync(new URL('../../plan/PlanPage.vue', import.meta.url), 'utf8');
describe('daily action loop pages', () => {
  it('renders its hero from the tested daily experience mapper', () => {
    expect(home).toContain("deriveDailyExperience(today)");
    expect(home).toContain('IllustratedHero');
  });
  it('uses completion art only after a real completed task exists', () => {
    expect(plan).toContain("completedCount === plan.tasks.length");
    expect(plan).toContain('xuxu-complete.png');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @heban/mini test -- home-experience.spec.ts`

Expected: FAIL because home does not use `deriveDailyExperience`.

- [ ] **Step 3: Rebuild the three page states and navigation**

In `HomePage.vue`, use `deriveDailyExperience(today.value)` to render one `IllustratedHero` with `home-companion-banner.png`, one `XuxuHint` below it, and zero-to-three task rows. Use the existing route helper for action navigation. Replace the four equal record boxes with one compact “今天的记录” entry plus a state-specific Xuxu reminder image only when recording is incomplete. Preserve the current plan setup fallback.

In `PlanPage.vue`, keep its existing real `plan.tasks` and `completeTask` call. Display plan artwork based on `plan.kind`; only display `xuxu-complete.png` when `completedCount === plan.tasks.length && plan.tasks.length > 0`; show an ordinary task list otherwise. In `PlanSetupPage.vue`, preserve its existing API request shape and make choice cards share the same selected border, title overlay, and accessible action wording as the plan hero.

In `custom-tab-bar/index.vue`, preserve the five existing route paths, make the central Xuxu image fixed at `82rpx`, and ensure the bar reserves bottom safe-area padding and does not use a floating overlay outside its own grid.

- [ ] **Step 4: Run page tests, typecheck, and WeChat build check**

Run:

```powershell
pnpm --filter @heban/mini test -- home-experience.spec.ts daily-experience.spec.ts
pnpm --filter @heban/mini typecheck
pnpm --filter @heban/mini build:mp-weixin:check
```

Expected: all commands PASS.

- [ ] **Step 5: Commit home/plan redesign**

```powershell
git add apps/mini/src/pages/home apps/mini/src/pages/plan apps/mini/src/pages/plan-setup apps/mini/src/custom-tab-bar
git commit -m "feat: redesign daily action loop screens"
```

### Task 5: Make Records, Xuxu, and Profile Feel Purposeful

**Files:**
- Modify: `apps/mini/src/pages/records/RecordsPage.vue`
- Modify: `apps/mini/src/pages/xuxu/XuxuPage.vue`
- Modify: `apps/mini/src/pages/me/MePage.vue`

- [ ] **Step 1: Write screen contract tests**

Create `apps/mini/src/pages/records/records-experience.spec.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const records = readFileSync(new URL('../RecordsPage.vue', import.meta.url), 'utf8');
const xuxu = readFileSync(new URL('../../xuxu/XuxuPage.vue', import.meta.url), 'utf8');
describe('supporting screens', () => {
  it('keeps record forms scoped to one selected scene', () => {
    expect(records).toContain('activeType');
    expect(records).toContain('record-desk-banner.png');
    expect(records).toContain('xuxu-record-reminder.png');
  });
  it('does not claim free-text AI chat is available', () => {
    expect(xuxu).not.toContain('placeholder="输入你的问题"');
    expect(xuxu).toContain('健康管理参考');
  });
});
```

- [ ] **Step 2: Run tests to verify the reminder treatment is absent**

Run: `pnpm --filter @heban/mini test -- records-experience.spec.ts`

Expected: FAIL because `RecordsPage.vue` does not reference `xuxu-record-reminder.png`.

- [ ] **Step 3: Implement focused interaction and factual copy**

In `RecordsPage.vue`, keep all existing form validation, API calls, versioned `replaceRecord`, and timeline behavior. Render an illustrated empty state before the form when there are no current records; render the `xuxu-record-reminder.png` compact reminder only while the selected record type is absent; after a successful save, use `XuxuHint` with factual copy tied to the saved type. Keep the scene selector as the only form mode switch and do not add calorie fields.

In `XuxuPage.vue`, use the avatar and an illustrated welcome treatment. Retain only four current scoped question cards and their deterministic answers. Show one “我看到的今天” summary from `today.dailyAction`; do not add text input, model-provider wording, medical claims, or an online status badge.

In `MePage.vue`, retain health archive and plan adjustment navigation. Replace future-feature action buttons with plain “即将开放” descriptions that cannot be mistaken for available data export, reminders, or AI controls.

- [ ] **Step 4: Run focused tests and full mini verification**

Run:

```powershell
pnpm --filter @heban/mini test -- records-experience.spec.ts
pnpm --filter @heban/mini test
pnpm --filter @heban/mini typecheck
pnpm --filter @heban/mini build:mp-weixin:check
```

Expected: all commands PASS.

- [ ] **Step 5: Commit supporting screen redesign**

```powershell
git add apps/mini/src/pages/records apps/mini/src/pages/xuxu apps/mini/src/pages/me
git commit -m "feat: redesign supporting health screens"
```

### Task 6: Verify All Existing Data Behaviors and Document Stage 2B-1

**Files:**
- Modify: `docs/product/heshengxu-product-blueprint.md`
- Create: `docs/engineering/stage-2b1-acceptance.md`

- [ ] **Step 1: Extend the product blueprint with the completed experience boundary**

Add a Stage 2B-1 entry stating that the daily action loop uses real records, plans, and tasks; all Demo-derived score, calorie, trend, and free-chat behaviors remain unavailable. Add a Stage 2B-2 entry for true trend, weekly review, and plan adjustment, with the explicit condition that insufficient data must be explained rather than visualized.

- [ ] **Step 2: Create the acceptance record**

Create `docs/engineering/stage-2b1-acceptance.md` with this required checklist:

```md
# 阶段 2B-1 验收记录

- [ ] 未建档时只显示欢迎/建档路径，底部五栏不可进入。
- [ ] 首页主行动、计划和任务均来自 `/daily-home/today` 的真实响应。
- [ ] 首页最多显示三件待办；没有待办时不显示虚构任务。
- [ ] 空记录、缺记录和全部完成使用对应的已审图，并不显示虚构健康分或趋势。
- [ ] 记录创建和版本化修改后，首页、计划和记录页均通过 store 刷新。
- [ ] 序序没有自由文本输入、模型调用宣称或医学诊断。
- [ ] 微信构建产物存在 `app.json`、首页、记录、序序、计划和我的页面。
```

- [ ] **Step 3: Run the full workspace verification**

Run:

```powershell
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @heban/mini build:mp-weixin:check
git diff --check
```

Expected: each command exits with code 0; the mini build verification reports its `mp-weixin` output directory.

- [ ] **Step 4: Manually verify in WeChat Developer Tools**

Import `D:\禾伴\heban-ai-health-demo\apps\mini\dist\build\mp-weixin` and verify this exact flow: welcome -> complete profile -> choose weight plan -> save a sleep record -> save a weight record -> complete a task -> switch all five tabs -> edit the weight record -> refresh -> confirm only the replacement weight is shown.

Expected: no route bypass before onboarding, no missing `app.json`, and no screen uses values that were not saved through the API.

- [ ] **Step 5: Commit, push, and record the stage boundary**

```powershell
git add apps/mini docs/product/heshengxu-product-blueprint.md docs/engineering/stage-2b1-acceptance.md
git commit -m "feat: complete demo-led mini experience"
git push origin main
```

## Plan Self-Review

| Design requirement | Plan coverage |
| --- | --- |
| Demo experience without demo data | Tasks 1, 3, 4, 5 |
| Central and embedded Xuxu presence | Tasks 2, 4, 5 |
| Existing art used only for real state | Tasks 3, 4, 5 |
| No premature AI, calorie, score, or medical capabilities | Tasks 1, 5, 6 |
| Existing records, plans, and versioning preserved | Tasks 1, 4, 5, 6 |
| Build, test, and mini-program validation | Every task; final full verification in Task 6 |

This plan intentionally excludes Stage 2B-2 insights. Stage 2B-2 will be planned after this experience is accepted, because its API contract and aggregation tests must be based on the final presentation states rather than Demo-only expectations.
