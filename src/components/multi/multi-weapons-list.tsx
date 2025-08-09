import Image from "next/image"
import { useItemDefinition } from "~/hooks/dexie"
import { type CombinedWeaponData } from "~/lib/multi/multi-types"
import { bungieIconUrl } from "~/util/destiny"

export const MultiWeaponsList = ({ weapons }: { weapons: CombinedWeaponData[] }) => {
    return (
        <div className="flex flex-wrap gap-4">
            {weapons
                .sort((a, b) => b.kills - a.kills)
                .map(weapon => (
                    <WeaponItem key={weapon.hash} weapon={weapon} />
                ))}
        </div>
    )
}

const WeaponItem = ({ weapon }: { weapon: CombinedWeaponData }) => {
    const definition = useItemDefinition(weapon.hash)
    const icon = bungieIconUrl(definition?.displayProperties.icon)
    return (
        <div className="flex w-64 items-center gap-4">
            <Image
                className="size-12"
                src={icon}
                alt={definition?.displayProperties.name ?? "Unknown"}
                width={96}
                height={96}
                unoptimized
            />
            <div className="space-y-1">
                <div className="text-sm">
                    {definition?.displayProperties.name ?? "Unknown Weapon"}
                </div>
                <div className="text-xs">
                    Kills: {weapon.kills} ({weapon.precisionKills})
                </div>
            </div>
        </div>
    )
}
