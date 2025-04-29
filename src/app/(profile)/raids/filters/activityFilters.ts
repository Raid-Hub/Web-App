import type { RaidHubInstanceForPlayer } from "~/services/raidhub/types"
import { includedIn } from "~/util/helpers"
import { o } from "~/util/o"
import GroupActivityFilter from "./GroupActivityFilter"
import NotActivityFilter from "./NotActivityFilter"
import SingleActivityFilter from "./SingleActivityFilter"

export type FilterPredicate = (this: ActivityFilter, activity: RaidHubInstanceForPlayer) => boolean

export interface ActivityFilter {
    predicate: FilterPredicate
    encode(): object | string
}

const craftStartDate = new Date("2023-09-15T17:00:00Z")
const craftEndDate = new Date("2023-09-21T17:00:00Z")
const horsemanStartDate = new Date("2023-04-26T17:00:00Z")
const horsemanEndDate = new Date("2023-04-28T17:00:00Z")

export const SingleActivityFilterFunctions = {
    All: () => true,
    Success: (activity: RaidHubInstanceForPlayer) => activity.player.completed,
    Flawless: (activity: RaidHubInstanceForPlayer) => !!activity.flawless,
    CheckpointBot: (activity: RaidHubInstanceForPlayer) => activity.playerCount > 50,
    FullTeam: (activity: RaidHubInstanceForPlayer) => activity.playerCount >= 6,
    Lowman: (activity: RaidHubInstanceForPlayer) => activity.playerCount <= 3,
    Trio: (activity: RaidHubInstanceForPlayer) => activity.playerCount === 3,
    Duo: (activity: RaidHubInstanceForPlayer) => activity.playerCount === 2,
    Solo: (activity: RaidHubInstanceForPlayer) => activity.playerCount === 1,
    Min5MinsPlayed: (activity: RaidHubInstanceForPlayer) => activity.duration >= 5 * 60,
    Min15MinsPlayed: (activity: RaidHubInstanceForPlayer) => activity.duration >= 15 * 60,
    CrafteningOrHorseman: (activity: RaidHubInstanceForPlayer) =>
        !(new Date(activity.dateCompleted) > horsemanStartDate && new Date(activity.dateCompleted) < horsemanEndDate) ||
        !(new Date(activity.dateCompleted) > craftStartDate && new Date(activity.dateCompleted) < craftEndDate)
} satisfies Record<string, FilterPredicate>

export const FilterPresets = {
    Default: {
        displayName: "Default",
        getFilter: () =>
            new GroupActivityFilter("|", [
                new SingleActivityFilter("Success"),
                new GroupActivityFilter("&", [
                    new SingleActivityFilter("Min15MinsPlayed"),
                    new SingleActivityFilter("FullTeam"),
                    new NotActivityFilter(new SingleActivityFilter("CheckpointBot"))
                ]),
                    new SingleActivityFilter("CrafteningOrHorseman")
            ])
    },
    All: {
        displayName: "All",
        getFilter: () => new SingleActivityFilter("All")
    },
    Success: {
        displayName: "Success Only",
        getFilter: () => new SingleActivityFilter("Success")
    },
    Lowman: {
        displayName: "Lowman Only",
        getFilter: () =>
            new GroupActivityFilter("&", [
                new SingleActivityFilter("Success"),
                new SingleActivityFilter("Lowman")
            ])
    },
    Flawless: {
        displayName: "Flawless Only",
        getFilter: () => new SingleActivityFilter("Flawless")
    },
    CrafteningOrHorseman: {
        displayName: "Exclude Craftening/Horseman",
        getFilter: () => new SingleActivityFilter("CrafteningOrHorseman")
    },
} satisfies Record<
    string,
    {
        displayName: string
        getFilter: () => ActivityFilter
    }
>

export function decodeFilters(json: unknown): ActivityFilter | null {
    if (!json) return null
    try {
        switch (typeof json) {
            case "object":
                if ("|" in json && Array.isArray(json["|"])) {
                    return new GroupActivityFilter(
                        "|",
                        json["|"].map(decodeFilters).filter((f): f is ActivityFilter => !!f)
                    )
                } else if ("&" in json && Array.isArray(json["&"])) {
                    return new GroupActivityFilter(
                        "&",
                        json["&"].map(decodeFilters).filter((f): f is ActivityFilter => !!f)
                    )
                } else if ("not" in json) {
                    return new NotActivityFilter(decodeFilters(json.not))
                }
                break
            case "string":
                if (includedIn(o.keys(SingleActivityFilterFunctions), json)) {
                    return new SingleActivityFilter(json)
                }
                break
        }
        return null
    } catch (e) {
        console.error("Failed to decode activity filters", e)
        return null
    }
}
