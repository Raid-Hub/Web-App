import { useCallback, useMemo } from "react"
import Hunter from "~/components/icons/Hunter"
import QuestionMark from "~/components/icons/QuestionMark"
import Titan from "~/components/icons/Titan"
import Warlock from "~/components/icons/Warlock"
import { useClassDefinition } from "~/hooks/dexie"

export const useCharacterClass = (classHash: number | string) => {
    const characterClass = useClassDefinition(classHash)

    return useMemo(() => {
        switch (characterClass?.classType) {
            case 0:
                return Titan
            case 1:
                return Hunter
            case 2:
                return Warlock
            default:
                return QuestionMark
        }
    }, [characterClass])
}

export const useGetCharacterClass = () => {
    return useCallback((classHash: number | null): [typeof Titan, string] => {
        switch (classHash) {
            case 3655393761:
                return [Titan, "Titan"]
            case 671679327:
                return [Hunter, "Hunter"]
            case 2271682572:
                return [Warlock, "Warlock"]
            default:
                return [QuestionMark, "Unknown"]
        }
    }, [])
}
