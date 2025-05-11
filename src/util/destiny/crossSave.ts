import type { BungieMembershipType, UserInfoCard } from "bungie-net-core/models"

// Finds the original membershipType of a destiny account
export function findPrimaryCrossSave({
    crossSaveOverride,
    membershipType,
    applicableMembershipTypes
}: UserInfoCard): BungieMembershipType {
    if (applicableMembershipTypes.length === 1) {
        return membershipType
    } else if (applicableMembershipTypes.length) {
        return crossSaveOverride || membershipType
    } else {
        return crossSaveOverride
    }
}

// Determines if the membershipType is the right one
export function isPrimaryCrossSave(
    { crossSaveOverride, membershipType, membershipId }: UserInfoCard,
    forDestinyMembershipId?: string
) {
    return (
        ((!forDestinyMembershipId || forDestinyMembershipId === membershipId) &&
            crossSaveOverride === 0) ||
        crossSaveOverride === membershipType
    )
}
