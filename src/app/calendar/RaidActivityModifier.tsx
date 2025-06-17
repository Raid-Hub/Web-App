"use client"

import Image from "next/image"
import styled from "styled-components"
import { TooltipContainer, TooltipData } from "~/components/Tooltip"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { useActivityModifierDefinition } from "~/hooks/dexie"
import { bungieIconUrl } from "~/util/destiny"

export const RaidActivityModifier = (props: { hash: number }) => {
    const modifier = useActivityModifierDefinition(props.hash)
    if (!modifier?.displayInActivitySelection) return null

    return (
        <TooltipContainer
            tooltipId={`tooltip-${modifier.hash}`}
            tooltipBody={
                <TooltipData>
                    <Flex $direction="column" $gap={0} $padding={0.6}>
                        <H5>
                            <b>{modifier.displayProperties.name}</b>
                        </H5>
                        <div>
                            {modifier.displayProperties.description
                                .replace(/\{var:\d+\}%/, "25%")
                                .replace(/\{var:\d+\}/, "unknown")}
                        </div>
                    </Flex>
                </TooltipData>
            }>
            <Flex data-modifier-hash={modifier.hash} $direction="column" $padding={0.3} $gap={0.5}>
                <Image
                    unoptimized
                    alt={modifier.displayProperties.name}
                    src={bungieIconUrl(modifier.displayProperties.icon)}
                    width={40}
                    height={40}
                />
            </Flex>
        </TooltipContainer>
    )
}

const H5 = styled.h5`
    margin-block: 0.2em;

    font-size: 1rem;
`
