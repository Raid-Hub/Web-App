"use client"

import { useMemo, useState } from "react"
import { Badge } from "~/shad/badge"
import { Button } from "~/shad/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/shad/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/shad/table"
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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-4">
                    <CardTitle>{title}</CardTitle>
                    <Badge variant="outline">{rows.length} rows</Badge>
                </div>
                <Button
                    onClick={() => setIsEditing(isEditing => !isEditing)}
                    variant={isEditing ? "default" : "outline"}
                    size="sm">
                    {isEditing ? "Save" : "Edit"}
                </Button>
            </CardHeader>
            <CardContent>
                <div className="overflow-auto rounded-md border border-white/10">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columnLabels.map((label, idx) => (
                                    <ColumnLabel
                                        key={idx}
                                        label={label}
                                        isEditing={isEditing}
                                        setColumnFn={setColumnFn[label]}
                                    />
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row, idx) => (
                                <TableRow key={idx}>
                                    {Object.values(row).map((value, i) => (
                                        <Cell
                                            key={i}
                                            value={value}
                                            Formatter={fns[columnLabels[i]] ?? ColumnFormats.string}
                                        />
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
