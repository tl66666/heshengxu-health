ALTER TABLE "public"."FoodRecognitionCandidate"
  ADD COLUMN "estimatedEnergyKcal" DOUBLE PRECISION,
  ADD COLUMN "estimatedProteinG" DOUBLE PRECISION,
  ADD COLUMN "estimatedFatG" DOUBLE PRECISION,
  ADD COLUMN "estimatedCarbohydrateG" DOUBLE PRECISION;
