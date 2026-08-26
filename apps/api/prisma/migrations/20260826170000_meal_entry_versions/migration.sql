ALTER TABLE "public"."MealEntry"
  ADD COLUMN "isCurrent" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "previousRecordId" TEXT,
  ADD COLUMN "supersededAt" TIMESTAMP(3),
  ADD COLUMN "deletedAt" TIMESTAMP(3);

DROP INDEX "public"."MealEntry_userId_recordedAt_idx";
DROP INDEX "public"."MealEntry_userId_mealType_recordedAt_idx";
CREATE INDEX "MealEntry_userId_isCurrent_recordedAt_idx" ON "public"."MealEntry"("userId", "isCurrent", "recordedAt");
CREATE INDEX "MealEntry_userId_mealType_isCurrent_recordedAt_idx" ON "public"."MealEntry"("userId", "mealType", "isCurrent", "recordedAt");
ALTER TABLE "public"."MealEntry" ADD CONSTRAINT "MealEntry_previousRecordId_fkey" FOREIGN KEY ("previousRecordId") REFERENCES "public"."MealEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
