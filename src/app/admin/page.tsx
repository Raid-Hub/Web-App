import { type Metadata } from "next"
import { revalidateTag } from "next/cache"
import { Flex } from "~/components/layout/Flex"
import { PageWrapper } from "~/components/layout/PageWrapper"
import { AddBadgeForm } from "./AddBadgeForm"
import { AddVanityForm } from "./AddVanityForm"
import { BadgesDisplay } from "./BadgesDisplay"
import { CreateBadgeForm } from "./CreateBadgeForm"
import { RemoveBadgeForm } from "./RemoveBadgeForm"
import { RemoveVanityForm } from "./RemoveVanityForm"

export default async function Page() {
    const purgeManifest = async () => {
        "use server"
        revalidateTag("manifest")
    }

    return (
        <PageWrapper>
            <h1>Admin Panel</h1>
            <Flex $direction="column" $crossAxis="flex-start">
                <Flex $wrap $crossAxis="flex-start" $align="flex-start">
                    <AddVanityForm />
                    <RemoveVanityForm />
                </Flex>
                <Flex $wrap $crossAxis="flex-start" $align="flex-start">
                    <CreateBadgeForm />
                    <BadgesDisplay />
                </Flex>
                <Flex $wrap $crossAxis="flex-start" $align="flex-start">
                    <AddBadgeForm />
                    <RemoveBadgeForm />
                </Flex>
                <form action={purgeManifest}>
                    <h2>Reset Cache</h2>
                    <button type="submit">Refresh Manifest</button>
                </form>
            </Flex>
        </PageWrapper>
    )
}

export const metadata: Metadata = {
    title: "Admin Dashboard"
}
