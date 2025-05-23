/*
  Warnings:

  - You are about to drop the `pgcr` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "pgcr";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "pgcr_report" (
    "report_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "instance_id" TEXT NOT NULL,
    "categories" TEXT NOT NULL,
    "heuristics" TEXT NOT NULL,
    "players" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "is_reporter_in_instance" BOOLEAN NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "closed_by_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" DATETIME,
    CONSTRAINT "pgcr_report_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "bungie_user" ("bungie_membership_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pgcr_report_closed_by_id_fkey" FOREIGN KEY ("closed_by_id") REFERENCES "bungie_user" ("bungie_membership_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_destiny_profile" (
    "destiny_membership_id" TEXT NOT NULL PRIMARY KEY,
    "destiny_membership_type" INTEGER NOT NULL,
    "bungie_membership_id" TEXT,
    "is_primary" BOOLEAN NOT NULL,
    "pinned_activity_id" TEXT,
    "vanity" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "destiny_profile_bungie_membership_id_fkey" FOREIGN KEY ("bungie_membership_id") REFERENCES "bungie_user" ("bungie_membership_id") ON DELETE NO ACTION ON UPDATE CASCADE
);
INSERT INTO "new_destiny_profile" ("bungie_membership_id", "created_at", "destiny_membership_id", "destiny_membership_type", "is_primary", "pinned_activity_id", "updated_at", "vanity") SELECT "bungie_membership_id", "created_at", "destiny_membership_id", "destiny_membership_type", "is_primary", "pinned_activity_id", "updated_at", "vanity" FROM "destiny_profile";
DROP TABLE "destiny_profile";
ALTER TABLE "new_destiny_profile" RENAME TO "destiny_profile";
CREATE UNIQUE INDEX "destiny_profile_vanity_key" ON "destiny_profile"("vanity");
CREATE INDEX "destiny_profile_pinned_activity_id_idx" ON "destiny_profile"("pinned_activity_id");
CREATE INDEX "destiny_profile_bungie_membership_id_idx" ON "destiny_profile"("bungie_membership_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "pgcr_report_created_at_idx" ON "pgcr_report"("created_at" DESC);

-- CreateIndex
CREATE INDEX "pgcr_report_instance_id_idx" ON "pgcr_report"("instance_id");

-- CreateIndex
CREATE INDEX "pgcr_report_reporter_id_idx" ON "pgcr_report"("reporter_id", "created_at" DESC);
