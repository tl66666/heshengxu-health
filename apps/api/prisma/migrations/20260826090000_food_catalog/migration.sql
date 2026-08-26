CREATE TYPE "public"."MealEntrySource" AS ENUM ('manual', 'photo_confirmed');

CREATE TABLE "public"."FoodCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FoodCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FoodCategory_slug_key" ON "public"."FoodCategory"("slug");
CREATE INDEX "FoodCategory_isActive_sortOrder_idx" ON "public"."FoodCategory"("isActive", "sortOrder");

CREATE TABLE "public"."FoodItem" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "brand" TEXT,
  "categoryId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FoodItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FoodItem_isActive_name_idx" ON "public"."FoodItem"("isActive", "name");
CREATE INDEX "FoodItem_categoryId_isActive_idx" ON "public"."FoodItem"("categoryId", "isActive");
ALTER TABLE "public"."FoodItem" ADD CONSTRAINT "FoodItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."FoodCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "public"."FoodAlias" (
  "id" TEXT NOT NULL,
  "foodId" TEXT NOT NULL,
  "alias" TEXT NOT NULL,
  CONSTRAINT "FoodAlias_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FoodAlias_foodId_alias_key" ON "public"."FoodAlias"("foodId", "alias");
CREATE INDEX "FoodAlias_alias_idx" ON "public"."FoodAlias"("alias");
ALTER TABLE "public"."FoodAlias" ADD CONSTRAINT "FoodAlias_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "public"."FoodItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "public"."FoodNutrition" (
  "id" TEXT NOT NULL,
  "foodId" TEXT NOT NULL,
  "basisGrams" INTEGER NOT NULL DEFAULT 100,
  "energyKcal" DOUBLE PRECISION NOT NULL,
  "proteinG" DOUBLE PRECISION NOT NULL,
  "fatG" DOUBLE PRECISION NOT NULL,
  "carbohydrateG" DOUBLE PRECISION NOT NULL,
  "dietaryFiberG" DOUBLE PRECISION,
  "sodiumMg" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FoodNutrition_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FoodNutrition_foodId_key" ON "public"."FoodNutrition"("foodId");
ALTER TABLE "public"."FoodNutrition" ADD CONSTRAINT "FoodNutrition_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "public"."FoodItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "public"."FoodServing" (
  "id" TEXT NOT NULL,
  "foodId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "grams" DOUBLE PRECISION NOT NULL,
  CONSTRAINT "FoodServing_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FoodServing_foodId_label_key" ON "public"."FoodServing"("foodId", "label");
CREATE INDEX "FoodServing_foodId_idx" ON "public"."FoodServing"("foodId");
ALTER TABLE "public"."FoodServing" ADD CONSTRAINT "FoodServing_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "public"."FoodItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "public"."MealEntry" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "mealType" "public"."MealType" NOT NULL,
  "foodId" TEXT,
  "foodNameSnapshot" TEXT NOT NULL,
  "grams" DOUBLE PRECISION NOT NULL,
  "energyKcal" DOUBLE PRECISION NOT NULL,
  "proteinG" DOUBLE PRECISION NOT NULL,
  "fatG" DOUBLE PRECISION NOT NULL,
  "carbohydrateG" DOUBLE PRECISION NOT NULL,
  "dietaryFiberG" DOUBLE PRECISION,
  "sodiumMg" DOUBLE PRECISION,
  "source" "public"."MealEntrySource" NOT NULL DEFAULT 'manual',
  "recordedAt" TIMESTAMP(3) NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MealEntry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MealEntry_userId_recordedAt_idx" ON "public"."MealEntry"("userId", "recordedAt");
CREATE INDEX "MealEntry_userId_mealType_recordedAt_idx" ON "public"."MealEntry"("userId", "mealType", "recordedAt");
ALTER TABLE "public"."MealEntry" ADD CONSTRAINT "MealEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."MealEntry" ADD CONSTRAINT "MealEntry_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "public"."FoodItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
