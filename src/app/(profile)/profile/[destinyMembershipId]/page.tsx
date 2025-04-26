import { type Metadata } from "next"
import { RedirectType, notFound, permanentRedirect } from "next/navigation"
import { bungieProfileIconUrl } from "~/util/destiny"
import { ProfileClientWrapper } from "../../ProfileClientWrapper"
import { ProfilePage } from "../../ProfilePage"
import { generatePlayerMetadata } from "../../metadata"
import {
    getUniqueProfileByDestinyMembershipId,
    prefetchDestinyLinkedProfiles,
    prefetchRaidHubPlayerBasic
} from "../../prefetch"
import { type ProfileProps } from "../../types"

export const revalidate = 0

type PageProps = {
    params: {
        destinyMembershipId: string
    }
}

export default async function Page({ params }: PageProps) {
    // Find the app profile by id if it exists
    const [appProfile, basicProfile] = await Promise.all([
        getUniqueProfileByDestinyMembershipId(params.destinyMembershipId),
        prefetchRaidHubPlayerBasic(params.destinyMembershipId)
    ])

    if (!basicProfile?.membershipType) {
        // If the profile doesn't exist in the raidhub DB, we can assume
        // that its a dead account

        const linkedProfilesResponse = await prefetchDestinyLinkedProfiles(
            params.destinyMembershipId
        )
        const applicableMemberships = linkedProfilesResponse?.profiles.filter(
            m => m.applicableMembershipTypes.length > 0
        )

        const primaryDestinyMembership = applicableMemberships?.sort(
            (a, b) => new Date(b.dateLastPlayed).getTime() - new Date(a.dateLastPlayed).getTime()
        )[0]

        if (!primaryDestinyMembership || !linkedProfilesResponse) {
            // If we don't have a primary membership, we can assume the account is dead
            return notFound()
        } else if (primaryDestinyMembership.membershipId !== params.destinyMembershipId) {
            // First, try to redirect to another valid linked profile
            permanentRedirect(
                `/profile/${primaryDestinyMembership.membershipId}`,
                RedirectType.replace
            )
        } else {
            const pageProps: ProfileProps = {
                destinyMembershipId: params.destinyMembershipId,
                destinyMembershipType: primaryDestinyMembership.membershipType,
                ssrRaidHubBasic: null,
                ssrAppProfile: null,
                ready: true
            }

            return (
                <ProfileClientWrapper pageProps={pageProps}>
                    <ProfilePage destinyMembershipId={pageProps.destinyMembershipId} />
                </ProfileClientWrapper>
            )
        }
    }

    const pageProps: ProfileProps = {
        ...params,
        destinyMembershipType: basicProfile?.membershipType ?? 0,
        ssrRaidHubBasic: basicProfile,
        ssrAppProfile: appProfile,
        ready: true
    }

    // Right now, I've chosen to not prefetch the Destiny profile for non
    // vanity pages, but we could do that here if we wanted to
    return (
        <ProfileClientWrapper pageProps={pageProps}>
            <ProfilePage destinyMembershipId={pageProps.destinyMembershipId} />
        </ProfileClientWrapper>
    )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const [profile, basic] = await Promise.all([
        getUniqueProfileByDestinyMembershipId(params.destinyMembershipId),
        prefetchRaidHubPlayerBasic(params.destinyMembershipId)
    ])

    const username = basic?.bungieGlobalDisplayName
        ? `${basic.bungieGlobalDisplayName}#${basic.bungieGlobalDisplayNameCode}`
        : basic?.displayName ?? null
    const displayName = username?.split("#")[0] ?? null

    if (!username || !displayName) {
        return {
            robots: {
                follow: true,
                index: false
            }
        }
    }

    const image = profile?.user?.image ?? bungieProfileIconUrl(basic?.iconPath)

    return generatePlayerMetadata({
        displayName,
        username,
        image,
        destinyMembershipId: params.destinyMembershipId,
        vanity: profile?.vanity ?? null
    })
}
