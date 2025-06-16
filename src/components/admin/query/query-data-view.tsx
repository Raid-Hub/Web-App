"use client"

import { type UseMutationResult } from "@tanstack/react-query"
import Link from "next/link"
import styled from "styled-components"
import { Panel } from "~/components/__deprecated__/Panel"
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
        return <div>Loading...</div>
    }
    if (mutation.isError) {
        if (mutation.error instanceof RaidHubError) {
            if (mutation.error.errorCode === "AdminQuerySyntaxError") {
                const cause = mutation.error.cause as RaidHubErrorSchema<"AdminQuerySyntaxError">
                return (
                    <ErrorMessage>
                        <h3>SQL Error</h3>
                        <p>
                            <strong>Name:</strong> {cause.name}
                        </p>
                        {cause.code && (
                            <p>
                                <strong>Code: </strong>
                                <Link
                                    href={`https://www.postgresql.org/docs/current/errcodes-appendix.html#:~:text=${cause.code}`}
                                    target="_blank"
                                    style={{
                                        color: "unset"
                                    }}>
                                    <u>{cause.code}</u>
                                </Link>
                            </p>
                        )}
                        {cause.line && cause.position && (
                            <p>
                                <strong>Line:</strong> {cause.line.slice(0, cause.position - 1)}
                                <span
                                    style={{
                                        fontWeight: "bold",
                                        backgroundColor: "yellow"
                                    }}>
                                    {cause.line[cause.position - 1]}
                                </span>
                                {cause.line.slice(cause.position)}
                            </p>
                        )}
                    </ErrorMessage>
                )
            } else {
                return <ErrorMessage>{mutation.error.errorCode}</ErrorMessage>
            }
        }
        return (
            <ErrorMessage>
                {"An error occurred"} {(mutation.error as Error).message}
            </ErrorMessage>
        )
    }
    if (mutation.isSuccess) {
        if (mutation.data.type === "HIGH COST") {
            return (
                <WarningMessage>
                    <div>Warning: High Query Cost</div>Estimated Query duration:{" "}
                    <b>{secondsToHMS(mutation.data.estimatedDuration, false)}</b>
                </WarningMessage>
            )
        }
        if (mutation.data.type === "EXPLAIN") {
            return (
                <Panel>
                    <pre>{mutation.data.data.join("\n")}</pre>
                </Panel>
            )
        } else if (!mutation.data.data.length) {
            return <Panel>{"No rows :("}</Panel>
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

const ErrorMessage = styled.div`
    color: #721c24;
    background-color: #f8d7da;
    padding: 0.75rem 1.25rem;
`

const WarningMessage = styled.div`
    color: yellow;
`
