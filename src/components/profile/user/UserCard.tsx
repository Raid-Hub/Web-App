"use client"

import Link from "next/link"
import { useMemo } from "react"
import { usePageProps } from "~/components/PageWrapper"
import { useItemDefinition } from "~/hooks/dexie"
import type { ProfileProps } from "~/lib/profile/types"
import { trpc } from "~/lib/trpc"
import { useClansForMember, useLinkedProfiles, useProfile } from "~/services/bungie/hooks"
import { useRaidHubResolvePlayer } from "~/services/raidhub/hooks"
import { Avatar, AvatarImage } from "~/shad/avatar"
import { Card, CardHeader } from "~/shad/card"
import { bungieBannerEmblemUrl, bungieProfileIconUrl } from "~/util/destiny"
import { fixClanName } from "~/util/destiny/fixClanName"
import { getBungieDisplayName } from "~/util/destiny/getBungieDisplayName"
import { decodeHtmlEntities } from "~/util/presentation/formatting"
import { CommunityProfiles } from "./CommunityProfiles."
import { ProfileBadge } from "./ProfileBadge"
import { UserCardSocials } from "./UserCardSocials"
import { UserRanks } from "./UserRanks"

export function UserCard() {
    const props = usePageProps<ProfileProps>()

    const destinyProfileQuery = useProfile(
        {
            destinyMembershipId: props.destinyMembershipId,
            membershipType: props.destinyMembershipType
        },
        {
            staleTime: 1000 * 60 * 2
        }
    )

    const bungieProfileQuery = useLinkedProfiles(
        {
            membershipId: props.destinyMembershipId
        },
        {
            select: res => res.bnetMembership
        }
    )

    const { data: raidHubUser } = trpc.profile.getUnique.useQuery(
        {
            destinyMembershipId: props.destinyMembershipId
        },
        {
            select: data => data?.user,
            // Required to prevent the query from running before the page is ready
            enabled: props.ready
        }
    )

    const { data: resolvedPlayer } = useRaidHubResolvePlayer(props.destinyMembershipId, {
        // We don't need to call this endpoint, but if we have the data, we can use it
        enabled: false
    })

    const emblemHash = useMemo(() => {
        const emblems = destinyProfileQuery?.data?.characters?.data
            ? Object.values(destinyProfileQuery.data.characters.data)[0]
            : undefined

        return emblems?.emblemHash
    }, [destinyProfileQuery])

    const emblemBannerUrl = bungieBannerEmblemUrl(useItemDefinition(emblemHash ?? -1))

    const userInfo =
        destinyProfileQuery?.data?.profile.data?.userInfo ??
        bungieProfileQuery.data ??
        resolvedPlayer

    const icon =
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        raidHubUser?.image ||
        bungieProfileIconUrl(
            Object.values(destinyProfileQuery?.data?.characters.data ?? {})[0]?.emblemPath ??
                resolvedPlayer?.iconPath
        )

    const { data: clan } = useClansForMember(
        { membershipId: props.destinyMembershipId, membershipType: props.destinyMembershipType },
        {
            staleTime: 10 * 60000,
            select: res => (res.results.length > 0 ? res.results[0].group : null)
        }
    )

    const clanTitle = useMemo(
        () =>
            clan
                ? decodeHtmlEntities(fixClanName(clan.name) + ` [${clan.clanInfo.clanCallsign}]`)
                : null,
        [clan]
    )

    const [displayName, displayNameCode] = (
        userInfo ? getBungieDisplayName(userInfo) : "Guardian#0000"
    ).split("#")

    return (
        <Card className="w-full">
            <CardHeader
                className="relative h-16 overflow-hidden bg-center object-cover p-0 md:h-24"
                style={{
                    backgroundImage: `url(${emblemBannerUrl})`
                }}>
                <div className="absolute top-1/2 left-40 z-20 flex h-full -translate-y-1/2 max-md:left-1/4">
                    <div className="flex items-stretch">
                        {raidHubUser?.badges
                            ?.slice(0, 5)
                            .map(badge => <ProfileBadge key={badge.id} {...badge} size={24} />)}
                    </div>
                </div>
            </CardHeader>

            <div className="flex w-full flex-col flex-wrap gap-x-6 gap-y-4 p-3 md:flex-row md:items-center">
                {/* Profile Picture */}
                <div className="flex gap-4">
                    <Avatar className="size-20 border-1 md:-mt-16 md:size-28">
                        <AvatarImage src={icon} alt="profile picture" />
                    </Avatar>

                    {/* Name and clan */}
                    <div className="flex flex-col items-start gap-1 p-1">
                        <h1 className="text-2xl">
                            {displayName}
                            {displayNameCode && (
                                <span className="text-secondary font-normal">
                                    #{displayNameCode}
                                </span>
                            )}
                        </h1>
                        {clanTitle && (
                            <div className="m-0.5 text-lg">
                                <Link href={`/clan/${clan!.groupId}`} className="text-secondary">
                                    {clanTitle}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <UserRanks />
                <CommunityProfiles />
                <UserCardSocials />
            </div>
        </Card>
    )
}
