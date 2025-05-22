"use client"

import { Collection } from "@discordjs/collection"
import { useMutation, useQuery } from "@tanstack/react-query"
import { getDestinyManifest } from "bungie-net-core/endpoints/Destiny2"
import Dexie from "dexie"
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { useInterval } from "~/hooks/util/useInterval"
import { useLocalStorage } from "~/hooks/util/useLocalStorage"
import { type BungiePlatformError } from "~/models/BungieAPIError"
import {
    DB_VERSION,
    useDexie,
    type CustomDexieTable,
    type CustomDexieTableDefinition
} from "~/util/dexie/dexie"
import { ManifestStatusOverlay } from "../overlays/ManifestStatusOverlay"
import { useLocale } from "./LocaleManager"
import { useBungieClient } from "./session/BungieClientProvider"

const KEY_MANIFEST_VERSION = "d2_manifest_version"

/**
 * The in-memory cache object that stores collections of data from each table.
 */
type DefinitionsCache = {
    [K in CustomDexieTable]: Collection<number, CustomDexieTableDefinition<K>>
}
const DefinitionsCacheContext = createContext<DefinitionsCache | undefined>(undefined)

const DestinyManifestManager = ({ children }: { children: ReactNode }) => {
    const [manifestVersion, setManifestVersion] = useLocalStorage<string | null>(
        KEY_MANIFEST_VERSION,
        null
    )
    const { manifestLanguage } = useLocale()
    const client = useBungieClient()
    const dexieDB = useDexie()
    const [cache, updateCache] = useState(
        () =>
            Object.fromEntries(
                dexieDB.allTables.map(table => [table, new Collection()])
            ) as DefinitionsCache
    )

    const seedCache = useCallback(
        <K extends CustomDexieTable>([table, values]: [
            table: K,
            values: CustomDexieTableDefinition<K>[]
        ]) => {
            updateCache(prevState => ({
                ...prevState,
                [table]: new Collection(values.map(v => [v.hash, v]))
            }))
        },
        []
    )

    const { mutateAsync: storeManifest, ...mutationState } = useMutation({
        mutationFn: (args: Parameters<typeof dexieDB.updateDefinitions>[1]) =>
            dexieDB.updateDefinitions(seedCache, args),
        onSuccess: setManifestVersion,
        onError: async (err: Error | Error[]) => {
            setManifestVersion(null)
            console.warn(
                `Failed to store the Destiny 2 manifest definitions with error(s): ${
                    Array.isArray(err)
                        ? "\n" + err.map((e, idx) => `${idx + 1}. ${e.message}`).join(",\n")
                        : err.message
                }.`
            )

            if (
                (Array.isArray(err) ? err : [err]).some(
                    e => e instanceof Dexie.DexieError || e.message.includes("Dexie")
                )
            ) {
                // Force a reset if there was a dexie related error
                try {
                    await dexieDB.delete()
                } catch (err) {
                    console.error("Failed to reset the Dexie database", err)
                }
            }
        }
    })

    const queryState = useQuery({
        queryKey: ["bungie", "manifest", manifestLanguage],
        queryFn: () => getDestinyManifest(client).then(res => res.Response),
        suspense: false,
        enabled: manifestVersion !== undefined,
        staleTime: 3600_000, // 1 hour
        refetchInterval: 3600_000,
        refetchIntervalInBackground: false,
        retry: (failureCount, error: BungiePlatformError) =>
            error.ErrorCode === 5 || failureCount < 2,
        retryDelay: failureCount => Math.min(2 ** failureCount * 5000, 600_000),
        onSuccess: async manifest => {
            const newManifestVersion = [manifest.version, manifestLanguage, DB_VERSION].join("::")

            if (
                manifestVersion !== newManifestVersion ||
                // Check if any of the tables are empty
                (
                    await Promise.all(
                        dexieDB.allTables.map(tableName => dexieDB[tableName].limit(1).first())
                    ).catch(err => {
                        console.error("Failed to check if tables are empty", err)
                        return []
                    })
                ).reduce((acc, val) => (acc += +(val !== undefined)), 0) !==
                    dexieDB.allTables.length
            ) {
                await storeManifest({
                    newManifestVersion,
                    client,
                    manifest,
                    language: manifestLanguage
                })
            }
        },
        onError: (e: Error) => {
            console.error(
                `Failed to download Destiny 2 manifest: ${e.message} ${
                    manifestVersion ? "Using cached version." : "No cached version available."
                }`
            )
        }
    })

    useInterval(600_000, () => {
        // Silently clear the cache without affecting the state
        if (!mutationState.isError && !queryState.isError) {
            Object.values(cache).forEach(collection => {
                collection.clear()
            })
        }
    })

    useEffect(() => {
        dexieDB.on("close", () => setManifestVersion(null))
    }, [dexieDB, setManifestVersion])

    return (
        <DefinitionsCacheContext.Provider value={cache}>
            {queryState.isFetching && queryState.failureCount < 1 ? (
                <ManifestStatusOverlay status="bungie-loading" />
            ) : mutationState.isLoading ? (
                <ManifestStatusOverlay status="dexie-loading" />
            ) : queryState.isError ? (
                <ManifestStatusOverlay status="bungie-error" error={queryState.error} />
            ) : mutationState.isError ? (
                <ManifestStatusOverlay status="dexie-error" error={mutationState.error} />
            ) : null}
            {children}
        </DefinitionsCacheContext.Provider>
    )
}

export const useDefinitionsCache = <K extends CustomDexieTable>(table: K) => {
    const cache = useContext(DefinitionsCacheContext)
    if (!cache) throw new Error("useDefinitionsCache must be used within a DestinyManifestManager")

    return cache[table]
}

export default DestinyManifestManager
