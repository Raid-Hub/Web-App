import { FilterPresets } from "../../../lib/profile/filters/activityFilters"
import { useFilterContext } from "./FilterContext"

export const FilterSelect = () => {
    const { setFilter, filter } = useFilterContext()
    return (
        <select
            value={filter?.id}
            onChange={event => {
                const data = FilterPresets[event.target.value as keyof typeof FilterPresets]
                if (filter) {
                    setFilter({
                        id: event.target.value,
                        filter: data.getFilter(),
                        displayName: data.displayName
                    })
                }
            }}>
            {Object.entries(FilterPresets).map(([id, preset]) => (
                <option key={id} value={id}>
                    {preset.displayName}
                </option>
            ))}
        </select>
    )
}
