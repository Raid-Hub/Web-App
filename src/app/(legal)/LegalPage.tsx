"use client"

import { type ReactNode } from "react"
import styled from "styled-components"
import { PageWrapper } from "~/components/PageWrapper"

const StyledPage = styled(PageWrapper)`
    letter-spacing: 0.05ch;

    border-radius: 10px;
    padding: 2em;
    background-color: color-mix(
        in srgb,
        ${({ theme }) => theme.colors.background.medium},
        #0000 70%
    );

    & section a {
        text-decoration: underline;
    }
`

export const LegalPage = (props: { title: string; effectiveDate: Date; children: ReactNode }) => {
    return (
        <StyledPage>
            <div>
                <h1>{props.title}</h1>
                <h4>
                    <span>Effective date: </span>
                    <span>
                        {props.effectiveDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            timeZone: "America/New_York"
                        })}
                    </span>
                </h4>
            </div>
            <section>{props.children}</section>
        </StyledPage>
    )
}
