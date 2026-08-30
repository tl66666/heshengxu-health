# Weight Management Data Consistency

## Scope

This note records the persistence rules for the weight-management module so other module sessions can integrate without reintroducing demo data.

## Rules

- `HealthTarget.startWeightKg` is captured when a weight plan is created from the user's health profile.
- Plan reads prefer the stored snapshot. Legacy targets with a null snapshot temporarily fall back to the current profile weight.
- Weight history is loaded from `GET /api/v1/health-records/weights/history`; local storage is only a network-failure fallback.
- New records use `POST /api/v1/health-records/weights`. Edits use versioned `PATCH /api/v1/health-records/weight/:recordId` and preserve the original `recordedAt` unless explicitly changed by a future editor.
- Empty history renders an explicit empty state. No seeded or fake weight values are allowed.

## Migration

Apply Prisma migration `20260830200000_health_target_start_weight` before deploying the API. Existing plans remain readable through the legacy fallback until they are recreated.
