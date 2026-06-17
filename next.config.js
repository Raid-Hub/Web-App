// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require("@sentry/nextjs")
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true"
})

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        // Disabled: experimental React + PPR causes client DOM reconciliation errors on profile/vanity/PGCR routes.
        serverComponentsExternalPackages: ["supports-color"]
    },
    reactStrictMode: false,
    compiler: {
        styledComponents: true
    },
    env: {
        APP_ENV: process.env.APP_ENV,
        APP_VERSION: process.env.APP_VERSION,
        BUNGIE_API_KEY: process.env.BUNGIE_API_KEY,
        RAIDHUB_API_URL: process.env.RAIDHUB_API_URL ?? "https://api.raidhub.io",
        RAIDHUB_API_KEY: process.env.RAIDHUB_API_KEY,
        SENTRY_DSN: process.env.SENTRY_DSN,
        NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
        SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
        SENTRY_RELEASE: process.env.SENTRY_RELEASE
    },
    images: {
        remotePatterns: [
            /** Only optimize images from our cdn */
            {
                protocol: "https",
                hostname: "cdn.raidhub.io"
            }
        ]
    },
    redirects: async () => {
        return [
            // Old profile URL with membershipType
            {
                source: "/profile/:membershipType/:destinyMembershipId",
                destination: "/profile/:destinyMembershipId",
                permanent: true
            },
            // Next Auth does not let us remove /api from the URL
            {
                source: "/api/auth/error",
                destination: "/auth/error",
                permanent: true
            }
        ]
    },
    rewrites: () => [
        {
            destination: "/user/:vanity",
            // Exclude reserved slugs that have their own filesystem routes (e.g. /checkpoints, /calendar).
            source: "/:vanity((?!checkpoints$|calendar$)[a-zA-Z0-9]+)"
        }
    ]
}

module.exports = withSentryConfig(withBundleAnalyzer(nextConfig), {
    silent: !process.env.CI,
    widenClientFileUpload: true
})
