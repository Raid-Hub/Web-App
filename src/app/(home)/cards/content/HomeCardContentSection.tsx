import { type ReactNode } from "react"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { H4 } from "~/components/typography/H4"

export function HomeCardContentSection(props: { sectionTitle: string; children: ReactNode }) {
    return (
        <div>
            <H4
                style={{
                    margin: "0.5rem 0"
                }}>
                {props.sectionTitle}
            </H4>
            <Flex $direction="column" $crossAxis="flex-start" $gap={0} $padding={0}>
                {props.children}
            </Flex>
        </div>
    )
}
