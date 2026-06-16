import { FilterPresets } from "~/lib/profile/filters/activityFilters"
import { cn } from "~/lib/tw"
import { useFilterContext } from "./FilterContext"

export const FilterSelect = () => {
    const { setFilter, filter } = useFilterContext()

    return (
        <select
            aria-label="Activity filter"
            className={cn(
                "border-input focus-visible:border-ring focus-visible:ring-ring/50",
                "h-9 w-[180px] rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs",
                "outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            )}
            value={filter?.id ?? "Default"}
            onChange={event => {
                const value = event.target.value as keyof typeof FilterPresets
                const preset = FilterPresets[value]
                if (!preset) return

                setFilter({
                    id: value,
                    filter: preset.getFilter(),
                    displayName: preset.displayName
                })
            }}>
            {Object.entries(FilterPresets).map(([id, preset]) => (
                <option key={id} value={id}>
                    {preset.displayName}
                </option>
            ))}
        </select>
    )
}
