"use client"

import Image from "next/image"
import { usePGCRContext } from "~/hooks/pgcr/ClientStateManager"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/shad/tooltip"
import { bungieIconUrl } from "~/util/destiny"

export const PGCRFeats = () => {
    const { selectedFeats } = usePGCRContext()

    return (
        !!selectedFeats.length && (
            <div className="flex gap-1 md:gap-2">
                {selectedFeats.map(feat => (
                    <Tooltip key={feat.hash}>
                        <TooltipTrigger>
                            <Image
                                src={bungieIconUrl(feat.iconPath)}
                                alt={feat.name}
                                width={60}
                                height={60}
                                className="size-10"
                                unoptimized
                            />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="start">
                            <div className="text-xs">
                                <p>
                                    <strong>{feat.name}</strong>
                                </p>
                                <p>{feat.shortDescription}</p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        )
    )
}
