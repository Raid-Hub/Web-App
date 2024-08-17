# Setup

Clone the project and then

1. `bun install`
2. `cp example.env .env`
3. `bun dev`

# Deployments

TBD

# Tech Stack

-   Framework: Next.js + React
-   Component/CSS Libraries: Styled Components
-   Other libraries: [React Query v4](https://tanstack.com/query/v4/docs/framework/react/overview), Bungie.net Core, dexie db, framer motion
-   Host: Vercel
-   CDN: AWS S3, Cloudflare
-   ORM: Prisma
-   Database Provider: Turso

# Developer Guidelines

All PRs will fail if prettier is not run before submitting (I recommend the VScode extension). They will also fail if the linter fails, so run `bun lint` before pushing/creating your PR.

To be honest, there is not a lot of documentation. My bad (owen), but if you have any questions I can answer and provide some docs where needed.

# Routing

There is a ton of emphasis on how routing is done in this project, hence the choice of Next.js. I firmly believe the better the experience is on our site when it comes to page loading and navigation, the more likely a user will be to continue using it. The main principles this site abides by:

-   FCP (First contentful paint) is incredibly important. We can reduce time to FCP by using client-side navigation wherever possible.
-   LCP (Largest contentful paint) is also incredibly important. We can reduce time to LCP by implementing agressive caching.
-   Server side rendering is important for some but not all pages. If metadata is needed for the SEO of a page, then that page should he server-rendered with data.

Note that there are always trade-offs to be made. Because we are using partial pre-rendering (see `next.config.js`), there are no truly static routes. In order to force some common routes such as `leaderboards`, we use `export const dynamic = "force-static"`, Static pages cannot have dynamic elements such as a `session` attached. (See the docs on this [here](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic).) This means all static pages will be served faster, however, once loaded, the user will have to fetch their session client side, adding an extra rount trip.

## Routing Examples

`/leaderboards` - These pages are created with incremental static regeneration (ISR) with client side revalidation. We use `export const dynamic = "force-static"` to ensure these pages are statically cached. `searchParams` are also not rendered on static content which means no matter which page the user fetches, we will always statically serve page 1. This means we need to handle this logic appropriately. Because the page is static, that means that we are often serving stale data. That's where `useQuery` comes into play. We can serve the static data initially, revalidated every 15 minutes, and then refetch client side. This improves SEO.

## Notable files

-   `types/genertic.ts` - Generic utility types
-   `services/raidhub/openapi.d.ts` - Auto-generated file using the openapi spec from RaidHub. Generated by `bun docs` or `bun docs:dev`
