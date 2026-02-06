"use client"

import { type UseMutationResult } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "~/shad/card"
import { RaidHubError } from "~/services/raidhub/RaidHubError"
import {
    type RaidHubAdminQueryBody,
    type RaidHubAdminQueryResponse,
    type RaidHubErrorSchema
} from "~/services/raidhub/types"
import { o } from "~/util/o"
import { secondsToHMS } from "~/util/presentation/formatting"
import { SQLTable } from "./table/SQLTable"

export const DataView = ({
    title,
    mutation
}: {
    title: string
    mutation: UseMutationResult<RaidHubAdminQueryResponse, unknown, RaidHubAdminQueryBody>
}) => {
    if (mutation.isLoading) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <div className="text-sm text-white/60">Loading...</div>
                </CardContent>
            </Card>
        )
    }
    if (mutation.isError) {
        if (mutation.error instanceof RaidHubError) {
            if (mutation.error.errorCode === "AdminQuerySyntaxError") {
                const cause = mutation.error.cause as RaidHubErrorSchema<"AdminQuerySyntaxError">
                return (
                    <Card className="border-red-500/50 bg-red-500/10">
                        <CardHeader>
                            <CardTitle className="text-red-400">SQL Error</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div>
                                <strong className="text-white/80">Name:</strong>{" "}
                                <span className="text-white/60">{cause.name}</span>
                            </div>
                            {cause.code && (
                                <div>
                                    <strong className="text-white/80">Code: </strong>
                                    <Link
                                        href={`https://www.postgresql.org/docs/current/errcodes-appendix.html#:~:text=${cause.code}`}
                                        target="_blank"
                                        className="text-hyperlink underline">
                                        {cause.code}
                                    </Link>
                                </div>
                            )}
                            {cause.line && cause.position && (
                                <div>
                                    <strong className="text-white/80">Line:</strong>{" "}
                                    <span className="text-white/60">
                                        {cause.line.slice(0, cause.position - 1)}
                                    </span>
                                    <span className="bg-yellow-500 font-bold text-black">
                                        {cause.line[cause.position - 1]}
                                    </span>
                                    <span className="text-white/60">
                                        {cause.line.slice(cause.position)}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            } else {
                return (
                    <Card className="border-red-500/50 bg-red-500/10">
                        <CardContent className="py-4">
                            <div className="text-red-400">{mutation.error.errorCode}</div>
                        </CardContent>
                    </Card>
                )
            }
        }
        return (
            <Card className="border-red-500/50 bg-red-500/10">
                <CardContent className="py-4">
                    <div className="text-red-400">
                        An error occurred: {(mutation.error as Error).message}
                    </div>
                </CardContent>
            </Card>
        )
    }
    if (mutation.isSuccess) {
        if (mutation.data.type === "HIGH COST") {
            return (
                <Card className="border-yellow-500/50 bg-yellow-500/10">
                    <CardHeader>
                        <CardTitle className="text-yellow-500">Warning: High Query Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm">
                            Estimated Query duration:{" "}
                            <strong className="text-yellow-400">
                                {secondsToHMS(mutation.data.estimatedDuration, false)}
                            </strong>
                        </div>
                    </CardContent>
                </Card>
            )
        }
        if (mutation.data.type === "EXPLAIN") {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Explain Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="overflow-auto rounded-md bg-black/40 p-4 text-sm">
                            {mutation.data.data.join("\n")}
                        </pre>
                    </CardContent>
                </Card>
            )
        } else if (!mutation.data.data.length) {
            return (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="text-sm text-white/60">No rows :(</div>
                    </CardContent>
                </Card>
            )
        } else {
            return (
                <SQLTable
                    title={title}
                    columnLabels={o.keys(mutation.data.data[0])}
                    rows={mutation.data.data}
                />
            )
        }
    }
    return null
}
