import { type PromiseExtended } from "dexie"
import { useLiveQuery } from "dexie-react-hooks"
import { useMemo } from "react"
import { useDefinitionsCache } from "~/components/providers/DestinyManifestManager"
import {
    isIndexedDBAvailable,
    useDexie,
    type CustomDexieTable,
    type CustomDexieTableDefinition
} from "./dexie"

/**
 * Custom hook for querying a single item from the Dexie database with in-memory caching.
 * @param table - The name of the table to query.
 * @param hash - The hash of the item to query.
 * @returns The queried item or null if not found.
 */
export const useDexieGetQuery = <K extends CustomDexieTable>(table: K, hash: number) => {
    const idbAvailable = isIndexedDBAvailable()
    const dexieDB = useDexie()
    const cache = useDefinitionsCache(table)

    const liveQuery = useLiveQuery(
        () => {
            if (!idbAvailable) {
                return undefined
            }

            return (
                dexieDB[table].get({ hash: hash }) as PromiseExtended<
                    CustomDexieTableDefinition<K> | undefined
                >
            ).catch(() => undefined)
        },
        [hash, idbAvailable, table],
        undefined
    )

    return useMemo(() => {
        if (liveQuery) {
            cache.set(liveQuery.hash, liveQuery)
        }

        return cache.get(hash) ?? null
    }, [liveQuery, cache, hash])
}
