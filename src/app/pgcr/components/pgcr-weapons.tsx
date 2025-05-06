"use client"

import { Collection } from "@discordjs/collection"
import { Crosshair, Swords } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useMemo } from "react"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent, CardHeader } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip"
import { bungieItemUrl, getBungieDisplayName } from "~/util/destiny"
import { type PlayerStats } from "../types"
import { usePGCRContext } from "./ClientStateManager"

interface WeaponData {
    kills: number
    precisionKills: number
    users: Set<string>
}
export const WeaponTable = ({
    kineticWeapons,
    energyWeapons,
    powerWeapons,
    stats,
    showUsers
}: {
    kineticWeapons: Collection<number, WeaponData>
    energyWeapons: Collection<number, WeaponData>
    powerWeapons: Collection<number, WeaponData>
    stats: PlayerStats
    showUsers: boolean
}) => {
    const { weaponsMap } = usePGCRContext()
    return (
        <Card className="gap-2 border-zinc-800 bg-zinc-950">
            <CardHeader className="pb-0">
                <h3 className="flex items-center gap-2 text-base font-medium md:text-lg">
                    <Swords className="text-raidhub h-4 w-4 md:h-5 md:w-5" />
                    Weapons
                </h3>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Kinetic Weapons */}
                    <div>
                        <div className="mb-3 flex items-center">
                            <Badge
                                variant="outline"
                                className="border-zinc-200/20 bg-zinc-200/10 text-zinc-200">
                                Kinetic
                            </Badge>
                        </div>
                        <div className="space-y-3">
                            {kineticWeapons.map((weapon, hash) => (
                                <WeaponCard
                                    weaponHash={hash}
                                    key={hash}
                                    kills={weapon.kills}
                                    precisionKills={weapon.precisionKills}
                                    characterKills={stats.kills}
                                    weaponName={
                                        weaponsMap.get(hash)?.displayProperties.name ?? "Unknown"
                                    }
                                    icon={weaponsMap.get(hash)?.displayProperties.icon ?? ""}
                                    users={weapon.users}
                                    showUsers={showUsers}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Energy Weapons */}
                    <div>
                        <div className="mb-3 flex items-center">
                            <Badge
                                variant="outline"
                                className="border-green-400/20 bg-green-400/10 text-green-400">
                                Energy
                            </Badge>
                        </div>
                        <div className="space-y-3">
                            {energyWeapons.map((weapon, hash) => (
                                <WeaponCard
                                    weaponHash={hash}
                                    key={hash}
                                    kills={weapon.kills}
                                    precisionKills={weapon.precisionKills}
                                    characterKills={stats.kills}
                                    weaponName={
                                        weaponsMap.get(hash)?.displayProperties.name ?? "Unknown"
                                    }
                                    icon={weaponsMap.get(hash)?.displayProperties.icon ?? ""}
                                    users={weapon.users}
                                    showUsers={showUsers}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Power Weapons */}
                    <div>
                        <div className="mb-3 flex items-center">
                            <Badge
                                variant="outline"
                                className="border-purple-400/20 bg-purple-400/10 text-purple-400">
                                Power
                            </Badge>
                        </div>
                        <div className="space-y-3">
                            {powerWeapons.map((weapon, hash) => (
                                <WeaponCard
                                    key={hash}
                                    weaponHash={hash}
                                    kills={weapon.kills}
                                    precisionKills={weapon.precisionKills}
                                    characterKills={stats.kills}
                                    weaponName={
                                        weaponsMap.get(hash)?.displayProperties.name ?? "Unknown"
                                    }
                                    icon={weaponsMap.get(hash)?.displayProperties.icon ?? ""}
                                    users={weapon.users}
                                    showUsers={showUsers}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

interface WeaponCardProps {
    kills: number
    precisionKills: number
    characterKills: number
    weaponHash: number
    icon: string
    weaponName: string
    users: Set<string>
    showUsers: boolean
}

export const WeaponCard = ({
    kills,
    precisionKills,
    characterKills: totalPlayerKills,
    weaponName,
    icon,
    users,
    showUsers,
    weaponHash
}: WeaponCardProps) => {
    const { data } = usePGCRContext()
    const getName = (id: string) => {
        return getBungieDisplayName(
            data.players.find(player => player.playerInfo.membershipId === id)!.playerInfo,
            { excludeCode: true }
        )
    }
    const imageUrl = bungieItemUrl(icon ?? "")
    return (
        <Card className="overflow-hidden rounded-none border-zinc-800 bg-zinc-950 py-0">
            <CardContent className="p-0">
                <div className="flex items-center">
                    <div className="flex size-12 flex-shrink-0 items-center justify-center overflow-hidden bg-zinc-800 md:size-16">
                        {imageUrl && (
                            <Image
                                unoptimized
                                src={imageUrl}
                                alt={weaponName}
                                className="h-full w-full object-contain"
                                width={96}
                                height={96}
                            />
                        )}
                    </div>
                    <div className="flex-1 space-y-1 p-3">
                        <div className="flex items-center justify-between">
                            <Link
                                className="text-primary text-xs font-medium md:text-sm"
                                target="_blank"
                                rel="noopener"
                                href={`https://d2foundry.gg/w/${weaponHash}`}>
                                {weaponName}
                            </Link>
                            <div className="text-lg font-medium">{kills}</div>
                        </div>
                        <div className="hidden items-center gap-2 md:flex">
                            <Progress
                                value={(kills / totalPlayerKills) * 100}
                                className="h-1.5 flex-1"
                            />
                            <span className="text-xs whitespace-nowrap text-zinc-500">
                                {((kills / totalPlayerKills) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="hidden justify-end md:flex">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="flex items-center gap-1 text-xs text-zinc-400">
                                        {showUsers
                                            ? `${users.size} player${users.size !== 1 ? "s" : ""}`
                                            : `${((100 * precisionKills) / kills).toFixed(0)}% precision`}
                                        {!showUsers && <Crosshair className="h-3 w-3" />}
                                    </span>
                                </TooltipTrigger>
                                {showUsers && (
                                    <TooltipContent>
                                        {Array.from(users).map(user => (
                                            <div key={user}>{getName(user)}</div>
                                        ))}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export const AllPgcrWeaponsWrapper = (stats: PlayerStats) => {
    const { data, weaponsMap } = usePGCRContext()
    const { kineticWeapons, energyWeapons, powerWeapons } = useMemo(() => {
        const weaponStats = new Collection<number, WeaponData>()
        data.players.forEach(player => {
            const weaponSet = new Set<number>()
            player.characters.forEach(character => {
                character.weapons.forEach(weapon => {
                    const prev = weaponStats.get(weapon.weaponHash)
                    weaponStats.set(weapon.weaponHash, {
                        kills: (prev?.kills ?? 0) + weapon.kills,
                        precisionKills: (prev?.precisionKills ?? 0) + weapon.precisionKills,
                        users: (prev?.users ?? new Set<string>()).add(
                            player.playerInfo.membershipId
                        )
                    })
                    weaponSet.add(weapon.weaponHash)
                })
            })
        })

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
    }, [data, weaponsMap])

    return (
        <WeaponTable
            kineticWeapons={kineticWeapons}
            energyWeapons={energyWeapons}
            powerWeapons={powerWeapons}
            stats={stats}
            showUsers
        />
    )
}
