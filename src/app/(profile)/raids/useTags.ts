import type { Collection } from "@discordjs/collection"
import { useCallback, useMemo } from "react"
import { useRaidHubManifest } from "~/app/layout/wrappers/RaidHubManifestManager"
import { type RaidHubInstance } from "~/services/raidhub/types"
import { includedIn } from "~/util/helpers"

export const useTags = (activities: Collection<string, RaidHubInstance>) => {
    const getWeight = useGetWeight()

    return useMemo(() => {
        const sorted = activities
            .filter(a => a.completed)
            .map(activity => ({
                activity,
                weight: getWeight(activity)
            }))
            .filter(a => !isIllegalTag(a.activity, a.weight))
            .sort(
                (a, b) =>
                    b.weight - a.weight ||
                    (new Date(a.activity.dateCompleted) < new Date(b.activity.dateCompleted)
                        ? -1
                        : 1)
            )

        let bitfield = 0
        let bitfieldForElevatedDifficulty = 0
        const result = new Array<{
            activity: RaidHubInstance
            bestPossible: boolean
        }>()
        for (const { activity, weight } of sorted) {
            const isElevatedDifficulty = weight % 2 === 1
            const covers = isElevatedDifficulty
                ? weight & ~bitfieldForElevatedDifficulty
                : weight & ~bitfield

            if (covers) {
                if (isElevatedDifficulty) {
                    bitfieldForElevatedDifficulty = bitfieldForElevatedDifficulty | weight
                }
                bitfield = bitfield | weight

                result.push({
                    activity,
                    bestPossible: isBestTag(activity, weight)
                })
                if (result.length >= 3) break
            }
        }

        return result
    }, [activities, getWeight])
}

const useGetWeight = () => {
    const { elevatedDifficulties } = useRaidHubManifest()

    return useCallback(
        (activity: RaidHubInstance) => {
            // non lowman 2 => 1 => 0
            // trio => 2 => 1
            // duo => 4 => 3
            // solo => 8 => 7
            const adjustedPlayerCount =
                (1 << Math.max(0, 4 - Math.min(activity.playerCount, 6))) - 1
            const isElevatedDifficulty = includedIn(elevatedDifficulties, activity.versionId)
            /*
        This is a bitfield to measure the weight of an activity. If its not flawless or a lowman, it has 0 weight.
        From the right,
        - bit 0 is for master/prestige.
        - bit 1 for fresh
        - bit 2 for flawless
        - bit 3,4,5 for trio, duo, and solo respectively
        */
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const fresh = activity.fresh || activity.flawless
            const shouldConsider =
                activity.completed && (activity.playerCount <= 3 || activity.flawless)
            return shouldConsider
                ? (adjustedPlayerCount << 3) +
                      ((activity.flawless ? 1 : 0) << 2) +
                      ((fresh ? 1 : 0) << 1) +
                      +isElevatedDifficulty
                : 0
        },
        [elevatedDifficulties]
    )
}

function isIllegalTag(
    { activityId }: { activityId: number; versionId: number },
    weight: number
): boolean {
    switch (activityId) {
        case 13:
            // solo crota
            return bitfieldMatches(weight, 0b111000)
        case 10:
            // duo rhulk
            return bitfieldMatches(weight, 0b011000)
        case 8:
            // solo taniks
            return bitfieldMatches(weight, 0b111000)
        case 7:
            // duo fresh gos
            return bitfieldMatches(weight, 0b011010)
        case 6:
            // solo crown
            return bitfieldMatches(weight, 0b111000)
        case 5:
            // duo flawless or solo scourge
            return bitfieldMatches(weight, 0b111000) || bitfieldMatches(weight, 0b011100)
        case 4:
            // duo flawless wish
            return bitfieldMatches(weight, 0b011100)
        case 3:
            // any spire lowman
            return bitfieldMatches(weight, 0b001000)
        case 2:
            // any fresh eater lowman
            return bitfieldMatches(weight, 0b001010)
        case 1:
            // any fresh levi lowman
            return bitfieldMatches(weight, 0b001010)
        default:
            return false
    }
}

function isBestTag(
    { activityId }: { activityId: number; versionId: number },
    weight: number
): boolean {
    switch (activityId) {
        case 13:
            // duo flawless or trio flawless master crota
            return bitfieldMatches(weight, 0b011100) || bitfieldMatches(weight, 0b001101)

        case 12:
            // solo flawless or duo flawless master ron
            return bitfieldMatches(weight, 0b111100) || bitfieldMatches(weight, 0b011101)
        case 11:
            // duo master oryx or trio flawless master
            return bitfieldMatches(weight, 0b011001) || bitfieldMatches(weight, 0b001101)
        case 10:
            // trio flawless master vow
            return bitfieldMatches(weight, 0b001101)
        case 9:
            // solo atheon or duo flawless master vog
            return bitfieldMatches(weight, 0b111000) || bitfieldMatches(weight, 0b011101)
        case 8:
            // duo flawless dsc
            return bitfieldMatches(weight, 0b011100)
        case 7:
            // solo sanc or trio flawless gos
            return bitfieldMatches(weight, 0b111000) || bitfieldMatches(weight, 0b001100)
        case 6:
            // duo flawless crown
            return bitfieldMatches(weight, 0b011100)
        case 5:
            // duo insurrection or trio flawless scourge
            return bitfieldMatches(weight, 0b011000) || bitfieldMatches(weight, 0b001100)
        case 4:
            // solo queens or trio flawless wish
            return bitfieldMatches(weight, 0b111000) || bitfieldMatches(weight, 0b001100)
        case 3:
            // flawless prestige :(
            return bitfieldMatches(weight, 0b000101)
        case 2:
            // solo argos
            return bitfieldMatches(weight, 0b111000)
        case 1:
            // duo calus
            return bitfieldMatches(weight, 0b011000)
        default:
            return false
    }
}

function bitfieldMatches(a: number, compareTo: number) {
    return (a & compareTo) === compareTo
}
