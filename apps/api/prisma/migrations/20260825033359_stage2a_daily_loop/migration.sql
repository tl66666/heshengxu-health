-- CreateEnum
CREATE TYPE "public"."PlanKind" AS ENUM ('weight', 'sleep');

-- CreateEnum
CREATE TYPE "public"."PlanStatus" AS ENUM ('active', 'paused', 'archived');

-- CreateEnum
CREATE TYPE "public"."WeightDirection" AS ENUM ('lose', 'maintain', 'gain');

-- CreateEnum
CREATE TYPE "public"."PlanTaskAction" AS ENUM ('record_weight', 'record_meal', 'walk_15_minutes', 'record_sleep');

-- CreateEnum
CREATE TYPE "public"."PlanTaskStatus" AS ENUM ('pending', 'completed', 'skipped');

-- CreateEnum
CREATE TYPE "public"."MealType" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- CreateEnum
CREATE TYPE "public"."SleepQuality" AS ENUM ('poor', 'fair', 'good');

-- CreateTable
CREATE TABLE "public"."HealthTarget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "public"."PlanKind" NOT NULL,
    "direction" "public"."WeightDirection",
    "targetWeightKg" DOUBLE PRECISION,
    "startDate" DATE NOT NULL,
    "status" "public"."PlanStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PersonalPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "healthTargetId" TEXT NOT NULL,
    "kind" "public"."PlanKind" NOT NULL,
    "startDate" DATE NOT NULL,
    "status" "public"."PlanStatus" NOT NULL DEFAULT 'active',
    "ruleVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanTask" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "scheduledFor" DATE NOT NULL,
    "actionType" "public"."PlanTaskAction" NOT NULL,
    "status" "public"."PlanTaskStatus" NOT NULL DEFAULT 'pending',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WeightRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "valueKg" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "previousRecordId" TEXT,
    "supersededAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeightRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MealStructureRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mealType" "public"."MealType" NOT NULL,
    "hasStaple" BOOLEAN NOT NULL,
    "hasProtein" BOOLEAN NOT NULL,
    "hasVegetable" BOOLEAN NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "previousRecordId" TEXT,
    "supersededAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealStructureRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ActivityRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "intensity" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "previousRecordId" TEXT,
    "supersededAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SleepRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "quality" "public"."SleepQuality" NOT NULL,
    "sleepAt" TIMESTAMP(3),
    "wakeAt" TIMESTAMP(3),
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "previousRecordId" TEXT,
    "supersededAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SleepRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthTarget_userId_status_idx" ON "public"."HealthTarget"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalPlan_healthTargetId_key" ON "public"."PersonalPlan"("healthTargetId");

-- CreateIndex
CREATE INDEX "PersonalPlan_userId_status_idx" ON "public"."PersonalPlan"("userId", "status");

-- CreateIndex
CREATE INDEX "PlanTask_planId_scheduledFor_idx" ON "public"."PlanTask"("planId", "scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "PlanTask_planId_scheduledFor_actionType_key" ON "public"."PlanTask"("planId", "scheduledFor", "actionType");

-- CreateIndex
CREATE INDEX "WeightRecord_userId_isCurrent_recordedAt_idx" ON "public"."WeightRecord"("userId", "isCurrent", "recordedAt");

-- CreateIndex
CREATE INDEX "MealStructureRecord_userId_isCurrent_recordedAt_idx" ON "public"."MealStructureRecord"("userId", "isCurrent", "recordedAt");

-- CreateIndex
CREATE INDEX "ActivityRecord_userId_isCurrent_recordedAt_idx" ON "public"."ActivityRecord"("userId", "isCurrent", "recordedAt");

-- CreateIndex
CREATE INDEX "SleepRecord_userId_isCurrent_recordedAt_idx" ON "public"."SleepRecord"("userId", "isCurrent", "recordedAt");

-- AddForeignKey
ALTER TABLE "public"."HealthTarget" ADD CONSTRAINT "HealthTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonalPlan" ADD CONSTRAINT "PersonalPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonalPlan" ADD CONSTRAINT "PersonalPlan_healthTargetId_fkey" FOREIGN KEY ("healthTargetId") REFERENCES "public"."HealthTarget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanTask" ADD CONSTRAINT "PlanTask_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."PersonalPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeightRecord" ADD CONSTRAINT "WeightRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeightRecord" ADD CONSTRAINT "WeightRecord_previousRecordId_fkey" FOREIGN KEY ("previousRecordId") REFERENCES "public"."WeightRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MealStructureRecord" ADD CONSTRAINT "MealStructureRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MealStructureRecord" ADD CONSTRAINT "MealStructureRecord_previousRecordId_fkey" FOREIGN KEY ("previousRecordId") REFERENCES "public"."MealStructureRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityRecord" ADD CONSTRAINT "ActivityRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityRecord" ADD CONSTRAINT "ActivityRecord_previousRecordId_fkey" FOREIGN KEY ("previousRecordId") REFERENCES "public"."ActivityRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SleepRecord" ADD CONSTRAINT "SleepRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SleepRecord" ADD CONSTRAINT "SleepRecord_previousRecordId_fkey" FOREIGN KEY ("previousRecordId") REFERENCES "public"."SleepRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
