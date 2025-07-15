"use client"

import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react"

const SearchContext = createContext<[boolean, Dispatch<SetStateAction<boolean>>] | undefined>(
    undefined
)

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
    const state = useState(false)
    return <SearchContext.Provider value={state}>{children}</SearchContext.Provider>
}

export const useSearchContext = () => {
    const context = useContext(SearchContext)
    if (!context) {
        throw new Error("useSearchContext must be used within a SearchProvider")
    }
    return context
}
