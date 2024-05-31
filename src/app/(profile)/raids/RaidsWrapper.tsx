"use client"

import { Collection } from "@discordjs/collection"
import { useMemo } from "react"
import styled from "styled-components"
import { type ProfileProps } from "~/app/(profile)/types"
import { useRaidHubManifest } from "~/app/layout/managers/RaidHubManifestManager"
import { TabSelector } from "~/components/TabSelector"
import RaidCard from "~/components/__deprecated__/profile/raids/RaidCard"
import { Grid } from "~/components/layout/Grid"
import { usePageProps } from "~/components/layout/PageWrapper"
import { H4 } from "~/components/typography/H4"
import { useLocalStorage } from "~/hooks/util/useLocalStorage"
import { useQueryParams } from "~/hooks/util/useQueryParams"
import { useLinkedProfiles } from "~/services/bungie/hooks"
import { useRaidHubActivities, useRaidHubPlayers } from "~/services/raidhub/hooks"
import {
    type RaidHubInstanceForPlayer,
    type RaidHubWorldFirstEntry
} from "~/services/raidhub/types"
import { ActivityHistoryLayout } from "./ActivityHistoryLayout"
import { FilterContextProvider } from "./FilterContext"
import { PantheonLayout } from "./PantheonLayout"
import { RaidCardContext } from "./RaidCardContext"
import { Teammates } from "./Teammates"

type TabTitle = "classic" | "pantheon" | "history" | "teammates"

export const RaidsWrapper = () => {
    const { destinyMembershipId, destinyMembershipType, ready } = usePageProps<ProfileProps>()

    const { data: membershipsData, isFetched: areMembershipsFetched } = useLinkedProfiles({
        membershipId: destinyMembershipId
    })

    const destinyMemberships = useMemo(
        () =>
            membershipsData?.profiles.map(p => ({
                destinyMembershipId: p.membershipId,
                membershipType: p.membershipType
            })) ?? [
                // Fallback to the only current profile if the linked profiles are not yet fetched
                {
                    destinyMembershipId: destinyMembershipId,
                    membershipType: destinyMembershipType
                }
            ],
        [membershipsData, destinyMembershipId, destinyMembershipType]
    )

    // Memoize the membership IDs for the players queries, otherwise the queries will re-render
    // every time the component re-renders
    const membershipIds = useMemo(
        () => destinyMemberships?.map(dm => dm.destinyMembershipId) ?? [],
        [destinyMemberships]
    )

    const { players, isLoading: isLoadingPlayers } = useRaidHubPlayers(membershipIds, {
        enabled: ready
    })

    const { activities, isLoading: isLoadingActivities } = useRaidHubActivities(membershipIds)

    const { listedRaids, pantheonIds } = useRaidHubManifest()

    const leaderboardEntriesByRaid = useMemo(() => {
        if (isLoadingPlayers || !areMembershipsFetched) return null

        const raidToData = new Collection<number, RaidHubWorldFirstEntry | null>(
            listedRaids.map(raid => [raid, null])
        )

        players.forEach(p => {
            Object.entries(p.worldFirstEntries).forEach(([activityId, entry]) => {
                if (!entry) return
                const curr = raidToData.get(Number(activityId))
                if (!curr || entry.timeAfterLaunch < curr.timeAfterLaunch)
                    raidToData.set(Number(activityId), entry)
            })
        })

        return raidToData
    }, [isLoadingPlayers, areMembershipsFetched, listedRaids, players])

    const activitiesByRaid = useMemo(() => {
        if (isLoadingActivities) return null

        const coll = new Collection<number, Collection<string, RaidHubInstanceForPlayer>>()
        activities.forEach(a => {
            if (!coll.has(a.activityId)) coll.set(a.activityId, new Collection())
            coll.get(a.activityId)!.set(a.instanceId, a)
        })
        return coll.each(group =>
            group.sort((a, b) => (new Date(a.dateCompleted) < new Date(b.dateCompleted) ? -1 : -1))
        )
    }, [activities, isLoadingActivities])

    const queryParams = useQueryParams<{
        raid: string
        tab: TabTitle
    }>()

    const [tabLocal, setTabLocal] = useLocalStorage<TabTitle>("player-profile-tab", "classic")

    const [clearExpandedRaid, setExpandedRaid] = useMemo(
        () => [
            () => queryParams.remove("raid"),
            (raidId: number) => queryParams.set("raid", String(raidId))
        ],
        [queryParams]
    )

    const [getTab, setTab] = useMemo(
        () => [
            () => queryParams.get("tab") ?? tabLocal,
            (tab: TabTitle) => {
                setTabLocal(tab)
                queryParams.set("tab", tab)
            }
        ],
        [tabLocal, setTabLocal, queryParams]
    )

    const TabView = useMemo(() => {
        const expandedRaid = Number(queryParams.get("raid"))
        const tab = getTab()

        switch (tab) {
            case "classic":
                return (
                    <Grid
                        as="section"
                        $minCardWidth={325}
                        $minCardWidthMobile={300}
                        $fullWidth
                        $relative>
                        {listedRaids.map(raidId => (
                            <RaidCardContext
                                key={raidId}
                                activities={activitiesByRaid?.get(raidId)}
                                isLoadingActivities={isLoadingActivities || !areMembershipsFetched}
                                raidId={raidId}>
                                <RaidCard
                                    leaderboardEntry={leaderboardEntriesByRaid?.get(raidId) ?? null}
                                    canExpand
                                    expand={() => setExpandedRaid(raidId)}
                                    closeExpand={clearExpandedRaid}
                                    isExpanded={raidId === expandedRaid}
                                />
                            </RaidCardContext>
                        ))}
                    </Grid>
                )
            case "pantheon":
                return (
                    <PantheonLayout
                        instances={pantheonIds.map(
                            id => activitiesByRaid?.get(id) ?? new Collection()
                        )}
                        isLoading={isLoadingActivities || !areMembershipsFetched}
                    />
                )
            case "history":
                return (
                    <ActivityHistoryLayout
                        activities={activities}
                        isLoading={isLoadingActivities}
                    />
                )
            case "teammates":
                return <Teammates />
            default:
                return null
        }
    }, [
        queryParams,
        getTab,
        listedRaids,
        pantheonIds,
        isLoadingActivities,
        areMembershipsFetched,
        activities,
        activitiesByRaid,
        leaderboardEntriesByRaid,
        clearExpandedRaid,
        setExpandedRaid
    ])

    return (
        <FilterContextProvider>
            <TabSelector>
                <Tab aria-selected={getTab() === "classic"} onClick={() => setTab("classic")}>
                    Classic
                </Tab>
                <Tab aria-selected={getTab() === "history"} onClick={() => setTab("history")}>
                    History
                </Tab>
                <Tab aria-selected={getTab() === "teammates"} onClick={() => setTab("teammates")}>
                    Teammates
                </Tab>
                <Tab aria-selected={getTab() === "pantheon"} onClick={() => setTab("pantheon")}>
                    Pantheon
                </Tab>
            </TabSelector>
            {TabView}
        </FilterContextProvider>
    )
}

const Tab = styled(H4)`
    padding: 0.5rem;
`

Tab.defaultProps = {
    $mBlock: 0.2
}
