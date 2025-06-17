import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "~/shad/select"
import { FilterPresets } from "../../../lib/profile/filters/activityFilters"
import { useFilterContext } from "./FilterContext"

export const FilterSelect = () => {
    const { setFilter, filter } = useFilterContext()
    return (
        <div className="relative">
            <Select
                value={filter?.id}
                onValueChange={value => {
                    const data = FilterPresets[value as keyof typeof FilterPresets]
                    if (filter) {
                        setFilter({
                            id: value,
                            filter: data.getFilter(),
                            displayName: data.displayName
                        })
                    }
                }}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a filter" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Filters</SelectLabel>
                        {Object.entries(FilterPresets).map(([id, preset]) => (
                            <SelectItem key={id} value={id}>
                                {preset.displayName}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}
