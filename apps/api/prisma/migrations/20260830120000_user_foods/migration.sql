CREATE TABLE "public"."UserFood" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "source" TEXT NOT NULL,
    "energyKcal" DOUBLE PRECISION NOT NULL,
    "proteinG" DOUBLE PRECISION NOT NULL,
    "fatG" DOUBLE PRECISION NOT NULL,
    "carbohydrateG" DOUBLE PRECISION NOT NULL,
    "defaultServingLabel" TEXT NOT NULL,
    "defaultServingGrams" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFood_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserFood_userId_name_idx" ON "public"."UserFood"("userId", "name");
CREATE INDEX "UserFood_userId_createdAt_idx" ON "public"."UserFood"("userId", "createdAt");

ALTER TABLE "public"."UserFood"
  ADD CONSTRAINT "UserFood_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
