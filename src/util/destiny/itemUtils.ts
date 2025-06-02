import type { DestinyItemComponent } from "bungie-net-core/models"
import { armorBuckets, weaponBuckets } from "~/lib/inventory-item-buckets"

export function findWeaponInBucket(
    items: DestinyItemComponent[],
    bucket: keyof typeof weaponBuckets
) {
    return items.find(item => item.bucketHash === weaponBuckets[bucket])
}

export function findArmorInBucket(
    items: DestinyItemComponent[],
    bucket: keyof typeof armorBuckets
) {
    return items.find(item => item.bucketHash === armorBuckets[bucket])
}
