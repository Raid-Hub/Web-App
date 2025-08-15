"use client"

import { type UserInfoCard } from "bungie-net-core/models"
import { Lock, LockOpen } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { usePageProps } from "~/components/PageWrapper"
import { useSession } from "~/hooks/app/useSession"
import { useItemDefinition } from "~/hooks/dexie"
import type { ProfileProps } from "~/lib/profile/types"
import { trpc } from "~/lib/trpc"
import { useClansForMember, useLinkedProfiles, useProfile } from "~/services/bungie/hooks"
import { useRaidHubPlayer, useRaidHubResolvePlayer } from "~/services/raidhub/hooks"
import { type RaidHubPlayerInfo } from "~/services/raidhub/types"
import { Avatar, AvatarImage } from "~/shad/avatar"
import { Card, CardHeader } from "~/shad/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/shad/tooltip"
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

    const { data: playerData, isError, error } = useRaidHubPlayer(props.destinyMembershipId)
    const { data: resolvedPlayer } = useRaidHubResolvePlayer(props.destinyMembershipId, {
        // We can use this data if cached, or fetch it if the player is private
        enabled: isError && error.errorCode === "PlayerPrivateProfileError"
    })

    const emblemHash = useMemo(() => {
        const emblems = destinyProfileQuery?.data?.characters?.data
            ? Object.values(destinyProfileQuery.data.characters.data)[0]
            : undefined

        return emblems?.emblemHash
    }, [destinyProfileQuery])

    const emblemBannerUrl = bungieBannerEmblemUrl(useItemDefinition(emblemHash ?? -1))

    const userInfo:
        | RaidHubPlayerInfo
        | UserInfoCard
        | {
              membershipId: string
          } = playerData?.playerInfo ??
        resolvedPlayer ??
        destinyProfileQuery?.data?.profile.data?.userInfo ??
        bungieProfileQuery.data ?? {
            membershipId: props.destinyMembershipId
        }

    const icon =
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        raidHubUser?.image ||
        bungieProfileIconUrl(
            Object.values(destinyProfileQuery?.data?.characters.data ?? {})[0]?.emblemPath ??
                playerData?.playerInfo.iconPath ??
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
    const isPrivate = "isPrivate" in userInfo && userInfo.isPrivate

    const [displayName, displayNameCode] = getBungieDisplayName(userInfo).split("#")

    const { data: session } = useSession()
    const PrivacyLockIcon =
        session?.user.role === "ADMIN" ||
        session?.user.profiles.some(p => p.destinyMembershipId === props.destinyMembershipId)
            ? LockOpen
            : Lock

    return (
        <Card className="w-full">
            <CardHeader
                className="relative h-16 overflow-hidden bg-center object-cover p-0 md:h-24"
                style={{
                    backgroundImage: `url(${emblemBannerUrl})`
                }}>
                {!!raidHubUser?.badges.length && (
                    <div className="top-1/2 left-40 z-20 flex gap-4 border-1 bg-zinc-700/30 p-2 max-sm:h-16 md:absolute md:-translate-y-1/2 md:bg-zinc-700/50">
                        {raidHubUser?.badges
                            ?.slice(0, 5)
                            .map(badge => <ProfileBadge key={badge.id} {...badge} size={24} />)}
                    </div>
                )}
            </CardHeader>

            <div className="flex w-full flex-col flex-wrap gap-x-6 gap-y-4 p-3 md:flex-row md:items-center">
                {/* Profile Picture */}
                <div className="flex gap-4">
                    <Avatar className="size-20 border-1 md:-mt-16 md:size-28">
                        <AvatarImage src={icon} alt="profile picture" className="object-cover" />
                    </Avatar>

                    {/* Name and clan */}
                    <div className="flex flex-col items-start gap-1 p-1">
                        <h1 className="flex items-center gap-2 text-2xl">
                            {isPrivate && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <PrivacyLockIcon className="text-raidhub" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        The owner of this profile has chosen to keep their activity
                                        history private.
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            <span>
                                {displayName}
                                {displayNameCode && (
                                    <span className="text-secondary font-normal">
                                        #{displayNameCode}
                                    </span>
                                )}
                            </span>
                        </h1>
                        {clan && (
                            <div className="m-0.5 text-lg">
                                <Link href={`/clan/${clan.groupId}`} className="text-secondary">
                                    {clanTitle}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <UserRanks />
                <div className="space-y-4">
                    <CommunityProfiles />
                    <UserCardSocials />
                </div>
            </div>
        </Card>
    )
}
