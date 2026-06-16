"use client"

import Image from "next/image"
import { usePGCRContext } from "~/hooks/pgcr/ClientStateManager"
import { bungieIconUrl } from "~/util/destiny"

export const PGCRFeats = () => {
    const { selectedFeats } = usePGCRContext()

    return (
        !!selectedFeats.length && (
            <div className="flex gap-1 md:gap-2">
                {selectedFeats.map(feat => (
                    <span
                        key={feat.hash}
                        title={`${feat.name} — ${feat.shortDescription}`}
                        className="inline-flex">
                        <Image
                            src={bungieIconUrl(feat.iconPath)}
                            alt={feat.name}
                            width={60}
                            height={60}
                            className="size-10"
                            unoptimized
                        />
                    </span>
                ))}
            </div>
        )
    )
}
