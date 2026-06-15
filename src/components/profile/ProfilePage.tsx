import { Suspense, type ReactNode } from "react"
import { Loading } from "~/components/Loading"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { RaidsWrapper } from "./raids/RaidsWrapper"
import { CurrentActivity } from "./transitory/CurrentActivity"
import { LatestRaid } from "./transitory/LatestRaid"
import { UserCard } from "./user/UserCard"

const TransitorySuspense = ({
    destinyMembershipId,
    children
}: {
    destinyMembershipId: string
    children: ReactNode
}) => (
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
        {children}
    </Suspense>
)

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
                <TransitorySuspense destinyMembershipId={destinyMembershipId}>
                    <CurrentActivity />
                </TransitorySuspense>
                <TransitorySuspense destinyMembershipId={destinyMembershipId}>
                    <LatestRaid />
                </TransitorySuspense>
            </Flex>
        </Flex>
        <RaidsWrapper />
    </Flex>
)
