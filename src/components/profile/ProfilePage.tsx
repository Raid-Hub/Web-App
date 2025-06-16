import { Suspense } from "react"
import { Loading } from "~/components/Loading"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { RaidsWrapper } from "./raids/RaidsWrapper"
import { CurrentActivity } from "./transitory/CurrentActivity"
import { LatestRaid } from "./transitory/LatestRaid"
import { UserCard } from "./user/UserCard"

export const ProfilePage = ({ destinyMembershipId }: { destinyMembershipId: string }) => (
    <Flex $direction="column" $padding={0} $crossAxis="flex-start">
        <Flex
            $direction="column"
            $padding={0}
            $align="flex-start"
            $crossAxis="stretch"
            $fullWidth
            style={{ columnGap: "4rem", maxWidth: "100%" }}>
            <UserCard />
            <Suspense
                key={destinyMembershipId}
                fallback={
                    <Loading
                        $fill
                        $minHeight="250px"
                        $alpha={0.75}
                        $minWidth="200px"
                        style={{ width: "min(100%, 800px)", minHeight: "250px" }}
                    />
                }>
                <Flex
                    $padding={0}
                    $direction="row"
                    $wrap
                    $align="flex-start"
                    $crossAxis="stretch"
                    style={{
                        flexGrow: 1,
                        flexBasis: "100%"
                    }}>
                    <CurrentActivity />
                    <LatestRaid />
                </Flex>
            </Suspense>
        </Flex>
        <RaidsWrapper />
    </Flex>
)
