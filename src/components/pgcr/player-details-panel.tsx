"use client"

import { Collection } from "@discordjs/collection"
import { CheckCircle, LinkIcon, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { ActivityPieChart } from "~/components/pgcr/activity-pie-chart"
import { useItemDefinition } from "~/hooks/dexie"
import { usePGCRContext } from "~/hooks/pgcr/ClientStateManager"
import { useGetCharacterClass } from "~/hooks/pgcr/useCharacterClass"
import { cn } from "~/lib/tw"
import { type RaidHubInstancePlayerExtended } from "~/services/raidhub/types"
import { Avatar, AvatarFallback, AvatarImage } from "~/shad/avatar"
import { Button } from "~/shad/button"
import { Card, CardContent, CardHeader } from "~/shad/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/shad/tooltip"
import { bungieIconUrl, getBungieDisplayName } from "~/util/destiny"
import { round } from "~/util/math"
import { secondsToHMS } from "~/util/presentation/formatting"
import { WeaponTable } from "./pgcr-weapons"
import { PlayerBadge } from "./player-badge"
import { StatCard } from "./stat-card"

interface PlayerDetailsPanelProps {
    player: RaidHubInstancePlayerExtended
    onClose: () => void
}

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
                `fixed inset-0 top-auto bottom-0 z-50 bg-black/80 transition-opacity duration-200 lg:top-0 lg:flex lg:items-center lg:justify-center`,
                selectedPlayer ? "opacity-100" : "pointer-events-none opacity-0"
            )}>
            <div className="relative mx-auto max-h-[85vh] w-full overflow-y-auto rounded-lg border border-zinc-800 bg-black lg:max-h-[75vh] lg:max-w-4xl">
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
    // If no character is selected, show all data
    const activeCharacter = selectedCharacter
        ? player.characters.find(c => c.characterId === selectedCharacter)
        : null
    const activityPercentage = round(100 * (player.timePlayedSeconds / data.duration), 0)

    const selectedStats = activeCharacter ?? playerStatsMerged.get(player.playerInfo.membershipId)!

    const bungieName = getBungieDisplayName(player.playerInfo).split("#")
    const displayName = bungieName[0]
    const bungieNumbers = bungieName[1] ?? ""

    const emblemDefinition = useItemDefinition(player.characters[0].emblemHash ?? 0)

    const getCharacterIcon = useGetCharacterClass()

    const { kineticWeapons, energyWeapons, powerWeapons } = useMemo(() => {
        const weaponStats = new Collection<
            number,
            {
                kills: number
                precisionKills: number
                users: Set<string>
            }
        >()
        if (activeCharacter) {
            activeCharacter.weapons.forEach(weapon => {
                const prev = weaponStats.get(weapon.weaponHash)
                weaponStats.set(weapon.weaponHash, {
                    kills: (prev?.kills ?? 0) + weapon.kills,
                    precisionKills: (prev?.precisionKills ?? 0) + weapon.precisionKills,
                    users: new Set([player.playerInfo.membershipId])
                })
            })
        } else {
            player.characters.forEach(character => {
                character.weapons.forEach(weapon => {
                    const prev = weaponStats.get(weapon.weaponHash)
                    weaponStats.set(weapon.weaponHash, {
                        kills: (prev?.kills ?? 0) + weapon.kills,
                        precisionKills: (prev?.precisionKills ?? 0) + weapon.precisionKills,
                        users: new Set([player.playerInfo.membershipId])
                    })
                })
            })
        }

        weaponStats.sort((a, b) => b.kills - a.kills)

        const kineticWeapons = weaponStats.filter((_, key) => {
            const weapon = weaponsMap.get(key)
            return weapon?.inventory?.bucketTypeHash === 1498876634
        })
        const energyWeapons = weaponStats.filter((_, key) => {
            const weapon = weaponsMap.get(key)
            return weapon?.inventory?.bucketTypeHash === 2465295065
        })

        const powerWeapons = weaponStats.filter((_, key) => {
            const weapon = weaponsMap.get(key)
            return weapon?.inventory?.bucketTypeHash === 953998645
        })

        return {
            kineticWeapons,
            energyWeapons,
            powerWeapons
        }
    }, [activeCharacter, player, weaponsMap])

    return (
        <div className="flex flex-col">
            <div className="relative flex items-center gap-3 p-3 md:gap-4 md:p-6">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]" />
                <div className="relative z-10 flex w-full items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                        <Avatar className="size-12 rounded-none border-1 border-zinc-800 md:size-16">
                            <AvatarImage
                                src={bungieIconUrl(emblemDefinition?.displayProperties.icon)}
                                alt={displayName}
                            />
                            <AvatarFallback className="rounded-md bg-zinc-800">
                                {displayName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2>
                                    <span className="text-xl font-bold text-white md:text-2xl">
                                        {displayName}
                                    </span>
                                    {bungieNumbers && (
                                        <span className="text-sm text-zinc-400">
                                            {`#${bungieNumbers}`}
                                        </span>
                                    )}
                                </h2>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-6 rounded-full hover:bg-zinc-700"
                                            asChild>
                                            <Link
                                                href={`/profile/${player.playerInfo.membershipId}`}>
                                                <LinkIcon className="size-6" />
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>View Profile</TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
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

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="ml-1 flex items-center gap-1">
                                            <ActivityPieChart
                                                percentage={activityPercentage}
                                                size={18}
                                                color={player.completed ? "green" : "orange"}
                                            />
                                            <span className="text-xs text-zinc-400">
                                                {activityPercentage}% participation
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" align="start">
                                        This player participated in {activityPercentage}% of the
                                        activity
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer rounded-full"
                        onClick={onClose}>
                        <X className="size-7 p-1 md:size-10" />
                    </Button>
                </div>
            </div>

            <div className="border-b border-zinc-800 bg-zinc-950" />

            <div className="space-y-4 p-6">
                {player.characters.length > 1 && (
                    <div className="scrollbar-none flex items-center gap-1 overflow-x-auto pb-2 md:gap-2">
                        <Button
                            variant={selectedCharacter === null ? "default" : "outline"}
                            size="sm"
                            className="rounded-full text-xs whitespace-nowrap"
                            onClick={() => remove("character")}>
                            All Characters
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
                                const [CharacterIcon, characterName] = getCharacterIcon(classHash)
                                return (
                                    <Tooltip key={characterId}>
                                        <TooltipTrigger asChild>
                                            <Button
                                                key={characterId}
                                                variant={
                                                    selectedCharacter === characterId
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                className="border-muted-foreground cursor-pointer items-center gap-1 rounded-full text-xs whitespace-nowrap md:gap-2"
                                                onClick={() => set("character", characterId)}>
                                                <CharacterIcon className="size-4 md:size-4" />
                                                {completed && (
                                                    <CheckCircle className="ml-1 size-3 text-green-500" />
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" align="start">
                                            {characterName}
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            })}
                    </div>
                )}
                {/* Performance Stats */}
                <Card className="gap-2 rounded-none border-zinc-800 bg-zinc-950">
                    <CardHeader className="pb-0">
                        <h3 className="text-lg font-medium">Performance</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                            {player.characters.length === 1 && (
                                <StatCard
                                    label="Class"
                                    value={getCharacterIcon(player.characters[0].classHash)[1]}
                                />
                            )}
                            <StatCard
                                label="Time Played"
                                value={secondsToHMS(
                                    Math.min(selectedStats.timePlayedSeconds, data.duration),
                                    false
                                )}
                            />
                            <StatCard label="Kills" value={selectedStats.kills.toLocaleString()} />
                            <StatCard
                                label="Deaths"
                                value={selectedStats.deaths.toLocaleString()}
                            />
                            <StatCard
                                label="Assists"
                                value={selectedStats.assists.toLocaleString()}
                            />
                            <StatCard
                                label="K/D Ratio"
                                value={round(
                                    selectedStats.kills / Math.max(selectedStats.deaths, 1),
                                    2
                                ).toLocaleString()}
                            />
                            <StatCard
                                label="Melee Kills"
                                value={selectedStats.meleeKills.toLocaleString()}
                            />
                            <StatCard
                                label="Grenade Kills"
                                value={selectedStats.grenadeKills.toLocaleString()}
                            />
                            <StatCard
                                label="Super Kills"
                                value={selectedStats.superKills.toLocaleString()}
                            />
                            <StatCard
                                label="Precision Kills"
                                value={selectedStats.precisionKills.toLocaleString()}
                            />
                            <Tooltip>
                                <TooltipTrigger>
                                    <StatCard
                                        label="RIIS"
                                        value={
                                            scores
                                                .get(player.playerInfo.membershipId)
                                                ?.score.toFixed(3) ?? "0"
                                        }
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-sm">
                                        <strong>RaidHub Individual Impact Score (RIIS)</strong>
                                        {[
                                            " is a metric that measures ",
                                            " a player's performance and determines their contribution to the",
                                            " team's success. It is calculated using a combination of the player's",
                                            " kills, deaths, assists, and other available stats."
                                        ].map((text, index, arr) => (
                                            <span key={index}>
                                                {text}
                                                {index < arr.length - 1 && <br />}
                                            </span>
                                        ))}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </CardContent>
                </Card>

                <WeaponTable
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
