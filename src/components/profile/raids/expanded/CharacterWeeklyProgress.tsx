import type {
    DestinyCharacterComponent,
    DestinyMilestone,
    DestinyMilestoneActivityPhase,
    DestinyMilestoneChallengeActivity
} from "bungie-net-core/models"
import Image from "next/image"
import { Container } from "~/components/__deprecated__/layout/Container"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { useClassDefinition } from "~/hooks/dexie"
import { bungieIconUrl } from "~/util/destiny"

export const CharacterWeeklyProgress = ({
    character,
    milestone
}: {
    character: DestinyCharacterComponent
    milestone: DestinyMilestone
}) => {
    const classDefinition = useClassDefinition(character.classHash)
    return (
        <div style={{ border: "1px solid var(--border)", padding: "0.5em" }}>
            <Flex $padding={0.25} $align="flex-start">
                <h5 style={{ marginBlock: "1em" }}>{classDefinition?.displayProperties.name}</h5>
                <Container
                    $minHeight={30}
                    $aspectRatio={{
                        width: 1,
                        height: 1
                    }}>
                    <Image src={bungieIconUrl(character.emblemPath)} alt="" fill unoptimized />
                </Container>
            </Flex>
            <div>
                {milestone.activities.map(a => (
                    <MilestoneActivity key={a.activityHash} activity={a} />
                ))}
            </div>
        </div>
    )
}

function MilestoneActivity({ activity }: { activity: DestinyMilestoneChallengeActivity }) {
    const { getDefinitionFromHash } = useRaidHubManifest()
    const definition = getDefinitionFromHash(activity.activityHash)
    if (!definition) return null
    return (
        <Flex $padding={0} $wrap>
            <h6 style={{ marginBlock: 0 }}>{definition.version.name}</h6>
            <div
                style={{
                    gridTemplateColumns: `repeat(${activity.phases?.length ?? 0}, 30px)`
                }}>
                {activity.phases?.map(phase => (
                    <EncounterProgress key={phase.phaseHash} phase={phase} />
                ))}
            </div>
        </Flex>
    )
}

function EncounterProgress({ phase }: { phase: DestinyMilestoneActivityPhase }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width={30} height={30}>
            <rect
                width={20}
                height={20}
                stroke="gray"
                strokeWidth={2}
                fill={phase.complete ? "#0CA51240" : "none"}
            />
        </svg>
    )
}
