#!/usr/bin/env bun
/**
 * Ensures vanity rewrite exclusions stay in sync with top-level app routes.
 * Run: bun scripts/check-vanity-slugs.mjs
 */
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { execSync } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const appDir = join(root, "src/app")
const configPath = join(root, "next.config.js")
const slugsPath = join(root, "routing/reserved-vanity-slugs.json")

const isGitIgnored = relativePath => {
    try {
        execSync(`git check-ignore -q ${relativePath}`, { cwd: root, stdio: "ignore" })
        return true
    } catch {
        return false
    }
}

const reserved = JSON.parse(readFileSync(slugsPath, "utf8"))
if (!Array.isArray(reserved) || reserved.some(slug => typeof slug !== "string")) {
    console.error("reserved-vanity-slugs.json must be a string array")
    process.exit(1)
}

const ignoredAppDirs = new Set(["api", "header"])

const isTrackedAppRoute = name => !isGitIgnored(`src/app/${name}`)

const topLevelAppSlugs = readdirSync(appDir, { withFileTypes: true })
    .filter(
        entry =>
            entry.isDirectory() &&
            !entry.name.startsWith("(") &&
            !ignoredAppDirs.has(entry.name) &&
            isTrackedAppRoute(entry.name) &&
            existsSync(join(appDir, entry.name, "page.tsx"))
    )
    .map(entry => entry.name)
    .sort()

const urlPrefixes = readdirSync(appDir, { withFileTypes: true })
    .filter(
        entry =>
            entry.isDirectory() &&
            !entry.name.startsWith("(") &&
            !ignoredAppDirs.has(entry.name) &&
            isTrackedAppRoute(entry.name)
    )
    .map(entry => entry.name)

const routeGroupUrlPrefixes = readdirSync(appDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith("("))
    .flatMap(groupEntry => {
        const groupDir = join(appDir, groupEntry.name)
        return readdirSync(groupDir, { withFileTypes: true })
            .filter(
                entry =>
                    entry.isDirectory() &&
                    !entry.name.startsWith("[") &&
                    existsSync(join(groupDir, entry.name, "page.tsx"))
            )
            .map(entry => entry.name)
    })

const allUrlPrefixes = [...new Set([...urlPrefixes, ...routeGroupUrlPrefixes])].sort()

const reservedSet = new Set(reserved)
const missingFromReserved = allUrlPrefixes.filter(slug => !reservedSet.has(slug))
const staleReserved = reserved.filter(slug => !allUrlPrefixes.includes(slug))

const configSource = readFileSync(configPath, "utf8")
const reservedSorted = [...reserved].sort()

let failed = false

if (missingFromReserved.length) {
    failed = true
    console.error(
        "Top-level app URL prefixes missing from routing/reserved-vanity-slugs.json:",
        missingFromReserved.join(", ")
    )
}

if (staleReserved.length) {
    failed = true
    console.error(
        "Stale entries in routing/reserved-vanity-slugs.json (no matching app folder):",
        staleReserved.join(", ")
    )
}

for (const slug of reservedSorted) {
    if (!configSource.includes("routing/reserved-vanity-slugs.json")) {
        failed = true
        console.error("next.config.js must require routing/reserved-vanity-slugs.json")
        break
    }
}

if (!configSource.includes("vanityExclusion")) {
    failed = true
    console.error("next.config.js must build vanityExclusion from reservedVanitySlugs")
}

if (topLevelAppSlugs.some(slug => !reservedSet.has(slug))) {
    failed = true
    console.error(
        "Top-level pages missing from reserved list:",
        topLevelAppSlugs.filter(slug => !reservedSet.has(slug)).join(", ")
    )
}

if (failed) {
    process.exit(1)
}

console.log(
    `Vanity slug check OK (${reserved.length} reserved, ${topLevelAppSlugs.length} top-level pages)`
)
