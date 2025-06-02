import { Suspense } from "react"
import { Checkpoints } from "~/components/checkpoints/checkpoints"
import { CheckpointLogo } from "~/components/checkpoints/logo"
import { PageWrapper } from "~/components/layout/PageWrapper"

export const revalidate = false

export default function Page() {
    return (
        <PageWrapper>
            <CheckpointLogo />
            <Suspense fallback={<div>Loading...</div>}>
                <Checkpoints />
            </Suspense>
        </PageWrapper>
    )
}
