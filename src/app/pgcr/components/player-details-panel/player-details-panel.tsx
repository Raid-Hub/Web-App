import { Collection } from "@discordjs/collection"
import { CheckCircle, ExternalLink, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { ActivityPieChart } from "~/app/pgcr/components/activity-pie-chart"
import { useItemDefinition } from "~/hooks/dexie"
import { type RaidHubInstancePlayerExtended } from "~/services/raidhub/types"
import { Avatar, AvatarFallback, AvatarImage } from "~/shad/avatar"
import { Button } from "~/shad/button"
import { Card, CardContent, CardHeader } from "~/shad/card"
import { ScrollArea } from "~/shad/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/shad/tooltip"
import { bungieIconUrl, getBungieDisplayName } from "~/util/destiny"
import { round } from "~/util/math"
import { secondsToHMS } from "~/util/presentation/formatting"
import { useGetCharacterClass } from "../../hooks/useCharacterClass"
import { usePgcrParams } from "../../hooks/usePgcrParams"
import { usePGCRContext } from "../ClientStateManager"
import { WeaponTable } from "../pgcr-weapons"
import { PlayerBadge } from "../player-badge"
import { StatCard } from "../stat-card"

interface PlayerDetailsPanelProps {
    player: RaidHubInstancePlayerExtended
    onClose: () => void
}

export const PlayerDetailsPanel = ({ player, onClose }: PlayerDetailsPanelProps) => {
    const { validatedSearchParams, get, set, remove } = usePgcrParams()
    const { data, mvp, playerStatsMerged, weaponsMap } = usePGCRContext()

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            const playerParam = get("player")
            if (e.key === "Escape" && playerParam) {
                set("character", undefined, { commit: false })
                set("player", undefined, { commit: true, shallow: true })
            }
        }

        window.addEventListener("keydown", handleEscape)
        return () => window.removeEventListener("keydown", handleEscape)
    }, [get, set])

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
        <TooltipProvider>
            <div className="flex h-full flex-col">
                <div className="relative flex items-center gap-3 p-3 md:gap-4 md:p-6">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]" />
                    <div className="relative z-10 flex w-full items-center justify-between">
                        <div className="flex items-center gap-3 md:gap-4">
                            <Avatar className="border-muted-foreground h-12 w-12 rounded-md border-2 md:h-16 md:w-16">
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
                                                className="h-6 w-6 rounded-full hover:bg-zinc-700"
                                                asChild>
                                                <Link
                                                    href={`/profile/${player.playerInfo.membershipId}`}>
                                                    <ExternalLink className="h-3 w-3" />
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
                            <X className="h-6 w-6 md:h-8 md:w-8" />
                        </Button>
                    </div>
                </div>

                <div className="border-b border-zinc-800 bg-zinc-950" />

                <ScrollArea className="h-[50vh] flex-1 md:h-[60vh]">
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
                                        const [CharacterIcon, characterName] =
                                            getCharacterIcon(classHash)
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
                                                        onClick={() =>
                                                            set("character", characterId)
                                                        }>
                                                        <CharacterIcon className="h-4 w-4 md:h-4 md:w-4" />
                                                        {completed && (
                                                            <CheckCircle className="ml-1 h-3 w-3 text-green-500" />
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
                        <Card className="gap-2 border-zinc-800 bg-zinc-950">
                            <CardHeader className="pb-0">
                                <h3 className="text-lg font-medium">Performance</h3>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                                    <StatCard
                                        label="Time Played"
                                        value={secondsToHMS(
                                            Math.min(
                                                selectedStats.timePlayedSeconds,
                                                data.duration
                                            ),
                                            false
                                        )}
                                    />
                                    <StatCard
                                        label="Kills"
                                        value={selectedStats.kills.toLocaleString()}
                                    />
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
                </ScrollArea>
            </div>
        </TooltipProvider>
    )
}
