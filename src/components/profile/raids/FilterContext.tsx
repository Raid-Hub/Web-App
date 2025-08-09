import {
    createContext,
    useContext,
    useEffect,
    useReducer,
    useState,
    type Dispatch,
    type ReactNode
} from "react"
import {
    FilterPresets,
    decodeFilters,
    type ActivityFilter
} from "~/lib/profile/filters/activityFilters"

const FilterContext = createContext<
    | {
          filter: FilterData | null
          setFilter: Dispatch<FilterData | null>
          isMounted: boolean
      }
    | undefined
>(undefined)

export const useFilterContext = () => {
    const ctx = useContext(FilterContext)
    if (!ctx) throw new Error("No FilterContext found")
    return ctx
}

type FilterData = {
    filter: ActivityFilter
    displayName: string
    id: string
}

type EncodedFilterData = {
    encoded: string
    displayName: string
    id: string
}

/**
 * Saves the activity filter to local storage.
 *
 * @param _ - The previous activity filter.
 * @param filter - The new activity filter to save.
 * @returns The saved activity filter.
 */
const saveFilter = (_: FilterData | null, data: FilterData | null) => {
    localStorage.setItem(
        KEY_ACTIVITY_FILTER,
        JSON.stringify(
            data
                ? {
                      encoded: data.filter.encode(),
                      displayName: data.displayName,
                      id: data.id
                  }
                : null
        )
    )
    return data
}

/**
 * Provides the context for filtering activities.
 * @param children - The child components.
 * @returns The filtered activities context provider.
 */
export const FilterContextProvider = ({ children }: { children: ReactNode }) => {
    const [data, setFilterData] = useReducer(saveFilter, undefined, () => ({
        id: "Default",
        displayName: FilterPresets.Default.displayName,
        filter: FilterPresets.Default.getFilter()
    }))
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        const allFilters = localStorage.getItem(KEY_ACTIVITY_FILTER)
        if (allFilters !== null) {
            try {
                const fromStore = JSON.parse(allFilters) as EncodedFilterData
                const cached = decodeFilters(fromStore.encoded)
                if (cached) {
                    setFilterData({
                        id: fromStore.id,
                        displayName: fromStore.displayName,
                        filter: cached
                    })
                } else {
                    setFilterData(null)
                }
            } catch (e) {
                console.error(e)
            }
        }
        setIsMounted(true)
    }, [])

    return (
        <FilterContext.Provider
            value={{
                setFilter: setFilterData,
                filter: data,
                isMounted
            }}>
            {children}
        </FilterContext.Provider>
    )
}

export const KEY_ACTIVITY_FILTER = "profile_activity_filter_v2"
