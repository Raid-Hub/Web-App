import PGCR from "~/app/pgcr/components/PGCR"
import { assertValidPath, prefetchActivity } from "~/lib/pgcr/server"
import { type PGCRPageProps } from "~/lib/pgcr/types"

export default async function Page({ params }: PGCRPageProps) {
    assertValidPath(params.instanceId)
    const activity = await prefetchActivity(params.instanceId)

    return <PGCR data={activity} />
}
