-- CreateEnum
CREATE TYPE "public"."IdentityProvider" AS ENUM ('wechat');

-- CreateEnum
CREATE TYPE "public"."ProfileSex" AS ENUM ('female', 'male', 'unspecified');

-- CreateEnum
CREATE TYPE "public"."HealthGoal" AS ENUM ('weight_management', 'weight_maintenance', 'muscle_gain', 'sleep', 'energy', 'mood');

-- CreateEnum
CREATE TYPE "public"."AiSafetyDecision" AS ENUM ('allow', 'block');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExternalIdentity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "public"."IdentityProvider" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Consent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentVersion" TEXT NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HealthProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "birthDate" DATE,
    "sex" "public"."ProfileSex" NOT NULL DEFAULT 'unspecified',
    "heightCm" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "primaryGoal" "public"."HealthGoal",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AiTrace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "safetyDecision" "public"."AiSafetyDecision" NOT NULL,
    "safetyReason" TEXT,
    "provider" TEXT,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiTrace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExternalIdentity_userId_idx" ON "public"."ExternalIdentity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalIdentity_provider_providerUserId_key" ON "public"."ExternalIdentity"("provider", "providerUserId");

-- CreateIndex
CREATE INDEX "Consent_userId_idx" ON "public"."Consent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HealthProfile_userId_key" ON "public"."HealthProfile"("userId");

-- CreateIndex
CREATE INDEX "AiTrace_userId_createdAt_idx" ON "public"."AiTrace"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."ExternalIdentity" ADD CONSTRAINT "ExternalIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Consent" ADD CONSTRAINT "Consent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HealthProfile" ADD CONSTRAINT "HealthProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiTrace" ADD CONSTRAINT "AiTrace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
