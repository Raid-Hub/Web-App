"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useRef, useState } from "react"
import styled from "styled-components"
import { Table } from "~/components/Table"
import { Panel } from "~/components/__deprecated__/Panel"
import { Cell } from "./Cell"
import { ColumnLabel } from "./ColumnLabel"
import { ColumnFormats } from "./formats"

export function SQLTable<T extends string[]>({
    title,
    columnLabels,
    rows
}: {
    title: string
    columnLabels: T
    rows: readonly Record<T[number], unknown>[]
}) {
    const ref = useRef<HTMLDivElement>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [fns, setFns] = useState<
        Record<string, (typeof ColumnFormats)[keyof typeof ColumnFormats]>
    >({})

    const setColumnFn = useMemo(() => {
        return Object.fromEntries(
            columnLabels.map(label => [
                label,
                (label: string, fn: (typeof ColumnFormats)[keyof typeof ColumnFormats]) =>
                    setFns(fns => ({ ...fns, [label]: fn }))
            ])
        )
    }, [columnLabels, setFns])

    return (
        <form onSubmit={e => e.preventDefault()}>
            <button
                onClick={() => setIsEditing(isEditing => !isEditing)}
                type={isEditing ? "submit" : "button"}>
                {isEditing ? "Save" : "Edit"}
            </button>

            <TableArea ref={ref}>
                <Image
                    src="/logo.png"
                    alt="logo"
                    width={30}
                    height={30}
                    style={{ position: "absolute", top: 10, left: 10 }}
                />
                <h2 style={{ textAlign: "center", marginTop: 0 }}>{title}</h2>
                <div>
                    <Table $align>
                        <thead>
                            <tr>
                                {columnLabels.map((label, idx) => (
                                    <ColumnLabel
                                        key={idx}
                                        label={label}
                                        isEditing={isEditing}
                                        setColumnFn={setColumnFn[label]}
                                    />
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={idx}>
                                    {Object.values(row).map((value, i) => (
                                        <Cell
                                            key={i}
                                            value={value}
                                            Formatter={fns[columnLabels[i]] ?? ColumnFormats.string}
                                        />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Attribution>
                        <span>Source: </span>
                        <Link href="https://raidhub.io">raidhub.io</Link>
                    </Attribution>
                </div>
            </TableArea>
        </form>
    )
}

const TableArea = styled(Panel)`
    position: relative;
    padding: 2em;

    background: linear-gradient(
        78deg,
        rgba(1, 0, 17, 1) 0%,
        rgba(1, 0, 17, 1) 25%,
        rgb(19, 1, 10) 48%,
        rgba(1, 0, 17, 1) 91%,
        rgba(19, 3, 1, 1) 100%
    );
`

const Attribution = styled.div`
    font-size: 0.8em;
    text-align: left;

    margin-top: 1em;

    font-style: italic;

    & a {
        letter-spacing: 0.04em;
        color: ${({ theme }) => theme.colors.text.orange};
    }
`
