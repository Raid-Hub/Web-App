// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require("@sentry/nextjs")
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true"
})

const nextConfig = {
    experimental: {
        ppr: true
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
        NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
        NEXT_PUBLIC_APP_ENV: process.env.APP_ENV
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
            source: "/:vanity([a-zA-Z0-9]+)"
        }
    ]
}

module.exports = withSentryConfig(withBundleAnalyzer(nextConfig), {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: !process.env.CI,
    widenClientFileUpload: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true
})
