import { expect, test } from "@playwright/test"

import { E2E_PGCR_INSTANCE_ID } from "./constants"

/** Default multi for E2E; override with `E2E_MULTI_ID`. */
const DEFAULT_E2E_MULTI_ID = "01KNYVV8NXWK2P4188VNQZTZJM"

test.describe("raidhub", () => {
    test("home responds", async ({ page }) => {
        const res = await page.goto("/")
        expect(res?.ok()).toBeTruthy()
    })

    test("faq loads with content", async ({ page }) => {
        await page.goto("/faq")
        await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 30_000 })
    })

    test("pgcr: invalid instance id shows not found", async ({ page }) => {
        await page.goto("/pgcr/not-a-valid-instance-id", { waitUntil: "domcontentloaded" })
        await expect(page.getByText("Not found :(")).toBeVisible({ timeout: 30_000 })
    })

    test("pgcr: resolved instance shows Summary", async ({ page }) => {
        await page.goto(`/pgcr/${E2E_PGCR_INSTANCE_ID}`, { waitUntil: "domcontentloaded" })
        await expect(page.getByRole("heading", { name: "Summary", exact: false })).toBeVisible({
            timeout: 60_000
        })
    })

    test("multi: merged PGCR shows Summary", async ({ page }) => {
        const multiId = process.env.E2E_MULTI_ID ?? DEFAULT_E2E_MULTI_ID
        await page.goto(`/multi/${multiId}`, { waitUntil: "domcontentloaded" })
        await expect(page.getByRole("heading", { name: "PGCR Multi-View" })).toBeVisible({
            timeout: 30_000
        })
        await expect(page.getByRole("heading", { name: "Summary", exact: false })).toBeVisible({
            timeout: 120_000
        })
    })
})
