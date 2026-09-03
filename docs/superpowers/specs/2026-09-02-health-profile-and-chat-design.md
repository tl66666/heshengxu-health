# Health profile and companion chat design

## Scope

This change closes the onboarding-to-home weight goal loop and refreshes the Xuxu conversation surface without changing the existing water workflow.

## Decisions

- Onboarding starts with editable baseline values of 168 cm and 60 kg so BMI is immediately visible. These are defaults, not seeded records: the user can replace them before saving.
- Step 4 shows a target-weight field only for weight management, maintenance, or muscle-gain goals. Saving the profile writes the initial weight record and the target into the local health plan.
- Home weight progress is derived only from saved profile, plan, and weight records. When a target is missing, the card shows a clear setup state instead of invented progress.
- The home progress card uses a lightweight SVG arc, a visibility toggle for current/target numbers, and compact supporting labels.
- Xuxu chat uses one coherent bright cream/watercolor style. Existing API calls, retry states, and offline fallback remain intact; only the hierarchy and presentation are consolidated.
- Existing illustration assets are reused in onboarding and the chat empty state; no new image generation is needed for this pass.

## Data flow

`onboardingState.form` -> `saveLocalProfile` + `syncPrimaryHealthPlan(goal, targetWeightKg)` -> `loadLocalPlan`/`healthLoopState.loadToday` -> Home progress card.

## Validation

- Unit tests cover default BMI inputs and target-weight plan persistence.
- Build the WeChat mini-program and inspect the generated artifact.
- Exercise onboarding save and the home visibility toggle in the rendered app where the runtime is available.
