"use client"

import { Collection } from "@discordjs/collection"
import Image from "next/image"
import Link from "next/link"
import { useMemo } from "react"
import { usePGCRContext } from "~/hooks/pgcr/ClientStateManager"
import { type PlayerStats } from "~/lib/pgcr/types"
import { cn } from "~/lib/tw"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/shad/tooltip"
import { bungieItemUrl, getBungieDisplayName } from "~/util/destiny"

interface WeaponData {
    kills: number
    precisionKills: number
    users: Set<string>
}

const KINETIC_BUCKET = 1498876634
const ENERGY_BUCKET = 2465295065
const POWER_BUCKET = 953998645

export const WeaponTable = ({
    kineticWeapons,
    energyWeapons,
    powerWeapons,
    stats,
    showUsers,
    compact = false
}: {
    kineticWeapons: Collection<number, WeaponData>
    energyWeapons: Collection<number, WeaponData>
    powerWeapons: Collection<number, WeaponData>
    stats: PlayerStats
    showUsers: boolean
    compact?: boolean
}) => {
    const { weaponsMap } = usePGCRContext()

    const slots = [
        { label: "Kinetic", weapons: kineticWeapons },
        { label: "Energy", weapons: energyWeapons },
        { label: "Power", weapons: powerWeapons }
    ].filter(slot => slot.weapons.size > 0)

    if (slots.length === 0) {
        return null
    }

    return (
        <div
            className={cn(
                "overflow-x-auto bg-zinc-950",
                !compact && "rounded-lg border border-zinc-800"
            )}>
            <div
                className="grid min-w-max divide-x divide-zinc-800"
                style={{
                    gridTemplateColumns: `repeat(${slots.length}, minmax(${compact ? "9rem" : "11rem"}, 1fr))`
                }}>
                {slots.map(slot => (
                    <WeaponSlot
                        key={slot.label}
                        label={slot.label}
                        weapons={slot.weapons}
                        weaponsMap={weaponsMap}
                        totalKills={stats.kills}
                        showUsers={showUsers}
                        compact={compact}
                    />
                ))}
            </div>
        </div>
    )
}

const WeaponSlot = ({
    label,
    weapons,
    weaponsMap,
    totalKills,
    showUsers,
    compact = false
}: {
    label: string
    weapons: Collection<number, WeaponData>
    weaponsMap: ReturnType<typeof usePGCRContext>["weaponsMap"]
    totalKills: number
    showUsers: boolean
    compact?: boolean
}) => (
    <div className={compact ? "min-w-[9rem]" : "min-w-[11rem]"}>
        <div className="border-b border-zinc-800 px-2 py-1.5 text-center text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
            {label}
        </div>
        <div className="divide-y divide-zinc-800">
            {weapons.map((weapon, hash) => (
                <WeaponRow
                    key={hash}
                    compact={compact}
                    weaponHash={hash}
                    kills={weapon.kills}
                    precisionKills={weapon.precisionKills}
                    totalKills={totalKills}
                    weaponName={weaponsMap.get(hash)?.displayProperties.name ?? "Unknown"}
                    icon={weaponsMap.get(hash)?.displayProperties.icon ?? ""}
                    users={weapon.users}
                    showUsers={showUsers}
                />
            ))}
        </div>
    </div>
)

interface WeaponRowProps {
    kills: number
    precisionKills: number
    totalKills: number
    weaponHash: number
    icon: string
    weaponName: string
    users: Set<string>
    showUsers: boolean
}

const WeaponRow = ({
    kills,
    precisionKills,
    totalKills,
    weaponName,
    icon,
    users,
    showUsers,
    weaponHash,
    compact = false
}: WeaponRowProps & { compact?: boolean }) => {
    const { data } = usePGCRContext()
    const imageUrl = bungieItemUrl(icon ?? "")
    const sharePct = totalKills > 0 ? (kills / totalKills) * 100 : 0
    const precisionPct = kills > 0 ? (100 * precisionKills) / kills : 0

    return (
        <div className={cn("flex items-center gap-2 px-2 py-1.5", !compact && "md:gap-3 md:px-3 md:py-2")}>
            <div
                className={cn(
                    "flex shrink-0 items-center justify-center overflow-hidden bg-zinc-800",
                    compact ? "size-7" : "size-8 md:size-9"
                )}>
                {imageUrl && (
                    <Image
                        unoptimized
                        src={imageUrl}
                        alt={weaponName}
                        className="h-full w-full object-contain"
                        width={72}
                        height={72}
                    />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <Link
                    className="block truncate text-xs font-medium hover:text-white md:text-sm"
                    target="_blank"
                    rel="noopener"
                    href={`https://d2foundry.gg/w/${weaponHash}`}>
                    {weaponName}
                </Link>
                {showUsers ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-[10px] text-zinc-500">
                                {users.size} player{users.size !== 1 ? "s" : ""}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            {Array.from(users).map(id => (
                                <div key={id}>
                                    {getBungieDisplayName(
                                        data.players.find(
                                            player => player.playerInfo.membershipId === id
                                        )!.playerInfo,
                                        { excludeCode: true }
                                    )}
                                </div>
                            ))}
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <span className="text-[10px] text-zinc-500">
                        {precisionPct.toFixed(0)}% precision
                    </span>
                )}
            </div>
            <div className="shrink-0 text-right">
                <div className="text-primary/90 text-sm font-semibold tabular-nums md:text-base">
                    {kills.toLocaleString()}
                </div>
                <div className="text-[10px] text-zinc-500 tabular-nums">{sharePct.toFixed(1)}%</div>
            </div>
        </div>
    )
}

export const AllPgcrWeaponsWrapper = (stats: PlayerStats) => {
    const { data, weaponsMap } = usePGCRContext()
    const { kineticWeapons, energyWeapons, powerWeapons } = useMemo(() => {
        const weaponStats = new Collection<number, WeaponData>()
        data.players.forEach(player => {
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
                })
            })
        })

        weaponStats.sort((a, b) => b.kills - a.kills)

        const byBucket = (bucketHash: number) =>
            weaponStats.filter(
                (_, key) => weaponsMap.get(key)?.inventory?.bucketTypeHash === bucketHash
            )

        return {
            kineticWeapons: byBucket(KINETIC_BUCKET),
            energyWeapons: byBucket(ENERGY_BUCKET),
            powerWeapons: byBucket(POWER_BUCKET)
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
