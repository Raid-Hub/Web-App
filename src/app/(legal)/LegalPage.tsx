"use client"

import { type ReactNode } from "react"
import { PageWrapper } from "~/components/PageWrapper"

export const LegalPage = (props: { title: string; effectiveDate: Date; children: ReactNode }) => {
    return (
        <PageWrapper className="bg-background-medium/30 rounded-[10px] p-8 tracking-wide">
            <div>
                <h1 className="text-2xl font-bold">{props.title}</h1>
                <h4 className="mt-2 text-base font-medium">
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
            <section className="[&>a]:underline [&>h1]:text-2xl [&>h2]:text-xl [&>h3]:text-lg [&>h4]:text-base [&>h5]:text-sm [&>h6]:text-xs [&>p]:mb-4">
                {props.children}
            </section>
        </PageWrapper>
    )
}
