"use client"

import type { GroupResponse } from "bungie-net-core/models"
import { type GroupMember } from "bungie-net-core/models"
import { useMemo } from "react"
import { ClanMember, type ClanMemberProps } from "~/app/clan/ClanMember"
import { StatBox } from "~/app/clan/StatBox"
import { ClanBannerComponent } from "~/components/ClanBanner"
import { ErrorCard } from "~/components/ErrorCard"
import { Flex } from "~/components/layout/Flex"
import { useLocale } from "~/components/providers/LocaleManager"
import { MobileDesktopSwitch } from "~/components/util/MobileDesktopSwitch"
import { useLocalStorage } from "~/hooks/util/useLocalStorage"
import { useClan, useMembersOfGroup } from "~/services/bungie/hooks"
import { type RaidHubClanMemberStats, type RaidHubPlayerInfo } from "~/services/raidhub/types"
import { useClanStats } from "~/services/raidhub/useClanStats"
import { fixClanName } from "~/util/destiny/fixClanName"
import { decodeHtmlEntities, formattedNumber, secondsToYDHMS } from "~/util/presentation/formatting"
import { urlHighlight } from "~/util/presentation/urlHighlight"
import styles from "./clan.module.css"

/**
 * @deprecated
 */
export function ClanComponent(props: { groupId: string; clan: GroupResponse | null }) {
    const { locale } = useLocale()
    const {
        data: clan,
        isLoading,
        isError,
        error
    } = useClan(
        { groupId: props.groupId },
        {
            staleTime: 5 * 60000,
            initialData: props.clan ?? undefined
        }
    )
    const clanStatsQuery = useClanStats(props.groupId, {
        staleTime: 5 * 60000,
        refetchOnWindowFocus: true
    })
    const clanMembersQueries = useMembersOfGroup(
        { groupId: props.groupId, pages: 2 },
        {
            select: result => result.results
        }
    )
    const allClanMembers = clanMembersQueries.flatMap(q => q.data ?? [])
    const clanBannerMembersError = clanMembersQueries.find(q => q.isError)?.error ?? null
    const isLoadingClanMembers =
        clanMembersQueries.some(q => q.isLoading) || clanStatsQuery.isLoading

    const [sortKey, setSortKey] = useLocalStorage<ClanMemberProps["statKey"]>(
        "clan-page-sort-key",
        "lastSeen"
    )

    const sortFn = useMemo<
        <
            T extends {
                bungie: GroupMember
                raidhub: RaidHubPlayerInfo | null
                stats: RaidHubClanMemberStats | null
            }
        >(
            a: T,
            b: T
        ) => number
    >(() => {
        switch (sortKey) {
            case "joinDate":
                return (m1, m2) =>
                    new Date(m1.bungie.joinDate).getTime() - new Date(m2.bungie.joinDate).getTime()
            case "lastSeen":
                return (m1, m2) =>
                    +m1.bungie.isOnline ^ +m2.bungie.isOnline
                        ? m1.bungie.isOnline
                            ? -1
                            : 1
                        : new Date(m2.raidhub?.lastSeen ?? 0).getTime() -
                          new Date(m1.raidhub?.lastSeen ?? 0).getTime()

            default:
                return (m1, m2) => (m2.stats?.[sortKey] ?? 0) - (m1.stats?.[sortKey] ?? 0)
        }
    }, [sortKey])

    const clanMembersWithStats = useMemo(() => {
        return allClanMembers
            .map(member => {
                const raidhubInfo = clanStatsQuery.data?.members.find(
                    mem =>
                        mem.playerInfo &&
                        mem.playerInfo.membershipId === member.destinyUserInfo.membershipId
                )
                return {
                    bungie: member,
                    raidhub: raidhubInfo?.playerInfo ?? null,
                    stats: raidhubInfo?.stats ?? null
                }
            })
            .sort(sortFn)
    }, [allClanMembers, clanStatsQuery.data?.members, sortFn])

    const clanName = useMemo(() => decodeHtmlEntities(fixClanName(clan?.detail.name ?? "")), [clan])
    const clanCallsign = useMemo(
        () => decodeHtmlEntities(fixClanName(clan?.detail.clanInfo.clanCallsign ?? "")),
        [clan]
    )
    const clanMotto = useMemo(
        () => decodeHtmlEntities(fixClanName(clan?.detail.motto ?? "")),
        [clan]
    )

    if (isLoading) return null

    if (isError) {
        return <ErrorCard>{String(error)}</ErrorCard>
    }

    const aggStats = clanStatsQuery.data?.aggregateStats.stats
    const clanLevelProgression = clan?.detail.clanInfo.d2ClanProgressions[584850370]

    return (
        <div>
            <div className={styles["name-and-motto"]}>
                <h1 className={styles.name}>
                    {clanName} <span className={styles["call-sign"]}>{`[${clanCallsign}]`}</span>
                </h1>
                <h3 className={styles.motto}>
                    <i>{clanMotto}</i>
                </h3>
            </div>
            <section className={styles.overview}>
                <MobileDesktopSwitch
                    lg={
                        <div className={styles["overview-left"]}>
                            <ClanBannerComponent
                                id={"lg" + clan.detail.groupId}
                                data={clan.detail.clanInfo.clanBannerData}
                                sx={20}
                            />
                        </div>
                    }
                    sm={<></>}
                />
                <div className={styles.about}>
                    <Flex $align="flex-start" $crossAxis="stretch" $padding={0} $wrap>
                        {aggStats && (
                            <>
                                <StatBox
                                    label="WFR Score"
                                    primaryValue={formattedNumber(
                                        aggStats.weightedContestScore,
                                        locale,
                                        3
                                    )}
                                    secondaryValue={formattedNumber(
                                        aggStats.totalContestScore,
                                        locale,
                                        3
                                    )}
                                    aggLabel="Total"
                                />
                                <StatBox
                                    label="Full Clears"
                                    primaryValue={formattedNumber(aggStats.freshClears, locale, 0)}
                                    secondaryValue={formattedNumber(
                                        aggStats.averageFreshClears,
                                        locale,
                                        0
                                    )}
                                    aggLabel="Avg"
                                />
                                <StatBox
                                    label="Clears"
                                    primaryValue={formattedNumber(aggStats.clears, locale, 0)}
                                    secondaryValue={formattedNumber(
                                        aggStats.averageClears,
                                        locale,
                                        0
                                    )}
                                    aggLabel="Avg"
                                />
                                <StatBox
                                    label="Sherpas"
                                    primaryValue={formattedNumber(aggStats.sherpas, locale, 0)}
                                    secondaryValue={formattedNumber(
                                        aggStats.averageSherpas,
                                        locale,
                                        0
                                    )}
                                    aggLabel="Avg"
                                />
                                <StatBox
                                    label="Time in Raids"
                                    primaryValue={secondsToYDHMS(aggStats.timePlayedSeconds, 3)}
                                    secondaryValue={secondsToYDHMS(
                                        aggStats.averageTimePlayedSeconds,
                                        2
                                    )}
                                    aggLabel="Avg"
                                />
                            </>
                        )}
                        <StatBox
                            label="Founded"
                            primaryValue={new Date(clan.detail.creationDate).toLocaleDateString(
                                locale
                            )}
                            secondaryValue={`${Math.floor(
                                (Date.now() - new Date(clan.detail.creationDate).getTime()) /
                                    86400000
                            )} days`}
                            aggLabel="Age"
                        />
                        {clanLevelProgression && (
                            <StatBox
                                label="Clan Level"
                                primaryValue={formattedNumber(
                                    clanLevelProgression.level,
                                    locale,
                                    0
                                )}
                                secondaryValue={
                                    clanLevelProgression.level !== clanLevelProgression.levelCap
                                        ? formattedNumber(
                                              (100 * clanLevelProgression.progressToNextLevel) /
                                                  clanLevelProgression.nextLevelAt,
                                              locale,
                                              2
                                          ) + "%"
                                        : undefined
                                }
                                aggLabel={
                                    clanLevelProgression.level === clanLevelProgression.levelCap
                                        ? "Max"
                                        : "To next"
                                }
                            />
                        )}
                    </Flex>
                    <p>{urlHighlight(clan.detail.about)}</p>
                </div>
            </section>

            {!isLoadingClanMembers && (
                <section>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            flexWrap: "wrap",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "1rem",
                            margin: "1rem 0"
                        }}>
                        <h2
                            key={"title"}
                            style={{
                                margin: 0
                            }}>
                            Members (
                            {isLoadingClanMembers || clanBannerMembersError
                                ? "?"
                                : allClanMembers.length}{" "}
                            / 100)
                        </h2>
                        <Flex $padding={0} $gap={0.75}>
                            {"Sort by"}
                            <select
                                value={sortKey}
                                onChange={e => {
                                    setSortKey(e.target.value as ClanMemberProps["statKey"])
                                }}>
                                <option value="lastSeen">Last Seen</option>
                                <option value="joinDate">Join Date</option>
                                <option value="contestScore">WFR Score</option>
                                <option value="freshClears">Full Clears</option>
                                <option value="clears">Clears</option>
                                <option value="sherpas">Sherpas</option>
                                <option value="totalTimePlayedSeconds">In Raid Time</option>
                            </select>
                        </Flex>
                    </div>
                    {clanBannerMembersError && (
                        <ErrorCard>{clanBannerMembersError.message}</ErrorCard>
                    )}
                    <div className={styles.members}>
                        {clanMembersWithStats.map(member => (
                            <ClanMember
                                key={member.bungie.destinyUserInfo.membershipId}
                                statKey={sortKey}
                                {...member}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
