ALTER TABLE "MealEntry" ADD COLUMN "userFoodId" TEXT;

CREATE INDEX "MealEntry_userFoodId_idx" ON "MealEntry"("userFoodId");

ALTER TABLE "MealEntry"
ADD CONSTRAINT "MealEntry_userFoodId_fkey"
FOREIGN KEY ("userFoodId") REFERENCES "UserFood"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
