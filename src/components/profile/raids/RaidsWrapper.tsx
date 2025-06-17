"use client"

import { Collection } from "@discordjs/collection"
import { useCallback, useMemo } from "react"
import styled from "styled-components"
import { usePageProps } from "~/components/PageWrapper"
import { TabSelector } from "~/components/TabSelector"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { Grid } from "~/components/__deprecated__/layout/Grid"
import RaidCard from "~/components/__deprecated__/profile/raids/RaidCard"
import ToggleSwitch from "~/components/__deprecated__/reusable/ToggleSwitch"
import { H4 } from "~/components/__deprecated__/typography/H4"
import ReloadArrow from "~/components/icons/ReloadArrow"
import { ProfileError } from "~/components/profile/ProfileError"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { useLocalStorage } from "~/hooks/util/useLocalStorage"
import { useQueryParams } from "~/hooks/util/useQueryParams"
import { type ProfileProps } from "~/lib/profile/types"
import { useLinkedProfiles } from "~/services/bungie/hooks"
import { RaidHubError } from "~/services/raidhub/RaidHubError"
import { useRaidHubActivities, useRaidHubPlayers } from "~/services/raidhub/hooks"
import {
    type RaidHubInstanceForPlayer,
    type RaidHubWorldFirstEntry
} from "~/services/raidhub/types"
import { ActivityHistoryLayout } from "./ActivityHistoryLayout"
import { FilterContextProvider } from "./FilterContext"
import { FilterSelect } from "./FilterSelect"
import { PantheonLayout } from "./PantheonLayout"
import { RaidCardContext } from "./RaidCardContext"
import { Teammates } from "./Teammates"
import { InstanceFinder } from "./finder/InstanceFinder"

type TabTitle = "classic" | "pantheon" | "history" | "teammates" | "finder"

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

    const {
        players,
        refetch: refetchPlayers,
        isLoading: isLoadingPlayers,
        errors: playerErrors
    } = useRaidHubPlayers(membershipIds, {
        enabled: ready
    })

    const {
        activities,
        isLoading: isLoadingActivities,
        refresh: refreshActivities
    } = useRaidHubActivities(membershipIds)

    const { listedRaids, pantheonIds } = useRaidHubManifest()

    const leaderboardEntriesByRaid = useMemo(() => {
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
    }, [listedRaids, players])

    const activitiesByRaid = useMemo(() => {
        if (isLoadingActivities) return null

        const coll = new Collection<number, Collection<string, RaidHubInstanceForPlayer>>()
        activities.forEach(a => {
            if (!coll.has(a.activityId)) coll.set(a.activityId, new Collection())
            coll.get(a.activityId)!.set(a.instanceId, a)
        })
        return coll
    }, [activities, isLoadingActivities])

    const { validatedSearchParams, set } = useQueryParams<{
        tab: TabTitle
    }>()

    const [isExpanded, setIsExpanded] = useLocalStorage<boolean>("raid-cards-expanded", false)
    const [tabLocal, setTabLocal] = useLocalStorage<TabTitle>("player-profile-tab", "classic")

    const setTab = useCallback(
        (tab: TabTitle) => {
            setTabLocal(tab)
            set("tab", tab)
        },
        [setTabLocal, set]
    )

    const tab = validatedSearchParams.get("tab") ?? tabLocal

    const TabView = useMemo(() => {
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
                                    isExpanded={isExpanded}
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
                        isExpanded={isExpanded}
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
            case "finder":
                return <InstanceFinder />
            default:
                return null
        }
    }, [
        tab,
        listedRaids,
        pantheonIds,
        isLoadingActivities,
        areMembershipsFetched,
        activities,
        activitiesByRaid,
        leaderboardEntriesByRaid,
        isExpanded
    ])

    const isLoadingMainData = !ready || isLoadingPlayers || isLoadingActivities

    return (
        <FilterContextProvider>
            <ProfileError error={playerErrors.find(e => e instanceof RaidHubError)} />
            <Flex
                $direction="row"
                $padding={0}
                $align="space-between"
                $fullWidth
                $wrap
                style={{
                    maxWidth: "100%"
                }}>
                <TabSelector>
                    <Tab aria-selected={tab === "classic"} onClick={() => setTab("classic")}>
                        Classic
                    </Tab>
                    <Tab aria-selected={tab === "history"} onClick={() => setTab("history")}>
                        History
                    </Tab>
                    <Tab aria-selected={tab === "teammates"} onClick={() => setTab("teammates")}>
                        Teammates
                    </Tab>
                    <Tab aria-selected={tab === "finder"} onClick={() => setTab("finder")}>
                        Finder
                    </Tab>
                    <Tab aria-selected={tab === "pantheon"} onClick={() => setTab("pantheon")}>
                        Pantheon
                    </Tab>
                </TabSelector>
                <Flex $padding={0}>
                    {(tab === "classic" || tab === "pantheon") && (
                        <>
                            <Flex $padding={0.2} $gap={0.4} $direction="column">
                                <H4
                                    style={{
                                        margin: 0,
                                        fontSize: "0.75rem"
                                    }}>
                                    Filter
                                </H4>
                                <FilterSelect />
                            </Flex>
                            <Flex $padding={0.2} $gap={0.4} $direction="column">
                                <H4
                                    style={{
                                        margin: 0,
                                        fontSize: "0.75rem"
                                    }}>
                                    Expanded
                                </H4>
                                <ToggleSwitch
                                    id="expand-cards"
                                    value={isExpanded}
                                    onToggle={setIsExpanded}
                                    size={20}
                                />
                            </Flex>
                        </>
                    )}
                    {tab !== "teammates" && (
                        <Flex $padding={0.2} $gap={0.4} $direction="column">
                            <H4
                                style={{
                                    margin: 0,
                                    fontSize: "0.75rem"
                                }}>
                                Refresh
                            </H4>
                            <ReloadArrow
                                onClick={() => {
                                    if (!isLoadingMainData) {
                                        refetchPlayers()
                                        refreshActivities()
                                    }
                                }}
                                sx={20}
                                color={isLoadingMainData ? "lightGray" : "white"}
                                hoverColor={isLoadingMainData ? undefined : "orange"}
                                cursor={isLoadingMainData ? "not-allowed" : "pointer"}
                            />
                        </Flex>
                    )}
                </Flex>
            </Flex>
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
