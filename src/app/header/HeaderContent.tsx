import Link from "next/link"
import { Suspense } from "react"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import QuestionMark from "~/components/icons/QuestionMark"
import { HeaderLogo } from "./HeaderLogo"
import { SearchBar } from "./SearchBar"
import { AccountIcon } from "./account-button/AccountIcon"
import { AccountIconContent } from "./account-button/AccountIconContent"

export function HeaderContent() {
    return (
        <Flex $align="space-between" $padding={0.3}>
            <Link href="/">
                <HeaderLogo />
            </Link>
            <Flex $padding={0.25}>
                <SearchBar />
                <AccountIcon>
                    <Suspense fallback={<QuestionMark color="white" className="size-8" />}>
                        <AccountIconContent />
                    </Suspense>
                </AccountIcon>
            </Flex>
        </Flex>
    )
}
