/*
  Fixed Warnings:

  - Added the required column `updated_at` to the `bungie_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `destiny_profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `session` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_badge" ("description", "icon", "id", "name") SELECT "description", "icon", "id", "name" FROM "badge";
DROP TABLE "badge";
ALTER TABLE "new_badge" RENAME TO "badge";
CREATE TABLE "new_bungie_user" (
    "bungie_membership_id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "email_verified" DATETIME,
    "name" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_bungie_user" ("bungie_membership_id", "created_at", "email", "email_verified", "image", "name", "role", "updated_at") SELECT "bungie_membership_id", "created_at", "email", "email_verified", "image", "name", "role", CURRENT_TIMESTAMP FROM "bungie_user";
DROP TABLE "bungie_user";
ALTER TABLE "new_bungie_user" RENAME TO "bungie_user";
CREATE UNIQUE INDEX "user_email_key" ON "bungie_user"("email");
CREATE TABLE "new_destiny_profile" (
    "destiny_membership_id" TEXT NOT NULL PRIMARY KEY,
    "destiny_membership_type" INTEGER NOT NULL,
    "bungie_membership_id" TEXT,
    "is_primary" BOOLEAN NOT NULL,
    "pinned_activity_id" TEXT,
    "vanity" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "destiny_profile_bungie_membership_id_fkey" FOREIGN KEY ("bungie_membership_id") REFERENCES "bungie_user" ("bungie_membership_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "destiny_profile_pinned_activity_id_fkey" FOREIGN KEY ("pinned_activity_id") REFERENCES "pgcr" ("instance_id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_destiny_profile" ("bungie_membership_id", "destiny_membership_id", "destiny_membership_type", "is_primary", "pinned_activity_id", "vanity", "updated_at") SELECT "bungie_membership_id", "destiny_membership_id", "destiny_membership_type", "is_primary", "pinned_activity_id", "vanity", CURRENT_TIMESTAMP FROM "destiny_profile";
DROP TABLE "destiny_profile";
ALTER TABLE "new_destiny_profile" RENAME TO "destiny_profile";
CREATE UNIQUE INDEX "destiny_profile_vanity_key" ON "destiny_profile"("vanity");
CREATE INDEX "destiny_profile_pinned_activity_id_idx" ON "destiny_profile"("pinned_activity_id");
CREATE INDEX "destiny_profile_bungie_membership_id_idx" ON "destiny_profile"("bungie_membership_id");
CREATE TABLE "new_raidhub_access_token" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bungie_membership_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" DATETIME NOT NULL,
    CONSTRAINT "raidhub_access_token_bungie_membership_id_fkey" FOREIGN KEY ("bungie_membership_id") REFERENCES "bungie_user" ("bungie_membership_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_raidhub_access_token" ("bungie_membership_id", "expires_at", "id", "value") SELECT "bungie_membership_id", "expires_at", "id", "value" FROM "raidhub_access_token";
DROP TABLE "raidhub_access_token";
ALTER TABLE "new_raidhub_access_token" RENAME TO "raidhub_access_token";
CREATE UNIQUE INDEX "raidhub_access_token_bungie_membership_id_key" ON "raidhub_access_token"("bungie_membership_id");
CREATE TABLE "new_session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bungie_membership_id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "session_bungie_membership_id_fkey" FOREIGN KEY ("bungie_membership_id") REFERENCES "bungie_user" ("bungie_membership_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_session" ("bungie_membership_id", "expires", "id", "session_token", "updated_at") SELECT "bungie_membership_id", "expires", "id", "session_token", CURRENT_TIMESTAMP FROM "session";
DROP TABLE "session";
ALTER TABLE "new_session" RENAME TO "session";
CREATE UNIQUE INDEX "session_session_token_key" ON "session"("session_token");
CREATE INDEX "session_bungie_membership_id_idx" ON "session"("bungie_membership_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
