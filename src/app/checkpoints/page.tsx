import { Suspense } from "react"
import { PageWrapper } from "~/components/PageWrapper"
import { Checkpoints } from "~/components/checkpoints/checkpoints"
import { CheckpointLogo } from "~/components/checkpoints/logo"

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
