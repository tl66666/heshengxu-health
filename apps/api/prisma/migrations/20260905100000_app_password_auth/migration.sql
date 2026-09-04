CREATE TABLE "public"."AppCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AppCredential_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AppCredential_userId_key" ON "public"."AppCredential"("userId");
CREATE UNIQUE INDEX "AppCredential_email_key" ON "public"."AppCredential"("email");
ALTER TABLE "public"."AppCredential" ADD CONSTRAINT "AppCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
