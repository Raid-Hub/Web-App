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

const craftStartDate = new Date("2023-09-15")
const craftEndDate = new Date("2023-09-21")
const horsemanStartDate = new Date("2023-04-26")
const horsemanEndDate = new Date("2023-04-28")

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
    Horseman: (activity: RaidHubInstanceForPlayer) => !(new Date(activity.dateCompleted) > horsemanStartDate && new Date(activity.dateCompleted) < horsemanEndDate),
    Craftening: (activity: RaidHubInstanceForPlayer) => !(new Date(activity.dateCompleted) > craftStartDate && new Date(activity.dateCompleted) < craftEndDate)
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
                new SingleActivityFilter("Horseman"),
                new SingleActivityFilter("Craftening")
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
    Horseman: {
        displayName: "Exclude Horseman",
        getFilter: () => new SingleActivityFilter("Horseman")
    },
    Craftening: {
        displayName: "Exclude Craftening",
        getFilter: () => new SingleActivityFilter("Craftening")
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
