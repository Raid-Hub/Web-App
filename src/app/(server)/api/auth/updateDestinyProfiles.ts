import { type DestinyLinkedProfilesResponse } from "bungie-net-core/models"
import { prisma } from "~/server/prisma"

// TODO: Expose this functionality in a tRPC route
export const updateDestinyProfiles = async (data: DestinyLinkedProfilesResponse) => {
    const applicableMemberships = data.profiles.filter(m => m.applicableMembershipTypes.length > 0)

    const primaryDestinyMembershipId = applicableMemberships.sort(
        (a, b) => new Date(b.dateLastPlayed).getTime() - new Date(a.dateLastPlayed).getTime()
    )[0]?.membershipId

    if (!primaryDestinyMembershipId) throw new Error("No primary membership found")

    const [, ...profiles] = await prisma.$transaction([
        prisma.profile.deleteMany({
            where: {
                bungieMembershipId: data.bnetMembership.membershipId,
                vanity: null
            }
        }),
        ...applicableMemberships.map(membership =>
            prisma.profile.upsert({
                create: {
                    destinyMembershipId: membership.membershipId,
                    destinyMembershipType: membership.membershipType,
                    isPrimary: membership.membershipId === primaryDestinyMembershipId,
                    bungieMembershipId: data.bnetMembership.membershipId
                },
                update: {
                    bungieMembershipId: data.bnetMembership.membershipId,
                    isPrimary: membership.membershipId === primaryDestinyMembershipId
                },
                where: {
                    destinyMembershipId: membership.membershipId
                },
                select: {
                    isPrimary: true,
                    destinyMembershipId: true,
                    destinyMembershipType: true,
                    vanity: true
                }
            })
        )
    ])

    return profiles
}
