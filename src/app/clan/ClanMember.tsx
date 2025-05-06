"use client"

import { type GroupMember, type RuntimeGroupMemberType } from "bungie-net-core/models"
import Image from "next/image"
import Link from "next/link"
import { useMemo } from "react"
import styled from "styled-components"
import { useLocale } from "~/app/layout/wrappers/LocaleManager"
import { Container } from "~/components/layout/Container"
import { type RaidHubClanMemberStats, type RaidHubPlayerInfo } from "~/services/raidhub/types"
import { bungieProfileIconUrl, getBungieDisplayName } from "~/util/destiny"
import { formattedNumber, formattedTimeSince, secondsToYDHMS } from "~/util/presentation/formatting"

export interface ClanMemberProps {
    bungie: GroupMember
    raidhub: RaidHubPlayerInfo | null
    stats: RaidHubClanMemberStats | null
    statKey: keyof RaidHubClanMemberStats | "joinDate" | "lastSeen"
}

export const ClanMember = ({ bungie, raidhub, stats, statKey }: ClanMemberProps) => {
    const { locale } = useLocale()
    const displayName = getBungieDisplayName(raidhub ?? bungie.destinyUserInfo)
    const statValue = useMemo(() => {
        switch (statKey) {
            case "joinDate":
                return new Date(bungie.joinDate).toLocaleDateString(locale, {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit"
                })
            case "lastSeen":
                return bungie.isOnline
                    ? "Now"
                    : raidhub?.lastSeen
                      ? formattedTimeSince(new Date(raidhub.lastSeen), locale)
                      : "Never"
            case "totalTimePlayedSeconds":
                return secondsToYDHMS(stats?.totalTimePlayedSeconds ?? 0, 3)
            default:
                return formattedNumber(stats?.[statKey] ?? 0, locale, 3)
        }
    }, [bungie.joinDate, bungie.isOnline, locale, raidhub?.lastSeen, statKey, stats])
    return (
        <Member
            href={`/profile/${bungie.destinyUserInfo.membershipId}`}
            style={
                displayName.length > 25
                    ? {
                          gridColumn: "span 2"
                      }
                    : {}
            }>
            <MemberIconContainer
                $aspectRatio={{
                    width: 1,
                    height: 1
                }}>
                <Image
                    src={bungieProfileIconUrl(
                        raidhub?.iconPath ??
                            bungie.destinyUserInfo?.iconPath ??
                            bungie.bungieNetUserInfo.iconPath
                    )}
                    alt="icon"
                    unoptimized
                    fill
                />
            </MemberIconContainer>
            <div>
                <div>{displayName}</div>
                <StatValue>{statValue}</StatValue>
            </div>
            {bungie.memberType > 2 && (
                <StarContainer $groupMemberType={bungie.memberType}>
                    <svg viewBox="0 0 1024 1024" height="1em" width="1em">
                        <path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 00.6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0046.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z" />
                    </svg>
                </StarContainer>
            )}
        </Member>
    )
}

const Member = styled(Link)`
    position: relative;
    min-width: var(--min);
    background-color: rgba(32, 32, 32, 0.281);

    display: grid;
    grid-template-columns: max-content 2fr;

    gap: 1em;
    align-items: center;
    text-align: start;

    color: white;

    transition: transform 0.15s ease-in-out;
    &:hover {
        transform: scale(1.03);
    }
`

const MemberIconContainer = styled(Container)`
    width: 50px;
`

const StatValue = styled.div`
    font-size: 0.8em;
    color: ${({ theme }) => theme.colors.text.secondary};
`

const StarContainer = styled.div<{
    $groupMemberType: RuntimeGroupMemberType
}>`
    position: absolute;
    top: 10px;
    right: 10px;

    svg {
        fill: ${({ $groupMemberType }) => ($groupMemberType === 5 ? "gold" : "silver")};
    }
`
