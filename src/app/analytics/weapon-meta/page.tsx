"use client"

import Link from "next/link"
import { useRef } from "react"
import { z } from "zod"
import { Container } from "~/components/__deprecated__/layout/Container"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { useLocale } from "~/components/providers/LocaleManager"
import { useLocalStorage } from "~/hooks/util/useLocalStorage"
import { useQueryParams } from "~/hooks/util/useQueryParams"
import { useSmoothAnchorScroll } from "~/hooks/util/useSmoothAnchorScroll"
import { WeaponTables } from "./WeaponTables"

type SortKey = "kills" | "usage"

export default function Page() {
    const { locale, userAgent } = useLocale()
    const count = userAgent.device.type === "mobile" ? 10 : 25

    const { set: setParam, get: getParam } = useQueryParams(
        z.object({
            sort: z.enum(["kills", "usage"])
        })
    )

    const [sort, setSort] = useLocalStorage("weapon-meta-sort", () => getParam("sort", "kills"))

    const now = new Date()
    const lastWeek = new Date(now)
    lastWeek.setDate(now.getDate() - 7)

    const ref = useRef<HTMLDivElement>(null)
    useSmoothAnchorScroll(ref)

    return (
        <div ref={ref}>
            <h1
                style={{
                    marginBottom: "0.2rem"
                }}>
                Weekly Weapon Meta
            </h1>
            <div style={{ marginBottom: "1.25rem" }}>
                <i>
                    {lastWeek.toLocaleDateString(locale, {
                        dateStyle: "medium"
                    })}
                    {" - "}
                    {now.toLocaleDateString(locale, {
                        dateStyle: "medium"
                    })}
                </i>
            </div>
            <Container>
                <Flex
                    $padding={0}
                    $wrap
                    $align="flex-start"
                    style={{
                        marginBottom: "1rem"
                    }}>
                    <div>
                        <Flex as="nav" $align="flex-start" $padding={0} id="slot-nav">
                            <label htmlFor="slot-nav">{"Jump: "}</label>
                            <Link href="#kinetic">Kinetic</Link>
                            <Link href="#energy">Energy</Link>
                            <Link href="#power">Power</Link>
                        </Flex>
                    </div>
                    <div>
                        <label
                            htmlFor="sort-selector"
                            style={{
                                marginRight: "0.25rem"
                            }}>
                            {"Sort by:"}
                        </label>
                        <select
                            id="sort-selector"
                            value={sort}
                            onChange={e => {
                                const value = e.target.value as SortKey
                                setSort(value)
                                setParam("sort", value)
                            }}>
                            <option value="kills">Kills</option>
                            <option value="usage">Usage</option>
                        </select>
                    </div>
                </Flex>
                <WeaponTables sort={sort} count={count} />
            </Container>
        </div>
    )
}
