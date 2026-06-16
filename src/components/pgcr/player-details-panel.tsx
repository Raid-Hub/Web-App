"use client"

import { Collection } from "@discordjs/collection"
import { CheckCircle, LinkIcon, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { useItemDefinition } from "~/hooks/dexie"
import { usePGCRContext } from "~/hooks/pgcr/ClientStateManager"
import { useGetCharacterClass } from "~/hooks/pgcr/useCharacterClass"
import {
    formatKdRelativeToAveragePercentage,
    formatTeamSharePercentage,
    getActivityParticipationPercentage
} from "~/lib/pgcr/formatting"
import { cn } from "~/lib/tw"
import { type RaidHubInstancePlayerExtended } from "~/services/raidhub/types"
import { Avatar, AvatarFallback, AvatarImage } from "~/shad/avatar"
import { Button } from "~/shad/button"
import { bungieBannerEmblemUrl, bungieIconUrl, getBungieDisplayName } from "~/util/destiny"
import { round } from "~/util/math"
import { secondsToHMS } from "~/util/presentation/formatting"
import { WeaponTable } from "./pgcr-weapons"
import { PlayerBadge } from "./player-badge"

interface PlayerDetailsPanelProps {
    player: RaidHubInstancePlayerExtended
    onClose: () => void
}

type StatCell = {
    label: string
    value: string
    detail?: string
    tooltip?: string
}

const StatStrip = ({ stats }: { stats: StatCell[] }) => (
    <div
        className="grid divide-x divide-zinc-800 border-b border-zinc-800"
        style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}>
        {stats.map(stat => {
            const cell = (
                <div className="px-2.5 py-3 text-center md:px-3">
                    <div className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
                        {stat.label}
                    </div>
                    <div className="text-primary/90 mt-1 text-sm font-semibold tabular-nums md:text-base">
                        {stat.value}
                    </div>
                    {stat.detail && (
                        <div className="mt-0.5 text-[10px] text-zinc-500 tabular-nums">
                            {stat.detail}
                        </div>
                    )}
                </div>
            )

            if (!stat.tooltip) {
                return <div key={stat.label}>{cell}</div>
            }

            return (
                <div key={stat.label} title={stat.tooltip}>
                    {cell}
                </div>
            )
        })}
    </div>
)

export const PlayerDetailsPanelWrapper = () => {
    const {
        data,
        query: { validatedSearchParams, tx }
    } = usePGCRContext()
    const selectedPlayer = validatedSearchParams.get("player")
    const selectedPlayerData =
        data.players.find(player => player.playerInfo.membershipId === selectedPlayer) ??
        data.players[0]

    const exitPlayerPanel = () => {
        tx(({ remove }) => {
            remove("character")
            remove("player")
        })
    }

    return (
        <div
            className={cn(
                "fixed inset-0 top-auto bottom-0 z-50 bg-black/80 transition-opacity duration-200 lg:top-0 lg:flex lg:items-center lg:justify-center",
                selectedPlayer ? "opacity-100" : "pointer-events-none opacity-0"
            )}>
            <div className="relative mx-auto max-h-[88vh] w-full overflow-hidden rounded-t-xl border border-zinc-800 bg-zinc-950 lg:max-h-[80vh] lg:max-w-2xl lg:rounded-xl">
                <PlayerDetailsPanel player={selectedPlayerData} onClose={() => exitPlayerPanel()} />
            </div>
        </div>
    )
}

const PlayerDetailsPanel = ({ player, onClose }: PlayerDetailsPanelProps) => {
    const {
        data,
        mvp,
        playerStatsMerged,
        weaponsMap,
        scores,
        query: { validatedSearchParams, get, set, tx, remove }
    } = usePGCRContext()

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            const playerParam = get("player")
            if (e.key === "Escape" && playerParam) {
                tx(({ remove }) => {
                    remove("player")
                    remove("character")
                })
            }
        }

        window.addEventListener("keydown", handleEscape)
        return () => window.removeEventListener("keydown", handleEscape)
    }, [get, tx])

    const selectedCharacter = validatedSearchParams.get("character")
    const activeCharacter = selectedCharacter
        ? player.characters.find(c => c.characterId === selectedCharacter)
        : null
    const selectedStats = activeCharacter ?? playerStatsMerged.get(player.playerInfo.membershipId)!

    const teamTotals = useMemo(() => {
        const totals = {
            kills: 0,
            deaths: 0,
            assists: 0,
            meleeKills: 0,
            grenadeKills: 0,
            superKills: 0,
            precisionKills: 0
        }

        playerStatsMerged.forEach(stats => {
            totals.kills += stats.kills
            totals.deaths += stats.deaths
            totals.assists += stats.assists
            totals.meleeKills += stats.meleeKills
            totals.grenadeKills += stats.grenadeKills
            totals.superKills += stats.superKills
            totals.precisionKills += stats.precisionKills
        })

        return {
            ...totals,
            kd: totals.kills / Math.max(totals.deaths, 1)
        }
    }, [playerStatsMerged])

    const activityPercentage = getActivityParticipationPercentage(
        selectedStats.timePlayedSeconds,
        data.duration
    )
    const timePlayed = Math.min(selectedStats.timePlayedSeconds, data.duration)
    const kdRatio = round(selectedStats.kills / Math.max(selectedStats.deaths, 1), 2)
    const riisScore = scores.get(player.playerInfo.membershipId)?.score
    const killSharePct =
        teamTotals.kills > 0
            ? (((selectedStats.kills + selectedStats.assists) / teamTotals.kills) * 100).toFixed(1)
            : null
    const precisionRate =
        selectedStats.kills > 0
            ? ((selectedStats.precisionKills / selectedStats.kills) * 100).toFixed(0)
            : null

    const bungieName = getBungieDisplayName(player.playerInfo).split("#")
    const displayName = bungieName[0]
    const bungieNumbers = bungieName[1] ?? ""
    const emblemDefinition = useItemDefinition(player.characters[0].emblemHash ?? 0)
    const getCharacterIcon = useGetCharacterClass()

    const primaryStats: StatCell[] = [
        {
            label: "Time",
            value: secondsToHMS(timePlayed, false),
            detail: activityPercentage != null ? `${activityPercentage}%` : undefined,
            tooltip:
                activityPercentage != null
                    ? `Present for ${activityPercentage}% of the activity`
                    : undefined
        },
        {
            label: "K/D",
            value: kdRatio.toLocaleString(),
            detail: formatKdRelativeToAveragePercentage(kdRatio, teamTotals.kd) ?? undefined
        },
        {
            label: "Kills",
            value: selectedStats.kills.toLocaleString(),
            detail: formatTeamSharePercentage(selectedStats.kills, teamTotals.kills) ?? undefined
        },
        {
            label: "Deaths",
            value: selectedStats.deaths.toLocaleString(),
            detail: formatTeamSharePercentage(selectedStats.deaths, teamTotals.deaths) ?? undefined
        },
        {
            label: "Assists",
            value: selectedStats.assists.toLocaleString(),
            detail:
                formatTeamSharePercentage(selectedStats.assists, teamTotals.assists) ?? undefined
        },
        {
            label: "RIIS",
            value: riisScore?.toFixed(1) ?? "0.0",
            tooltip:
                "RaidHub Individual Impact Score — composite performance metric based on kills, deaths, assists, and time played."
        }
    ]

    const secondaryStats: StatCell[] = [
        {
            label: "Kill Share",
            value: killSharePct != null ? `${killSharePct}%` : "—",
            tooltip: "(Kills + assists) / team kills"
        },
        {
            label: "Precision",
            value: precisionRate != null ? `${precisionRate}%` : "—",
            detail:
                selectedStats.precisionKills > 0
                    ? `${selectedStats.precisionKills.toLocaleString()} pk`
                    : undefined
        },
        {
            label: "Melee Kills",
            value: selectedStats.meleeKills.toLocaleString(),
            detail:
                formatTeamSharePercentage(selectedStats.meleeKills, teamTotals.meleeKills) ??
                undefined
        },
        {
            label: "Grenade Kills",
            value: selectedStats.grenadeKills.toLocaleString(),
            detail:
                formatTeamSharePercentage(selectedStats.grenadeKills, teamTotals.grenadeKills) ??
                undefined
        },
        {
            label: "Super Kills",
            value: selectedStats.superKills.toLocaleString(),
            detail:
                formatTeamSharePercentage(selectedStats.superKills, teamTotals.superKills) ??
                undefined
        }
    ]

    const { kineticWeapons, energyWeapons, powerWeapons } = useMemo(() => {
        const weaponStats = new Collection<
            number,
            {
                kills: number
                precisionKills: number
                users: Set<string>
            }
        >()

        const characters = activeCharacter ? [activeCharacter] : player.characters
        characters.forEach(character => {
            character.weapons.forEach(weapon => {
                const prev = weaponStats.get(weapon.weaponHash)
                weaponStats.set(weapon.weaponHash, {
                    kills: (prev?.kills ?? 0) + weapon.kills,
                    precisionKills: (prev?.precisionKills ?? 0) + weapon.precisionKills,
                    users: new Set([player.playerInfo.membershipId])
                })
            })
        })

        weaponStats.sort((a, b) => b.kills - a.kills)

        const byBucket = (bucketHash: number) =>
            weaponStats.filter(
                (_, key) => weaponsMap.get(key)?.inventory?.bucketTypeHash === bucketHash
            )

        return {
            kineticWeapons: byBucket(1498876634),
            energyWeapons: byBucket(2465295065),
            powerWeapons: byBucket(953998645)
        }
    }, [activeCharacter, player, weaponsMap])

    return (
        <div className="flex max-h-[88vh] flex-col lg:max-h-[80vh]">
            <div className="relative shrink-0 overflow-hidden border-b border-zinc-800">
                {emblemDefinition && (
                    <div
                        className="absolute inset-0 bg-[left_10%_center] opacity-15"
                        style={{
                            backgroundImage: `url(${bungieBannerEmblemUrl(emblemDefinition)})`
                        }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/95 to-zinc-950/80" />
                <div className="relative z-10 flex items-start gap-3 p-4 md:gap-4">
                    <Avatar className="size-10 shrink-0 rounded-sm border border-zinc-800">
                        <AvatarImage
                            src={bungieIconUrl(emblemDefinition?.displayProperties.icon)}
                            alt={displayName}
                        />
                        <AvatarFallback className="rounded-sm bg-zinc-800 text-xs">
                            {displayName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <h2 className="truncate text-base font-bold text-white md:text-lg">
                                {displayName}
                                {bungieNumbers && (
                                    <span className="text-sm font-normal text-zinc-400">
                                        {` #${bungieNumbers}`}
                                    </span>
                                )}
                            </h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                title="View Profile"
                                className="size-6 shrink-0 rounded-full hover:bg-zinc-800"
                                asChild>
                                <Link href={`/profile/${player.playerInfo.membershipId}`}>
                                    <LinkIcon className="size-3.5" />
                                </Link>
                            </Button>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {mvp === player.playerInfo.membershipId && (
                                <PlayerBadge variant="mvp" />
                            )}
                            {player.sherpas > 0 && (
                                <PlayerBadge
                                    variant="sherpa"
                                    titleOverride={`Sherpa x${player.sherpas}`}
                                />
                            )}
                            {player.isFirstClear && <PlayerBadge variant="firstClear" />}
                            {!player.completed && <PlayerBadge variant="dnf" />}
                            {player.characters.length === 1 && (
                                <span className="text-[10px] text-zinc-500">
                                    {getCharacterIcon(player.characters[0].classHash)[1]}
                                </span>
                            )}
                        </div>
                        {player.characters.length > 1 && (
                            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                <Button
                                    variant={selectedCharacter === null ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 rounded-full px-2.5 text-[10px]"
                                    onClick={() => remove("character")}>
                                    All
                                </Button>
                                {player.characters
                                    .toSorted((c1, c2) => {
                                        if (!c1.completed !== c2.completed) {
                                            return c1.completed ? -1 : 1
                                        }
                                        if (c1.timePlayedSeconds !== c2.timePlayedSeconds) {
                                            return c2.timePlayedSeconds - c1.timePlayedSeconds
                                        }
                                        return c2.kills - c1.kills
                                    })
                                    .map(({ characterId, classHash, completed }) => {
                                        const [CharacterIcon, characterName] =
                                            getCharacterIcon(classHash)
                                        return (
                                            <Button
                                                key={characterId}
                                                variant={
                                                    selectedCharacter === characterId
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                className="h-8 gap-1 rounded-full px-2.5 text-[10px]"
                                                onClick={() => set("character", characterId)}>
                                                <CharacterIcon className="size-3.5" />
                                                <span className="hidden sm:inline">
                                                    {characterName}
                                                </span>
                                                {completed && (
                                                    <CheckCircle className="size-3 text-green-500" />
                                                )}
                                            </Button>
                                        )
                                    })}
                            </div>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0 rounded-full hover:bg-zinc-800"
                        onClick={onClose}>
                        <X className="size-5" />
                    </Button>
                </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 md:p-4">
                <div className="overflow-hidden rounded-lg border border-zinc-800">
                    <StatStrip stats={primaryStats} />
                    <StatStrip stats={secondaryStats} />
                </div>

                <WeaponTable
                    compact
                    kineticWeapons={kineticWeapons}
                    energyWeapons={energyWeapons}
                    powerWeapons={powerWeapons}
                    stats={selectedStats}
                    showUsers={false}
                />
            </div>
        </div>
    )
}
