import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react"
import { safeGetItem, safeSetItem } from "~/lib/storage/safeStorage"

export { safeGetItem, safeRemoveItem, safeSetItem } from "~/lib/storage/safeStorage"

export const useLocalStorage = <V extends string | boolean | number | object | null>(
    key: string,
    defaultValue: V | (() => V)
): [V, Dispatch<SetStateAction<V>>] => {
    const [_value, setValue] = useState<V>(defaultValue)

    useEffect(() => {
        const fromStore = safeGetItem(key)
        const getDefault = () => (defaultValue instanceof Function ? defaultValue() : defaultValue)
        const parse = (value: string) => {
            try {
                return JSON.parse(value) as V
            } catch {
                return getDefault()
            }
        }
        setValue(fromStore ? parse(fromStore) : getDefault())
    }, [key, defaultValue])

    const save = useCallback(
        (value: SetStateAction<V>) => {
            setValue(old => {
                const toSave = value instanceof Function ? value(old) : value
                safeSetItem(key, JSON.stringify(toSave))
                return toSave
            })
        },
        [key]
    )

    return [_value, save]
}

export const useLocalStorageObject = <V>(args: {
    storageKey: string
    paramKey: string
    defaultValue: V
}): [V, (value: V | ((old: V) => V)) => void, Record<string, V>] => {
    const [_value, setValue] = useState<V>(args.defaultValue)
    const [store, setStore] = useState<Record<string, V>>({ [args.paramKey]: args.defaultValue })

    useEffect(() => {
        const fromStore = safeGetItem(args.storageKey)
        const parsed = fromStore ? (JSON.parse(fromStore) as Record<string, V>) : {}
        if (args.paramKey in parsed) {
            setValue(fromStore ? parsed[args.paramKey] : args.defaultValue)
        }
    }, [args.paramKey, args.storageKey, args.defaultValue])

    const save = (value: V | ((old: V) => V)) => {
        const toSave = typeof value === "function" ? (value as (old: V) => V)(_value) : value
        const currStore = safeGetItem(args.storageKey)
        const newValue = {
            ...(currStore ? (JSON.parse(currStore) as Record<string, V>) : {}),
            [args.paramKey]: toSave
        }
        safeSetItem(args.storageKey, JSON.stringify(newValue))
        setValue(toSave)
        setStore(newValue)
    }

    return [_value, save, store]
}
