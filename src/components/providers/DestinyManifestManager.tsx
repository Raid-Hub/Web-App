"use client"

import { Collection } from "@discordjs/collection"
import { useMutation, useQuery } from "@tanstack/react-query"
import { getDestinyManifest } from "bungie-net-core/endpoints/Destiny2"
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { useInterval } from "~/hooks/util/useInterval"
import { useLocalStorage } from "~/hooks/util/useLocalStorage"
import { sentryOptionalQueryMeta } from "~/lib/sentry/react-query"
import { type BungiePlatformError } from "~/models/BungieAPIError"
import {
    DB_VERSION,
    isDexieConnectionLostError,
    recoverDexieDatabase,
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

    const { mutateAsync: storeManifest, ...mutationState } = useMutation<
        string,
        Error,
        Parameters<typeof dexieDB.updateDefinitions>[1]
    >({
        mutationFn: (args: Parameters<typeof dexieDB.updateDefinitions>[1]) =>
            dexieDB.updateDefinitions(seedCache, args),
        meta: sentryOptionalQueryMeta,
        onSuccess: setManifestVersion,
        onError: async (err: Error) => {
            if (isDexieConnectionLostError(err)) {
                try {
                    await recoverDexieDatabase(dexieDB)
                } catch (recoveryError) {
                    console.error(
                        "Failed to recover Dexie database after connection loss",
                        recoveryError
                    )
                }
                return
            }

            const errors =
                err instanceof AggregateError
                    ? err.errors.filter((e): e is Error => e instanceof Error)
                    : err instanceof Error
                      ? [err]
                      : []

            if (
                errors.some(
                    e => e.name === "InvalidStateError" && e.message.includes("IDBTransaction")
                )
            ) {
                return
            }

            setManifestVersion(null)
            console.warn(
                `Failed to store the Destiny 2 manifest definitions with error(s): ${
                    errors.length
                        ? "\n" + errors.map((e, idx) => `${idx + 1}. ${e.message}`).join(",\n")
                        : String(err)
                }.`
            )

            if (errors.some(e => e.name.startsWith("Dexie") || e.message.includes("Dexie"))) {
                try {
                    await dexieDB.delete()
                    await dexieDB.open()
                } catch (resetError) {
                    console.error("Failed to reset the Dexie database", resetError)
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
        const onClose = () => {
            setManifestVersion(null)
            void recoverDexieDatabase(dexieDB).catch(error => {
                console.error("Failed to recover Dexie database after close", error)
            })
        }

        dexieDB.on("close", onClose)
        return () => {
            dexieDB.on("close").unsubscribe(onClose)
        }
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
