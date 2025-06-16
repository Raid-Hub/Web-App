import {
    SingleActivityFilterFunctions,
    type ActivityFilter,
    type FilterPredicate
} from "./activityFilters"

export default class SingleActivityFilter implements ActivityFilter {
    key: keyof typeof SingleActivityFilterFunctions
    predicate: FilterPredicate

    constructor(key: keyof typeof SingleActivityFilterFunctions) {
        this.key = key
        this.predicate = SingleActivityFilterFunctions[key]
    }

    encode(): string {
        return this.key
    }
}
