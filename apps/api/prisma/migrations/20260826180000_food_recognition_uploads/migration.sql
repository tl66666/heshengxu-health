CREATE TYPE "FoodRecognitionUploadStatus" AS ENUM ('pending', 'ready', 'expired');

CREATE TABLE "FoodRecognitionUpload" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "objectKey" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "status" "FoodRecognitionUploadStatus" NOT NULL DEFAULT 'pending',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FoodRecognitionUpload_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "FoodRecognitionJob" ADD COLUMN "uploadId" TEXT;
CREATE UNIQUE INDEX "FoodRecognitionUpload_objectKey_key" ON "FoodRecognitionUpload"("objectKey");
CREATE INDEX "FoodRecognitionUpload_userId_status_expiresAt_idx" ON "FoodRecognitionUpload"("userId", "status", "expiresAt");
CREATE INDEX "FoodRecognitionJob_uploadId_idx" ON "FoodRecognitionJob"("uploadId");
ALTER TABLE "FoodRecognitionUpload" ADD CONSTRAINT "FoodRecognitionUpload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FoodRecognitionJob" ADD CONSTRAINT "FoodRecognitionJob_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "FoodRecognitionUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
