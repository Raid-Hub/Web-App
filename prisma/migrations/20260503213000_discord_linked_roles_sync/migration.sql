-- AlterTable
ALTER TABLE "account" ADD COLUMN "discord_role_metadata_synced_at" DATETIME;
ALTER TABLE "account" ADD COLUMN "discord_role_metadata_sync_error" TEXT;
