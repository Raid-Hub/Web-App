"use client"

import { signIn } from "next-auth/react"
import Link from "next/link"
import { memo, useCallback } from "react"
import { OptionalWrapper } from "~/components/OptionalWrapper"
import { usePageProps } from "~/components/PageWrapper"
import { useSession } from "~/hooks/app/useSession"
import { type ProfileProps } from "~/lib/profile/types"
import { useInstances } from "~/services/raidhub/useRaidHubInstances"
import { InstanceFinderForm } from "./InstanceFinderForm"
import { InstanceTable } from "./InstanceTable"

export const InstanceFinder = () => {
    const { destinyMembershipId } = usePageProps<ProfileProps>()
    const session = useSession()

    const Component = useCallback(() => {
        switch (session.status) {
            case "authenticated":
                if (
                    destinyMembershipId === session.data?.primaryDestinyMembershipId ||
                    session.data.user.role === "ADMIN"
                ) {
                    return <InstanceFinderInternal />
                } else {
                    return (
                        <p>
                            For privacy reasons, this feature is only available from{" "}
                            <OptionalWrapper
                                condition={session.data?.primaryDestinyMembershipId}
                                wrapper={({ value, children }) => (
                                    <Link href={`/profile/${value}?tab=finder`}>{children}</Link>
                                )}>
                                your own profile
                            </OptionalWrapper>
                        </p>
                    )
                }
            case "loading":
                return <p>Loading...</p>
            case "unauthenticated":
                return (
                    <div>
                        <p>You must be logged in to view this page.</p>
                        <button
                            onClick={() => {
                                void signIn("bungie")
                            }}>
                            Log In
                        </button>
                    </div>
                )
        }
    }, [destinyMembershipId, session])

    return (
        <div className="w-full max-w-full space-y-4">
            <h1 className="text-2xl">Instance Finder</h1>
            <p>
                This tool allows you to search for specific raids which you have participated in.
                Use the filters below to narrow down your search.
            </p>
            <Component />
        </div>
    )
}

const InstanceFinderInternal = memo(() => {
    const { destinyMembershipId } = usePageProps<ProfileProps>()
    const { mutate: queryInstances, ...state } = useInstances()
    return (
        <div>
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
                <h2 className="mt-8 mb-2 text-xl font-semibold">Results</h2>
                <div className="overflow-x-auto">
                    {state.isIdle && <p>Enter your search criteria above to find instances.</p>}
                    {state.isLoading && <p>Loading...</p>}
                    {state.isError && <p>Error: {(state.error as Error).message}</p>}
                    {state.isSuccess && state.data.length === 0 && <p>No instances found.</p>}
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
})
InstanceFinderInternal.displayName = "InstanceFinderInternal"
