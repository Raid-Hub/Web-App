-- CreateTable
CREATE TABLE "badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_UserToBadge" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_UserToBadge_A_fkey" FOREIGN KEY ("A") REFERENCES "badge" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserToBadge_B_fkey" FOREIGN KEY ("B") REFERENCES "bungie_user" ("bungie_membership_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserToBadge_AB_unique" ON "_UserToBadge"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToBadge_B_index" ON "_UserToBadge"("B");
