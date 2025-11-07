-- CreateTable
CREATE TABLE "public"."HomepageContent" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "sectionIdentifier" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "content" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomepageContent_locale_sectionIdentifier_key" ON "public"."HomepageContent"("locale", "sectionIdentifier");
