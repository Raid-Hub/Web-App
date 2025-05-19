import { useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { type z } from "zod"
import { useMutableReference } from "./useMutableReference"

interface QueryTxActions<T extends Record<string, string>> {
    set: <K extends keyof T & string>(key: K, value: T[K]) => void
    append: <K extends keyof T & string>(key: K, value: T[K]) => void
    remove: <K extends keyof T & string>(key: K, value?: T[K]) => void
    update: <K extends keyof T & string>(key: K, updater: (old?: T[K]) => T[K]) => void
    clear: () => void
}

interface QueryImmutableActions<T extends Record<string, string>> {
    get: <K extends keyof T & string, D extends T[K] | undefined = undefined>(
        key: K,
        defaultValue?: D
    ) => D extends T[K] ? T[K] : T[K] | undefined
    getAll: <K extends keyof T & string>(key: K) => T[K][]
    tx: (cb: (actions: QueryTxActions<T>) => void, opts?: { history?: boolean }) => void
    set: <K extends keyof T & string>(key: K, value: T[K], history?: boolean) => void
    append: <K extends keyof T & string>(key: K, value: T[K], history?: boolean) => void
    remove: <K extends keyof T & string>(key: K, value?: T[K], history?: boolean) => void
    update: <K extends keyof T & string>(
        key: K,
        updater: (old?: T[K]) => T[K],
        history?: boolean
    ) => void
    clear: (history?: boolean) => void
    replace: (params?: URLSearchParams, history?: boolean) => void
}

export type RaidHubQueryParams<T extends Record<string, string>> = {
    validatedSearchParams: URLSearchParams
} & QueryImmutableActions<T>

/**
 * Custom hook for managing query parameters in a URL.
 * By default, changes are not saved to the browser history.
 * You can also override the pushState behavior by passing true to the `history` parameter.
 *
 * @template T - The type of the query parameters object.
 * @returns An object with methods for manipulating query parameters.
 */
export function useQueryParams<
    T extends Record<string, string>,
    S extends { [K in keyof T]: z.ZodType<T[K]> } = { [K in keyof T]: z.ZodType<T[K]> }
>(validator?: z.ZodObject<S, z.UnknownKeysParam, z.ZodTypeAny, T, T>): RaidHubQueryParams<T> {
    const _readonlyParams = useSearchParams()
    const validatedSearchParams = new URLSearchParams(
        validator
            ? Array.from(_readonlyParams).filter(
                  ([k, v]) =>
                      validator.shape[k]?.safeParse(v).success ??
                      validator._def.unknownKeys === "passthrough"
              )
            : _readonlyParams
    )
    const mutableParams = useMutableReference(validatedSearchParams)

    const immutableActions = useMemo((): QueryImmutableActions<T> => {
        const replace = (params?: URLSearchParams, history = false) =>
            window.history[history ? "pushState" : "replaceState"](
                null,
                "",
                params ? `?${params.toString()}` : undefined
            )

        const get = <K extends keyof T & string, D extends T[K] | undefined = undefined>(
            key: K,
            defaultValue?: D
        ): D extends T[K] ? T[K] : T[K] | undefined => {
            const value = mutableParams.current.get(key) as T[K] | undefined
            return value ?? (defaultValue as D extends T[K] ? T[K] : T[K] | undefined)
        }

        const getAll = <K extends keyof T & string>(key: K) => {
            return mutableParams.current.getAll(key) as T[K][]
        }

        const txActions: QueryTxActions<T> = {
            set: (key, value) => {
                mutableParams.current.set(key, value)
            },
            append: (key, value) => {
                mutableParams.current.append(key, value)
            },
            remove: (key, value) => {
                mutableParams.current.delete(key, value)
            },
            update: (key, updater) =>
                // @ts-expect-error Wrong type
                mutableParams.current.set(key, updater(mutableParams.current.get(key) as T[K])),
            clear: () => {
                mutableParams.current = new URLSearchParams()
            }
        }

        const commit = (history?: boolean) => {
            replace(mutableParams.current, history)
        }

        return {
            get,
            getAll,
            replace,
            tx: (callback, opts) => {
                callback(txActions)
                commit(opts?.history)
            },
            set: (key, value, history) => {
                mutableParams.current.set(key, value)
                commit(history)
            },
            append: (key, value, history) => {
                mutableParams.current.append(key, value)
                commit(history)
            },
            remove: (key, value, history) => {
                mutableParams.current.delete(key, value)
                commit(history)
            },
            update: (key, updater, history) => {
                // @ts-expect-error Wrong type
                mutableParams.current.set(key, updater(mutableParams.current.get(key)))
                commit(history)
            },
            clear: history => {
                mutableParams.current = new URLSearchParams()
                commit(history)
            }
        }
    }, [mutableParams])

    return {
        validatedSearchParams,
        ...immutableActions
    }
}
