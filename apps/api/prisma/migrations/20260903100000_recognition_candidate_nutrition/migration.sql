-- The preceding 20260901120000 migration already introduced these columns.
-- Keep this migration idempotent for databases created before that overlap was noticed.
ALTER TABLE "FoodRecognitionCandidate" ADD COLUMN IF NOT EXISTS "estimatedEnergyKcal" DOUBLE PRECISION;
ALTER TABLE "FoodRecognitionCandidate" ADD COLUMN IF NOT EXISTS "estimatedProteinG" DOUBLE PRECISION;
ALTER TABLE "FoodRecognitionCandidate" ADD COLUMN IF NOT EXISTS "estimatedFatG" DOUBLE PRECISION;
ALTER TABLE "FoodRecognitionCandidate" ADD COLUMN IF NOT EXISTS "estimatedCarbohydrateG" DOUBLE PRECISION;
