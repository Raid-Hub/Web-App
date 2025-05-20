import { type Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getServerSession } from "~/lib/server/auth"
import { type AppProfile } from "~/types/api"
import { bungieProfileIconUrl } from "~/util/destiny"
import { ProfileClientWrapper } from "../../ProfileClientWrapper"
import { ProfilePage } from "../../ProfilePage"
import { generatePlayerMetadata } from "../../metadata"
import {
    getUniqueProfileByVanity,
    prefetchRaidHubPlayerProfile,
    prefetchRaidHubPlayerProfileAuthenticated
} from "../../prefetch"
import { type ProfileProps } from "../../types"

export const revalidate = 0

type PageProps = {
    params: {
        vanity: string
    }
}

/**
 * This page preferably should be accessed at /:vanity through rewrites in next.config.js
 */
export default async function Page({ params }: PageProps) {
    // Find the app profile by vanity, and if it doesn't exist next will render a 404
    const appProfile = await getUniqueProfileByVanity(params.vanity).then(p => p ?? notFound())

    return (
        <Suspense
            fallback={
                <ProfileClientWrapper
                    pageProps={{
                        ssrAppProfile: appProfile,
                        destinyMembershipId: appProfile.destinyMembershipId,
                        destinyMembershipType: appProfile.destinyMembershipType,
                        ready: false
                    }}>
                    <ProfilePage destinyMembershipId={appProfile.destinyMembershipId} />
                </ProfileClientWrapper>
            }>
            <HydratedVanityPage {...appProfile} />
        </Suspense>
    )
}

const HydratedVanityPage = async (appProfile: NonNullable<AppProfile>) => {
    const session = await getServerSession()

    const raidHubProfile = await (session?.raidHubAccessToken
        ? prefetchRaidHubPlayerProfileAuthenticated(
              appProfile.destinyMembershipId,
              session.raidHubAccessToken.value
          )
        : prefetchRaidHubPlayerProfile(appProfile.destinyMembershipId))

    const pageProps: ProfileProps = {
        destinyMembershipId: appProfile.destinyMembershipId,
        destinyMembershipType: appProfile.destinyMembershipType,
        ssrAppProfile: appProfile,
        ssrRaidHubProfile: raidHubProfile,
        ready: true
    }
    return (
        <ProfileClientWrapper pageProps={pageProps}>
            <ProfilePage destinyMembershipId={pageProps.destinyMembershipId} />
        </ProfileClientWrapper>
    )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const profile = await getUniqueProfileByVanity(params.vanity).then(p => p ?? notFound())

    const raidhub = await prefetchRaidHubPlayerProfile(profile.destinyMembershipId)

    const username =
        (raidhub?.playerInfo.bungieGlobalDisplayName
            ? `${raidhub.playerInfo.bungieGlobalDisplayName}#${raidhub.playerInfo.bungieGlobalDisplayNameCode}`
            : raidhub?.playerInfo.displayName) ?? null
    const displayName = (profile.user?.name ?? username ?? null)?.split("#")[0] ?? null

    if (!username || !displayName) {
        return {
            robots: {
                follow: true,
                index: false
            }
        }
    }

    const image = profile.user?.image ?? bungieProfileIconUrl(raidhub?.playerInfo.iconPath)

    return generatePlayerMetadata({
        username,
        displayName,
        image,
        destinyMembershipId: profile.destinyMembershipId,
        vanity: profile.vanity
    })
}
