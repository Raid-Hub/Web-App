import type {
    DestinyCharacterComponent,
    DestinyMilestone,
    DestinyMilestoneActivityPhase,
    DestinyMilestoneChallengeActivity
} from "bungie-net-core/models"
import Image from "next/image"
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
        <div className="border p-2">
            <div className="mb-4 flex items-center gap-2">
                <h5 className="text-lg font-semibold">{classDefinition?.displayProperties.name}</h5>
                <div className="relative aspect-square min-h-8">
                    <Image src={bungieIconUrl(character.emblemPath)} alt="" fill unoptimized />
                </div>
            </div>
            <div className="flex flex-col gap-4">
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
        <div className="flex flex-col gap-2">
            <h6 className="font-semibold">{definition.version.name}</h6>
            <div className="flex flex-row flex-wrap">
                {activity.phases?.map(phase => (
                    <EncounterProgress key={phase.phaseHash} phase={phase} />
                ))}
            </div>
        </div>
    )
}

function EncounterProgress({ phase }: { phase: DestinyMilestoneActivityPhase }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="size-8">
            <rect
                width={20}
                height={20}
                stroke="#6B7280" // Tailwind's gray-500
                strokeWidth={2}
                fill={phase.complete ? "#0CA51240" : "none"}
                className="rounded"
            />
        </svg>
    )
}
