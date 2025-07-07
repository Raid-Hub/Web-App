import type { Collection } from "@discordjs/collection"
import { useCallback, useMemo } from "react"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { type RaidHubInstance, type RaidHubInstanceForPlayer } from "~/services/raidhub/types"
import { includedIn } from "~/util/helpers"

const crafteningStartDate = new Date("2023-09-15T17:00:00Z")
const crafteningEndDate = new Date("2023-09-21T17:00:00Z")
const horsemanStartDate = new Date("2023-04-26T17:00:00Z")
const horsemanEndDate = new Date("2023-04-28T17:00:00Z")

const isDuringOpItemEvent = (activity: RaidHubInstance) => {
    const date = new Date(activity.dateStarted)
    return (
        (date > crafteningStartDate && date < crafteningEndDate) ||
        (date > horsemanStartDate && date < horsemanEndDate)
    )
}

export const basicActivityFilter = (activity: RaidHubInstanceForPlayer) =>
    activity.player.completed && !activity.isBlacklisted && !isDuringOpItemEvent(activity)

export const useRaidTags = (activities: Collection<string, RaidHubInstanceForPlayer>) => {
    const getWeight = useGetWeight()

    return useMemo(() => {
        const sortedElligibleTags = activities
            .filter(basicActivityFilter)
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
        for (const { activity, weight } of sortedElligibleTags) {
            const isElevatedDifficulty = !!(weight & Tier2Difficulty)
            const covers = isElevatedDifficulty
                ? weight & ~bitfieldForElevatedDifficulty
                : weight & ~bitfield

            if (covers) {
                if (isElevatedDifficulty) {
                    bitfieldForElevatedDifficulty |= weight
                }
                bitfield |= weight

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

const Solo = 0b101010 // includes trio and duo
const Flawless = 0b010100 // includes fresh
const Duo = 0b001010 // includes trio
const Fresh = 0b000100
const Trio = 0b00010
const Tier2Difficulty = 0b000001

const useGetWeight = () => {
    const { elevatedDifficulties } = useRaidHubManifest()

    return useCallback(
        (activity: RaidHubInstance) => {
            if (
                !activity.completed ||
                (activity.playerCount > 3 && !activity.flawless) ||
                activity.isBlacklisted
            )
                return 0

            let bitfield = 0
            switch (activity.playerCount) {
                case 1:
                    bitfield |= Solo
                    break
                case 2:
                    bitfield |= Duo
                    break
                case 3:
                    bitfield |= Trio
                    break
            }

            if (activity.flawless) {
                bitfield |= Flawless
            }

            if (activity.fresh) {
                bitfield |= Fresh
            }

            if (includedIn(elevatedDifficulties, activity.versionId)) {
                bitfield |= Tier2Difficulty
            }

            return bitfield
        },
        [elevatedDifficulties]
    )
}

const soloTaniksFirst = new Date("2024-09-12T17:00:00Z")

function isIllegalTag({ activityId, dateCompleted }: RaidHubInstance, weight: number): boolean {
    switch (activityId) {
        case 14:
            // trio fresh
            return bitfieldMatches(weight, Trio | Fresh)
        case 13:
            // any crota lowman cp, or solo fresh
            return (
                (bitfieldMatches(weight, Trio) && !bitfieldMatches(weight, Fresh)) ||
                bitfieldMatches(weight, Solo | Fresh)
            )
        case 11:
            // duo fresh kf or solo oryx
            return bitfieldMatches(weight, Duo | Fresh) || bitfieldMatches(weight, Solo)
        case 10:
            // duo rhulk
            return bitfieldMatches(weight, Duo)
        case 8:
            // solo taniks before first clear
            return bitfieldMatches(weight, Solo) && new Date(dateCompleted) < soloTaniksFirst
        case 7:
            // duo fresh gos
            return bitfieldMatches(weight, Duo | Fresh)
        case 6:
            // solo crown
            return bitfieldMatches(weight, Solo)
        case 5:
            // duo flawless or solo scourge
            return bitfieldMatches(weight, Solo) || bitfieldMatches(weight, Duo | Flawless)
        case 4:
            // duo flawless wish
            return bitfieldMatches(weight, Duo | Flawless)
        case 3:
            // any spire lowman
            return bitfieldMatches(weight, Trio)
        case 2:
            // any fresh eater lowman
            return bitfieldMatches(weight, Trio | Fresh)
        case 1:
            // any fresh levi lowman
            return bitfieldMatches(weight, Trio | Fresh) || bitfieldMatches(weight, Solo)
        default:
            return false
    }
}

function isBestTag(
    { activityId }: { activityId: number; versionId: number },
    weight: number
): boolean {
    switch (activityId) {
        case 14:
            // master flawless or duo master witness or solo witness
            return (
                bitfieldMatches(weight, Tier2Difficulty | Flawless) ||
                bitfieldMatches(weight, Duo | Tier2Difficulty) ||
                bitfieldMatches(weight, Solo)
            )
        case 13:
            // duo flawless master crota
            return bitfieldMatches(weight, Duo | Flawless | Tier2Difficulty)
        case 12:
            // solo flawless or duo flawless master ron
            return (
                bitfieldMatches(weight, Solo | Flawless) ||
                bitfieldMatches(weight, Duo | Flawless | Tier2Difficulty)
            )
        case 11:
            // duo master oryx or trio flawless master
            return (
                bitfieldMatches(weight, Duo | Tier2Difficulty) ||
                bitfieldMatches(weight, Trio | Flawless | Tier2Difficulty)
            )
        case 10:
            // trio flawless master vow
            return bitfieldMatches(weight, Trio | Flawless | Tier2Difficulty)
        case 9:
            // solo atheon or duo flawless master vog
            return (
                bitfieldMatches(weight, Solo) ||
                bitfieldMatches(weight, Duo | Flawless | Tier2Difficulty)
            )
        case 8:
            // solo flawless dsc
            return bitfieldMatches(weight, Solo | Flawless)
        case 7:
            // solo sanc or trio flawless gos
            return bitfieldMatches(weight, Solo) || bitfieldMatches(weight, Trio | Flawless)
        case 6:
            // duo flawless crown
            return bitfieldMatches(weight, Duo | Flawless)
        case 5:
            // duo insurrection or trio flawless scourge
            return bitfieldMatches(weight, Duo) || bitfieldMatches(weight, Trio | Flawless)
        case 4:
            // solo queens or trio flawless wish
            return bitfieldMatches(weight, Solo) || bitfieldMatches(weight, Trio | Flawless)
        case 3:
            // flawless prestige :(
            return bitfieldMatches(weight, Flawless | Tier2Difficulty)
        case 2:
            // solo argos
            return bitfieldMatches(weight, Solo)
        case 1:
            // duo calus
            return bitfieldMatches(weight, Duo)
        default:
            return false
    }
}

function bitfieldMatches(a: number, compareTo: number) {
    return (a & compareTo) === compareTo
}
