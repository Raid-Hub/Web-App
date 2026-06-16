"use client"

import { useQueries } from "@tanstack/react-query"
import type {
    BungieMembershipType,
    DestinyCharacterActivitiesComponent,
    DestinyProfileTransitoryPartyMember
} from "bungie-net-core/models"
import Image from "next/image"
import Link from "next/link"
import { useMemo } from "react"
import { usePageProps } from "~/components/PageWrapper"
import { Container } from "~/components/__deprecated__/layout/Container"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { Grid } from "~/components/__deprecated__/layout/Grid"
import { H4 } from "~/components/__deprecated__/typography/H4"
import { useActivityDefinition, useActivityModeDefinition, useItemDefinition } from "~/hooks/dexie"
import { useTimer } from "~/hooks/util/useTimer"
import type { ProfileProps } from "~/lib/profile/types"
import { useProfileLiveData, useProfileTransitory } from "~/services/bungie/hooks"
import { getRaidHubApi } from "~/services/raidhub/common"
import { type RaidHubPlayerInfo } from "~/services/raidhub/types"
import { Card } from "~/shad/card"
import { bungieEmblemUrl, bungiePgcrImageUrl, bungieProfileIconUrl } from "~/util/destiny"
import { getBungieDisplayName } from "~/util/destiny/getBungieDisplayName"
import { Latest } from "./Latest"

const commonTransitoryQuerySettings = {
    refetchInterval: 45000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true
}

const defaultCharacterActivity: DestinyCharacterActivitiesComponent = {
    currentActivityHash: 0,
    currentActivityModeHash: 0,
    lastCompletedStoryHash: 0,
    dateActivityStarted: "1970-01-01T00:00:00Z",
    currentActivityModeHashes: [],
    currentActivityModeTypes: [],
    availableActivities: []
}

export const CurrentActivity = () => {
    const { destinyMembershipId, destinyMembershipType } = usePageProps<ProfileProps>()

    const { data: profileTransitoryData } = useProfileTransitory(
        { destinyMembershipId, membershipType: destinyMembershipType },
        {
            select: data => data?.profileTransitoryData.data,
            suspense: true,
            ...commonTransitoryQuerySettings
        }
    )

    if (!profileTransitoryData?.currentActivity?.startTime) {
        return null
    }

    return (
        <CurrentActivityLive
            destinyMembershipId={destinyMembershipId}
            destinyMembershipType={destinyMembershipType}
            startTime={new Date(profileTransitoryData.currentActivity.startTime)}
            partyMembers={profileTransitoryData.partyMembers}
        />
    )
}

const CurrentActivityLive = (props: {
    destinyMembershipId: string
    destinyMembershipType: BungieMembershipType
    startTime: Date
    partyMembers: DestinyProfileTransitoryPartyMember[]
}) => {
    const { data: characterActivity } = useProfileLiveData(
        {
            destinyMembershipId: props.destinyMembershipId,
            membershipType: props.destinyMembershipType
        },
        {
            suspense: true,
            select: data =>
                Object.values(data.characterActivities.data ?? {}).sort((a, b) =>
                    new Date(b.dateActivityStarted) < new Date(a.dateActivityStarted) ? -1 : 1
                )[0] ?? defaultCharacterActivity,
            ...commonTransitoryQuerySettings
        }
    )

    if (!characterActivity) {
        return null
    }

    return (
        <CurrentActivityCard
            characterActivity={characterActivity}
            startTime={props.startTime}
            partyMembers={props.partyMembers}
        />
    )
}

const CurrentActivityCard = (props: {
    characterActivity: DestinyCharacterActivitiesComponent
    startTime: Date
    partyMembers: DestinyProfileTransitoryPartyMember[]
}) => {
    const elapsedTime = useTimer({
        since: props.startTime
    })
    const activity = useActivityDefinition(props.characterActivity.currentActivityHash)
    const activityMode = useActivityModeDefinition(props.characterActivity.currentActivityModeHash)

    const activityName = useMemo(() => {
        const activityName = activity?.displayProperties.name
        const activityModeName = activityMode?.displayProperties.name
        if (activity?.hash === 82913930) {
            return "Orbit"
        } else if (activityName && activityModeName) {
            return activityModeName + ": " + activityName
        } else if (activityName) {
            return activityName
        } else {
            return null
        }
    }, [activity, activityMode])

    const partyMemberIds = useMemo(
        () => props.partyMembers.map(pm => pm.membershipId),
        [props.partyMembers]
    )

    const resolvedPlayers = useQueries({
        queries: partyMemberIds.map(membershipId => ({
            queryKey: ["raidhub", "player", "basic", membershipId] as const,
            queryFn: () =>
                getRaidHubApi("/player/{membershipId}/basic", { membershipId }, null).then(
                    res => res.response
                ),
            staleTime: 1000 * 60 * 60
        }))
    })

    const resolvedById = useMemo(() => {
        const map = new Map<string, RaidHubPlayerInfo>()
        partyMemberIds.forEach((membershipId, index) => {
            const player = resolvedPlayers[index]?.data
            if (player) {
                map.set(membershipId, player)
            }
        })
        return map
    }, [partyMemberIds, resolvedPlayers])

    return (
        <Latest $playerCount={props.partyMembers.length}>
            <Card className="h-full overflow-hidden">
                <Container $minHeight={80}>
                    <Image
                        src={bungiePgcrImageUrl(activity?.pgcrImage)}
                        unoptimized
                        fill
                        priority
                        alt="pgcr background image"
                        style={{ objectFit: "cover" }}
                    />
                </Container>
                <Flex $direction="column" $crossAxis="flex-start" $gap={0.25}>
                    <Link
                        target="_blank"
                        href={`https://guardian.report?${new URLSearchParams({
                            view: "LOADOUT",
                            guardians: props.partyMembers.map(pm => pm.membershipId).join(","),
                            referrer: "raidhub"
                        }).toString()}`}>
                        <H4 $mBlock={0.25}>
                            <Flex $padding={0}>
                                {"In Game"}
                                <svg width={8} height={8}>
                                    <circle r={3} fill="red" cx="50%" cy="50%" />
                                </svg>
                                {formatElapsedTime(elapsedTime)}
                            </Flex>
                        </H4>
                    </Link>
                    {activityName}
                    <Grid style={{ marginTop: "1.5em", minWidth: "100%" }}>
                        {props.partyMembers.map(pm => (
                            <PartyMember
                                key={pm.membershipId}
                                partyMember={pm}
                                resolvedPlayer={resolvedById.get(pm.membershipId)}
                            />
                        ))}
                    </Grid>
                </Flex>
            </Card>
        </Latest>
    )
}

const PartyMember = ({
    partyMember,
    resolvedPlayer
}: {
    partyMember: DestinyProfileTransitoryPartyMember
    resolvedPlayer?: RaidHubPlayerInfo
}) => {
    const emblem = useItemDefinition(partyMember.emblemHash)
    const displayName = resolvedPlayer
        ? getBungieDisplayName(resolvedPlayer)
        : partyMember.displayName?.trim() || partyMember.membershipId
    const iconSrc = resolvedPlayer
        ? bungieProfileIconUrl(resolvedPlayer.iconPath)
        : bungieEmblemUrl(emblem)

    return (
        <Container>
            <Link href={`/profile/${partyMember.membershipId}`} style={{ color: "unset" }}>
                <Flex $padding={0} $align="flex-start">
                    <Image src={iconSrc} unoptimized width={32} height={32} alt={displayName} />
                    <span>{displayName}</span>
                </Flex>
            </Link>
        </Container>
    )
}

function formatElapsedTime(ms: number) {
    const hours = String(Math.floor(ms / 3600_000))
    const minutes = String(Math.floor((ms % 3600_000) / 60_000))
    const remainingSeconds = String(Math.floor((ms / 1000) % 60))

    const formattedTime = `${hours.padStart(2, "0")}:${minutes.padStart(
        2,
        "0"
    )}:${remainingSeconds.padStart(2, "0")}`

    return formattedTime
}
