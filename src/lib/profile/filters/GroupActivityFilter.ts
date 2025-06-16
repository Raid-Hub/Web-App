import type { RaidHubInstanceForPlayer } from "~/services/raidhub/types"
import { type ActivityFilter } from "./activityFilters"

type ActivityFilterCombinator = "|" | "&"

export default class GroupActivityFilter implements ActivityFilter {
    combinator: ActivityFilterCombinator
    children: ActivityFilter[]

    constructor(combinator: ActivityFilterCombinator, children: ActivityFilter[]) {
        this.combinator = combinator
        this.children = children
    }

    predicate(a: RaidHubInstanceForPlayer) {
        switch (this.combinator) {
            case "&":
                return !this.children.length
                    ? true
                    : this.children.reduce(
                          (base, filter) => activity =>
                              base(activity) && filter.predicate(activity),
                          (_: RaidHubInstanceForPlayer) => true
                      )(a)
            case "|":
                return !this.children.length
                    ? true
                    : this.children.reduce(
                          (base, filter) => activity =>
                              base(activity) || filter.predicate(activity),
                          (_: RaidHubInstanceForPlayer) => false
                      )(a)
        }
    }

    encode() {
        return {
            [this.combinator]: this.children.map(c => c.encode())
        }
    }
}
