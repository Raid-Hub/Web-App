"use client"

import { usePageProps } from "~/components/layout/PageWrapper"
import { useInstances } from "~/services/raidhub/useRaidHubInstances"
import { type ProfileProps } from "../../types"
import { InstanceFinderForm } from "./InstanceFinderForm"
import { InstanceTable } from "./InstanceTable"

export const InstanceFinder = () => {
    const { destinyMembershipId } = usePageProps<ProfileProps>()
    const { mutate: queryInstances, ...state } = useInstances()

    return (
        <div
            style={{
                width: "100%",
                maxWidth: "100%"
            }}>
            <h1>Instance Finder</h1>
            <p>
                This tool allows you to search for specific raids which you have participated in.
                Use the filters below to narrow down your search.
            </p>
            <div>
                <InstanceFinderForm
                    onSubmit={query =>
                        queryInstances({
                            query,
                            destinyMembershipId
                        })
                    }
                />
            </div>
            <div>
                <h2
                    style={{
                        marginTop: "2rem",
                        marginBottom: "0.5rem"
                    }}>
                    Results
                </h2>
                <div
                    style={{
                        overflowX: "auto"
                    }}>
                    {state.isIdle && <p>Enter your search criteria above to find instances.</p>}
                    {state.isLoading && <p>Loading...</p>}
                    {state.isError && <p>Error: {(state.error as Error).message}</p>}
                    {state.isSuccess && state.data.length == 0 && <p>No instances found.</p>}
                    {state.isSuccess && state.data.length > 0 && (
                        <InstanceTable instances={state.data} />
                    )}
                </div>
                {state.isSuccess && state.data.length >= 100 && (
                    <p>
                        Didn&apos;t find what you were looking for? We cap the results at 100
                        instances. If you need more, please use the filters to narrow down your
                        search.
                    </p>
                )}
            </div>
        </div>
    )
}
