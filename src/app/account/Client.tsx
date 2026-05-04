"use client"

import { Collection } from "@discordjs/collection"
import { AccountPage } from "~/components/account/AccountPage"
import { ForceClientSideBungieSignIn } from "~/components/ForceClientSideBungieSignIn"

export const Client = ({
    providers
}: {
    providers: {
        id: string
        name: string
        type: string
    }[]
}) => (
    <ForceClientSideBungieSignIn
        whenSignedIn={session => (
            <div className="space-y-8">
                <header className="space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
                    <p className="text-muted-foreground max-w-2xl text-sm text-pretty">
                        Profiles, profile icon, and linked services for{" "}
                        <span className="text-foreground font-medium">{session.user.name}</span>.
                    </p>
                </header>
                <AccountPage
                    session={session}
                    providers={new Collection(providers.map(p => [p.id, p]))}
                />
            </div>
        )}
    />
)
