import "dotenv/config"

import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: [["list"]],
    timeout: 60_000,
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: process.env.CI ? "retain-on-failure" : "off"
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
        command: "bun run dev:e2e",
        env: {
            ...process.env,
            APP_ENV: process.env.APP_ENV ?? "local",
            AUTH_SECRET:
                process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "e2e-auth-secret",
            NEXTAUTH_SECRET:
                process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "e2e-auth-secret"
        },
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        stdout: "pipe",
        stderr: "pipe"
    }
})
