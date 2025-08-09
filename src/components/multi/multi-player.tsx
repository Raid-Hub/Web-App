import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { useGetCharacterClass } from "~/hooks/pgcr/useCharacterClass"
import { type CombinedPlayerStats } from "~/lib/multi/multi-types"
import { cn } from "~/lib/tw"
import { Avatar, AvatarFallback, AvatarImage } from "~/shad/avatar"
import { Badge } from "~/shad/badge"
import { Button } from "~/shad/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/shad/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/shad/tooltip"
import { bungieIconUrl, getBungieDisplayName } from "~/util/destiny"
import { secondsToHMS } from "~/util/presentation/formatting"
import { MultiWeaponsList } from "./multi-weapons-list"

export const MultiPlayer = ({ player }: { player: CombinedPlayerStats }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const getCharacterIcon = useGetCharacterClass()

    return (
        <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className="hidden w-24 gap-2 md:flex">
                            {player.characters.map((character, characterId) => {
                                const [CharacterIcon, characterName] = getCharacterIcon(
                                    character.classHash
                                )
                                return (
                                    <Tooltip key={characterId}>
                                        <TooltipTrigger asChild>
                                            <CharacterIcon className="text-primary size-6" />
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" align="start">
                                            {characterName}
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            })}
                        </div>
                        <Avatar className="rounded-sm">
                            <AvatarImage
                                src={bungieIconUrl(player.playerInfo.iconPath)}
                                alt={player.playerInfo.displayName ?? "Player"}
                            />
                            <AvatarFallback>
                                {player.playerInfo.displayName!.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="w-32 font-medium">
                            {getBungieDisplayName(player.playerInfo, { excludeCode: true })}
                        </div>
                    </div>

                    <div className="text-muted-foreground hidden text-sm md:block">
                        <div>
                            {player.completions > 0 ? (
                                <Badge
                                    className={cn(
                                        "text-xs",
                                        player.completions > 0 && "bg-green-600",
                                        player.completions > 1 && "bg-amber-400"
                                    )}>
                                    {player.completions > 1
                                        ? `Completed ${player.completions}x`
                                        : "Completed"}
                                </Badge>
                            ) : (
                                <Badge variant="outline">Incomplete</Badge>
                            )}
                        </div>
                    </div>
                    <div className="hidden w-12 text-center md:block">{player.kills}</div>
                    <div className="hidden w-12 text-center md:block">{player.deaths}</div>
                    <div className="hidden w-12 text-center lg:block">{player.assists}</div>
                    <div className="hidden w-28 text-center lg:block">
                        {secondsToHMS(player.timePlayedSeconds, false)}
                    </div>
                    <div className="hidden w-16 text-center xl:block">{player.riis.toFixed(3)}</div>
                </div>

                <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setIsExpanded(prev => !prev)}>
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 transition-transform",
                                isExpanded && "rotate-180"
                            )}
                        />
                        {isExpanded ? "Hide Details" : "Details"}
                    </Button>
                </div>
            </div>

            {isExpanded && <MultiPlayerExpanded player={player} />}
        </div>
    )
}

const MultiPlayerExpanded = ({ player }: { player: CombinedPlayerStats }) => {
    const getCharacterIcon = useGetCharacterClass()
    return (
        <div className="mt-4 space-y-4">
            <Card className="gap-0 xl:hidden">
                <CardHeader>
                    <CardTitle className="text-sm">Stats</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Kills</span>
                            <span className="text-sm font-medium">{player.kills}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Deaths</span>
                            <span className="text-sm font-medium">{player.deaths}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Assists</span>
                            <span className="text-sm font-medium">{player.assists}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Time Played</span>
                            <span className="text-sm font-medium">
                                {secondsToHMS(player.timePlayedSeconds, false)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">RIIS</span>
                            <span className="text-sm font-medium">{player.riis.toFixed(3)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="gap-0">
                <CardHeader>
                    <CardTitle className="text-sm">Characters</CardTitle>
                </CardHeader>
                <CardContent>
                    {player.characters.map((ch, cid) => {
                        const [, characterClass] = getCharacterIcon(ch.classHash)
                        return (
                            <div key={cid} className="mb-4">
                                <div>
                                    <div>
                                        <div className="font-medium">{characterClass}</div>
                                        <div className="text-muted-foreground text-sm">
                                            K {ch.kills} • D {ch.deaths} • A {ch.assists} • Time{" "}
                                            {secondsToHMS(ch.timePlayedSeconds, false)}
                                        </div>
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        <span>Melee {ch.meleeKills} • </span>
                                        <span>Grenade {ch.grenadeKills} • </span>
                                        <span>Super {ch.superKills}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            <Card className="gap-0">
                <CardHeader>
                    <CardTitle className="text-sm">Weapons</CardTitle>
                </CardHeader>
                <CardContent>
                    <MultiWeaponsList weapons={Array.from(player.weapons.values())} />
                </CardContent>
            </Card>
        </div>
    )
}
