CREATE TYPE "public"."FoodRecognitionJobStatus" AS ENUM ('queued', 'processing', 'succeeded', 'failed', 'confirmed');

CREATE TABLE "public"."FoodRecognitionJob" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "imageKey" TEXT NOT NULL,
  "status" "public"."FoodRecognitionJobStatus" NOT NULL DEFAULT 'queued',
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FoodRecognitionJob_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FoodRecognitionJob_userId_createdAt_idx" ON "public"."FoodRecognitionJob"("userId", "createdAt");
CREATE INDEX "FoodRecognitionJob_userId_status_idx" ON "public"."FoodRecognitionJob"("userId", "status");
ALTER TABLE "public"."FoodRecognitionJob" ADD CONSTRAINT "FoodRecognitionJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "public"."FoodRecognitionCandidate" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "foodId" TEXT,
  "nameSnapshot" TEXT NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL,
  "estimatedGrams" DOUBLE PRECISION NOT NULL,
  "rank" INTEGER NOT NULL,
  CONSTRAINT "FoodRecognitionCandidate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FoodRecognitionCandidate_jobId_rank_key" ON "public"."FoodRecognitionCandidate"("jobId", "rank");
CREATE INDEX "FoodRecognitionCandidate_jobId_idx" ON "public"."FoodRecognitionCandidate"("jobId");
ALTER TABLE "public"."FoodRecognitionCandidate" ADD CONSTRAINT "FoodRecognitionCandidate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."FoodRecognitionJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."FoodRecognitionCandidate" ADD CONSTRAINT "FoodRecognitionCandidate_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "public"."FoodItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
