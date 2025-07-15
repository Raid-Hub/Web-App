import dynamic from "next/dynamic"
import Link from "next/link"
import { Suspense } from "react"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import QuestionMark from "~/components/icons/QuestionMark"
import { HeaderLogo } from "./HeaderLogo"
import { AccountIcon } from "./account-button/AccountIcon"
import { AccountIconContent } from "./account-button/AccountIconContent"

// prevents the SearchBar from being server-side rendered,
// specifically to avoid hydration issues with the cmdk icons
const SearchBar = dynamic(() => import("./HeaderSearchButton"), {
    ssr: false
})

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
