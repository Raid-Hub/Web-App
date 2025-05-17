import { type DestinyLinkedProfilesResponse } from "bungie-net-core/models"
import { prisma } from "~/server/prisma"

// TODO: Expose this functionality in a tRPC route
export const updateDestinyProfiles = async (data: DestinyLinkedProfilesResponse) => {
    const applicableMemberships = data.profiles.filter(
        m =>
            m.applicableMembershipTypes.length > 0 ||
            (m.isOverridden && new Date(m.dateLastPlayed).getTime() > 0)
    )

    const primaryDestinyMembershipId = applicableMemberships.sort(
        (a, b) => new Date(b.dateLastPlayed).getTime() - new Date(a.dateLastPlayed).getTime()
    )[0]?.membershipId

    if (!primaryDestinyMembershipId)
        throw new TypeError("No primary Destiny membership found", {
            cause: {
                data,
                applicableMemberships
            }
        })

    const profiles = await prisma.$transaction(
        applicableMemberships.map(membership =>
            prisma.profile.upsert({
                create: {
                    user: {
                        connect: {
                            id: data.bnetMembership.membershipId
                        }
                    },
                    isPrimary: membership.membershipId === primaryDestinyMembershipId,
                    destinyMembershipId: membership.membershipId,
                    destinyMembershipType: membership.membershipType
                },
                update: {
                    user: {
                        connect: {
                            id: data.bnetMembership.membershipId
                        }
                    },
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
    )

    return profiles
}
