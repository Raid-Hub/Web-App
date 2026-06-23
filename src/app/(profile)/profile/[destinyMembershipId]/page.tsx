import { type Metadata } from "next"
import { RedirectType, notFound, permanentRedirect } from "next/navigation"
import { ProfileClientWrapper } from "~/components/profile/ProfileClientWrapper"
import { ProfilePage } from "~/components/profile/ProfilePage"
import { generatePlayerMetadata } from "~/lib/profile/metadata"
import {
    getUniqueProfileByDestinyMembershipId,
    prefetchDestinyLinkedProfiles,
    prefetchRaidHubPlayerBasic
} from "~/lib/profile/prefetch"
import { type ProfileProps } from "~/lib/profile/types"
import { isValidDestinyMembershipId } from "~/util/destiny/routeParams"
import { bungieProfileIconUrl } from "~/util/destiny"

export const revalidate = 0

type PageProps = {
    params: {
        destinyMembershipId: string
    }
}

function isBenignLinkedProfilesError(err: unknown): boolean {
    if (err instanceof DOMException && err.name === "AbortError") {
        return true
    }

    if (err instanceof Error) {
        return (
            err.name === "AbortError" ||
            err.message.includes("aborted") ||
            err.message.includes("Operation failed after")
        )
    }

    return false
}

export default async function Page({ params }: PageProps) {
    if (!isValidDestinyMembershipId(params.destinyMembershipId)) {
        notFound()
    }

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
        ).catch(err => {
            if (isBenignLinkedProfilesError(err)) {
                return null
            }

            throw err
        })
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
    if (!isValidDestinyMembershipId(params.destinyMembershipId)) {
        return {
            robots: {
                follow: true,
                index: false
            }
        }
    }

    const [profile, basic] = await Promise.all([
        getUniqueProfileByDestinyMembershipId(params.destinyMembershipId),
        prefetchRaidHubPlayerBasic(params.destinyMembershipId)
    ])

    const username = basic?.bungieGlobalDisplayName
        ? `${basic.bungieGlobalDisplayName}#${basic.bungieGlobalDisplayNameCode}`
        : (basic?.displayName ?? null)
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
