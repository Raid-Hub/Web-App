import { v4 } from "uuid"
import { ActivityFilter, ExtendedActivity } from "../../types/profile"
import { Collection } from "@discordjs/collection"

export type ActivityFilterCombinator = "|" | "&"

export default class ActivityFilterBuilder implements ActivityFilter {
    combinator: ActivityFilterCombinator
    children: Collection<string, ActivityFilter>
    id: string

    constructor(combinator: ActivityFilterCombinator, children: ActivityFilter[]) {
        this.combinator = combinator
        this.children = new Collection(children.map(c => [c.id, c]))
        this.id = v4()
    }

    apply(arr: ExtendedActivity[]) {
        return arr.filter(this.predicate)
    }

    predicate(a: ExtendedActivity) {
        switch (this.combinator) {
            case "&":
                return !this.children.size
                    ? true
                    : Array.from(this.children.values()).reduce(
                          (base, filter) => (activity: ExtendedActivity) =>
                              base(activity) && filter.predicate(activity),
                          (_: ExtendedActivity) => true
                      )(a)
            case "|":
                return !this.children.size
                    ? true
                    : Array.from(this.children.values()).reduce(
                          (base, filter) => (activity: ExtendedActivity) =>
                              base(activity) || filter.predicate(activity),
                          (_: ExtendedActivity) => false
                      )(a)
        }
    }

    encode(): string {
        return `[${Array.from(this.children.values())
            .map(c => c.encode())
            .join(this.combinator)}]`
    }

    deepClone(): ActivityFilter {
        return new ActivityFilterBuilder(
            this.combinator,
            this.children.map(c => c.deepClone())
        )
    }
}
