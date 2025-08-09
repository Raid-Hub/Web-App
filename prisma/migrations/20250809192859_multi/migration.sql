-- CreateTable
CREATE TABLE "pgcr_multi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "owner_membership_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "pgcr_multi_owner_membership_id_fkey" FOREIGN KEY ("owner_membership_id") REFERENCES "bungie_user" ("bungie_membership_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pgcr_multi_item" (
    "multi_id" TEXT NOT NULL,
    "instance_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pgcr_multi_item_multi_id_fkey" FOREIGN KEY ("multi_id") REFERENCES "pgcr_multi" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "pgcr_multi_item_instance_id_multi_id_key" ON "pgcr_multi_item"("instance_id", "multi_id");
