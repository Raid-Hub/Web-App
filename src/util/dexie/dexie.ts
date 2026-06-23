/**
 * @fileoverview This file contains the definition of a custom Dexie class and utility functions for querying data from the Dexie database.
 * @module util/dexie
 */

import { getClanBannerSource } from "bungie-net-core/endpoints/Destiny2"
import { getDestinyManifestComponent, type DestinyManifestLanguage } from "bungie-net-core/manifest"
import type {
    ClanBannerSource,
    DestinyActivityDefinition,
    DestinyActivityModeDefinition,
    DestinyActivityModifierDefinition,
    DestinyClassDefinition,
    DestinyInventoryItemDefinition,
    DestinyManifest,
    DestinyMilestoneDefinition,
    DestinySeasonDefinition
} from "bungie-net-core/models"
import Dexie from "dexie"
import type ClientBungieClient from "~/services/bungie/ClientBungieClient"
import { type Prettify, type RGBA } from "~/types/generic"
import { o } from "../o"

/**
 * The version of the Dexie database.
 */
export const DB_VERSION = 10

/**
 * The list of table names in the Dexie database.
 */
const manifestTables = [
    "items",
    "activities",
    "activityModes",
    "activityModifiers",
    "seasons",
    "characterClasses",
    "milestones"
] as const

const clanBannerTables = [
    "clanBannerDecalPrimaryColors",
    "clanBannerDecalSecondaryColors",
    "clanBannerDecals",
    "clanBannerDecalsSquare",
    "clanBannerGonfalonColors",
    "clanBannerGonfalonDetailColors",
    "clanBannerGonfalonDetails",
    "clanBannerGonfalonDetailsSquare",
    "clanBannerGonfalons"
] as const

/**
 * Represents an object with a hash property.
 */
type Hashed<T> = { hash: number } & T

/**
 * Represents the paths for the foreground and background clan banner images.
 */
type ForegroundBackground = {
    foregroundPath: string
    backgroundPath: string
}

declare module "bungie-net-core/models" {
    interface ClanBannerSource {
        clanBannerDecals: Record<string, ForegroundBackground>
        clanBannerDecalPrimaryColors: Record<string, RGBA>
        clanBannerDecalSecondaryColors: Record<string, RGBA>
        clanBannerGonfalons: Record<string, string>
        clanBannerGonfalonColors: Record<string, RGBA>
        clanBannerGonfalonDetails: Record<string, string>
        clanBannerGonfalonDetailColors: Record<string, RGBA>
        clanBannerDecalsSquare: Record<string, ForegroundBackground>
        clanBannerGonfalonDetailsSquare: Record<string, string>
    }
}

export type CustomDexieTable =
    | (keyof CustomDexie & (typeof manifestTables)[number])
    | (typeof clanBannerTables)[number]

export type CustomDexieTableDefinition<K extends CustomDexieTable> =
    CustomDexie[K] extends Dexie.Table<infer T> ? Hashed<T> : never

/**
 * Represents the Dexie tables.
 */
type Tables = Readonly<
    Record<
        (typeof manifestTables)[number] | (typeof clanBannerTables)[number],
        Dexie.Table<{
            hash: number
        }>
    >
>

/**
 * Custom Dexie class that extends the Dexie class and implements the Tables interface.
 */
class CustomDexie extends Dexie implements Tables {
    readonly allTables = [...manifestTables, ...clanBannerTables]
    items!: Dexie.Table<DestinyInventoryItemDefinition>
    activities!: Dexie.Table<DestinyActivityDefinition>
    activityModes!: Dexie.Table<DestinyActivityModeDefinition>
    activityModifiers!: Dexie.Table<DestinyActivityModifierDefinition>
    seasons!: Dexie.Table<DestinySeasonDefinition>
    characterClasses!: Dexie.Table<DestinyClassDefinition>
    milestones!: Dexie.Table<Hashed<DestinyMilestoneDefinition>>
    clanBannerDecalPrimaryColors!: Dexie.Table<Hashed<RGBA>>
    clanBannerDecalSecondaryColors!: Dexie.Table<Hashed<RGBA>>
    clanBannerDecals!: Dexie.Table<Hashed<ForegroundBackground>>
    clanBannerDecalsSquare!: Dexie.Table<Hashed<ForegroundBackground>> // unused
    clanBannerGonfalonColors!: Dexie.Table<Hashed<RGBA>>
    clanBannerGonfalonDetailColors!: Dexie.Table<Hashed<RGBA>>
    clanBannerGonfalonDetails!: Dexie.Table<Hashed<{ value: string }>>
    clanBannerGonfalonDetailsSquare!: Dexie.Table<Hashed<{ value: string }>> // unused
    clanBannerGonfalons!: Dexie.Table<Hashed<{ value: string }>>

    constructor() {
        super("app")
        this.version(DB_VERSION).stores(
            o.fromEntries(this.allTables.map(table => [table, "hash"] as const))
        )
    }

    public updateDefinitions = async (
        dispatch: <K extends CustomDexieTable>([table, values]: [
            table: K,
            values: CustomDexieTableDefinition<K>[]
        ]) => void,
        {
            newManifestVersion,
            client,
            manifest,
            language
        }: {
            newManifestVersion: string
            client: ClientBungieClient
            manifest: DestinyManifest
            language: DestinyManifestLanguage
        }
    ) => {
        if (!isIndexedDBAvailable()) {
            return this.updateDefinitionsInMemoryOnly(dispatch, {
                newManifestVersion,
                client,
                manifest,
                language
            })
        }

        const allSettled = await Promise.allSettled([
            getDestinyManifestComponent(client, {
                destinyManifest: manifest,
                tableName: "DestinyInventoryItemLiteDefinition",
                language: language
            }).then(items =>
                this.transaction("rw", this.items, async () => {
                    const itemsWithHashes = Object.entries(items)
                        // Weapon & Emblems
                        .filter(([, item]) => item.itemType === 3 || item.itemType === 14)
                        .map(([hash, item]) => ({
                            ...item,
                            hash: Number(hash)
                        }))
                    dispatch(["items", itemsWithHashes])
                    await this.items.clear()
                    return this.items.bulkPut(itemsWithHashes)
                })
            ),

            getDestinyManifestComponent(client, {
                destinyManifest: manifest,
                tableName: "DestinyActivityDefinition",
                language: language
            }).then(activities => {
                const values = Object.values(activities)
                dispatch(["activities", values])

                return this.transaction("rw", this.activities, () =>
                    this.activities.bulkPut(values)
                )
            }),

            getDestinyManifestComponent(client, {
                destinyManifest: manifest,
                tableName: "DestinyActivityModeDefinition",
                language: language
            }).then(modes => {
                const values = Object.values(modes)
                dispatch(["activityModes", values])
                return this.transaction("rw", this.activityModes, () =>
                    this.activityModes.bulkPut(values)
                )
            }),

            getDestinyManifestComponent(client, {
                destinyManifest: manifest,
                tableName: "DestinySeasonDefinition",
                language: language
            }).then(seasons => {
                const values = Object.values(seasons)
                dispatch(["seasons", values])
                return this.transaction("rw", this.seasons, () => this.seasons.bulkPut(values))
            }),

            getDestinyManifestComponent(client, {
                destinyManifest: manifest,
                tableName: "DestinyActivityModifierDefinition",
                language: language
            }).then(modifiers => {
                const values = Object.values(modifiers)
                dispatch(["activityModifiers", values])
                return this.transaction("rw", this.activityModifiers, () =>
                    this.activityModifiers.bulkPut(values)
                )
            }),

            getDestinyManifestComponent(client, {
                destinyManifest: manifest,
                tableName: "DestinyClassDefinition",
                language: language
            }).then(classes => {
                const values = Object.values(classes)
                dispatch(["characterClasses", values])
                return this.transaction("rw", this.characterClasses, () =>
                    this.characterClasses.bulkPut(values)
                )
            }),

            getDestinyManifestComponent(client, {
                destinyManifest: manifest,
                tableName: "DestinyMilestoneDefinition",
                language: language
            }).then(milestones => {
                const values = Object.values(milestones)
                dispatch(["milestones", values])
                return this.transaction("rw", this.milestones, () =>
                    this.milestones.bulkPut(values)
                )
            }),

            getClanBannerSource(client).then(response => {
                const banners = response.Response
                const hash = <K extends keyof ClanBannerSource>(key: K) =>
                    o.entries(banners[key]).map(([hash, def]) =>
                        typeof def === "string"
                            ? { hash: Number(hash), value: def }
                            : {
                                  hash: Number(hash),
                                  ...(def as Prettify<
                                      ClanBannerSource[K][keyof ClanBannerSource[K]]
                                  >)
                              }
                    )

                const clanBannerTableKeys = Object.keys(banners) as (keyof ClanBannerSource)[]

                return this.transaction(
                    "rw",
                    clanBannerTableKeys.map(key => this[key]),
                    () =>
                        Promise.all(
                            clanBannerTableKeys.map(key => {
                                const data = hash(key)
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                                return (
                                    this[key]
                                        // @ts-expect-error Can't type this
                                        .bulkPut(data)
                                )
                            })
                        )
                )
            })
        ] as const)

        // Handle errors
        const errors = allSettled.filter((r): r is PromiseRejectedResult => r.status === "rejected")

        if (!errors.length) {
            return newManifestVersion
        }

        const rejected = errors.map(result =>
            result.reason instanceof Error ? result.reason : new Error(String(result.reason))
        )

        if (rejected.length === 1) {
            throw rejected[0]
        }

        throw new AggregateError(rejected, "Destiny manifest update failed")
    }

    /** Populate in-memory manifest cache when IndexedDB is unavailable (PS5, strict privacy). */
    private updateDefinitionsInMemoryOnly = async (
        dispatch: <K extends CustomDexieTable>([table, values]: [
            table: K,
            values: CustomDexieTableDefinition<K>[]
        ]) => void,
        {
            newManifestVersion,
            client,
            manifest,
            language
        }: {
            newManifestVersion: string
            client: ClientBungieClient
            manifest: DestinyManifest
            language: DestinyManifestLanguage
        }
    ) => {
        await Promise.all([
            getDestinyManifestComponent(client, {
                destinyManifest: manifest,
                tableName: "DestinyInventoryItemLiteDefinition",
                language
            }).then(items => {
                const itemsWithHashes = Object.entries(items)
                    .filter(([, item]) => item.itemType === 3 || item.itemType === 14)
                    .map(([hash, item]) => ({
                        ...item,
                        hash: Number(hash)
                    }))
                dispatch(["items", itemsWithHashes])
            }),

            getDestinyManifestComponent(client, {
                destinyManifest: manifest,
                tableName: "DestinyActivityDefinition",
                language
            }).then(activities => {
                dispatch(["activities", Object.values(activities)])
            }),

            getDestinyManifestComponent(client, {
                destinyManifest: manifest,
                tableName: "DestinyActivityModeDefinition",
                language
            }).then(modes => {
                dispatch(["activityModes", Object.values(modes)])
            }),

            getDestinyManifestComponent(client, {
                destinyManifest: manifest,
                tableName: "DestinySeasonDefinition",
                language
            }).then(seasons => {
                dispatch(["seasons", Object.values(seasons)])
            }),

            getDestinyManifestComponent(client, {
                destinyManifest: manifest,
                tableName: "DestinyActivityModifierDefinition",
                language
            }).then(modifiers => {
                dispatch(["activityModifiers", Object.values(modifiers)])
            }),

            getDestinyManifestComponent(client, {
                destinyManifest: manifest,
                tableName: "DestinyClassDefinition",
                language
            }).then(classes => {
                dispatch(["characterClasses", Object.values(classes)])
            }),

            getDestinyManifestComponent(client, {
                destinyManifest: manifest,
                tableName: "DestinyMilestoneDefinition",
                language
            }).then(milestones => {
                dispatch(["milestones", Object.values(milestones)])
            }),

            getClanBannerSource(client).then(response => {
                const banners = response.Response
                const hash = <K extends keyof ClanBannerSource>(key: K) =>
                    o.entries(banners[key]).map(([hash, def]) =>
                        typeof def === "string"
                            ? { hash: Number(hash), value: def }
                            : {
                                  hash: Number(hash),
                                  ...(def as Prettify<
                                      ClanBannerSource[K][keyof ClanBannerSource[K]]
                                  >)
                              }
                    )

                for (const key of Object.keys(banners) as (keyof ClanBannerSource)[]) {
                    dispatch([key as CustomDexieTable, hash(key)] as [
                        CustomDexieTable,
                        CustomDexieTableDefinition<CustomDexieTable>[]
                    ])
                }
            })
        ])

        return newManifestVersion
    }
}

export function isIndexedDBAvailable(): boolean {
    try {
        return typeof indexedDB !== "undefined" && indexedDB !== null
    } catch {
        return false
    }
}

export function isDexieManifestStorageError(err: unknown): boolean {
    const message = err instanceof Error ? err.message : String(err)
    const name = err instanceof Error ? err.name : ""

    return (
        name === "BulkError" ||
        name === "MissingAPIError" ||
        name === "TypeError" ||
        message.includes("Destiny manifest update failed") ||
        message.includes("bulkPut()") ||
        message === "e is undefined" ||
        message === "r is undefined"
    )
}

export function isDexieConnectionLostError(err: unknown): boolean {
    const errors: unknown[] =
        err instanceof AggregateError
            ? Array.from(err.errors)
            : Array.isArray(err)
              ? err
              : err
                ? [err]
                : []

    return errors.some(error => {
        if (!(error instanceof Error)) return false

        return (
            error.name === "DatabaseClosedError" ||
            error.name === "InvalidStateError" ||
            error.message.includes("DatabaseClosedError") ||
            error.message.includes("Connection to Indexed Database server lost")
        )
    })
}

export async function recoverDexieDatabase(db: CustomDexie): Promise<void> {
    if (!isIndexedDBAvailable()) {
        return
    }

    try {
        if (!db.isOpen()) {
            await db.open()
        }
    } catch (error) {
        if (error instanceof DOMException && error.name === "SecurityError") {
            return
        }

        try {
            await db.delete()
            await db.open()
        } catch {
            // IndexedDB blocked (private mode, cross-origin iframe, etc.) — manifest stays in-memory.
        }
    }
}

const dexieDB = new CustomDexie()

if (typeof window !== "undefined") {
    window.addEventListener("unhandledrejection", event => {
        if (
            !isDexieManifestStorageError(event.reason) &&
            !isDexieConnectionLostError(event.reason)
        ) {
            return
        }

        event.preventDefault()
        console.warn("Dexie unhandled rejection — recovering in-memory", event.reason)
        void recoverDexieDatabase(dexieDB)
    })
}

export const useDexie = () => {
    return dexieDB
}
