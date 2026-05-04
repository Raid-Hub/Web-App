"use client"

import { type Collection } from "@discordjs/collection"
import Link from "next/link"
import { useMemo, useRef } from "react"
import { type Session } from "next-auth"
import { signIn, signOut } from "next-auth/react"
import { DiscordIconOld } from "~/components/icons/DiscordIcon"
import { SpeedrunIcon } from "~/components/icons/SpeedrunIcon"
import TwitchIcon from "~/components/icons/TwitchIcon"
import TwitterIcon from "~/components/icons/TwitterIcon"
import YoutubeIcon from "~/components/icons/YoutubeIcon"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { trpc } from "~/lib/trpc"
import { AccountConnectionCard } from "./AccountConnectionCard"
import { DiscordLinkedRolesPanel } from "./DiscordLinkedRolesPanel"
import { ProfileIconForm } from "./ProfileIconForm"
import { SpeedrunAPIKeyDialog } from "./SpeedrunAPIKeyDialog"

const bungieMembershipTypeLabel: Record<number, string> = {
    [-1]: "Unknown",
    0: "Unknown",
    1: "Xbox",
    2: "PSN",
    3: "Steam",
    4: "Battle.net",
    5: "Stadia",
    6: "Epic",
    10: "Demon",
    254: "Bungie.net"
}

type AccountPageProps = {
    session: Session
    providers: Collection<
        string,
        {
            id: string
            name: string
            type: string
        }
    >
}

export function AccountPage({ session, providers }: AccountPageProps) {
    const utils = trpc.useUtils()
    const speedrunDialogRef = useRef<HTMLDialogElement>(null)
    const { data: socialNames, refetch: refetchSocials } = trpc.user.getConnections.useQuery()

    const refreshConnections = () => {
        void refetchSocials()
        void utils.user.discordLinkedRolesStatus.invalidate()
    }

    const { mutate: unlinkAccountFromUser } = trpc.user.removeByAccount.useMutation({
        onSuccess: refreshConnections
    })

    const { mutate: deleteUserMutation } = trpc.user.delete.useMutation({
        onSuccess() {
            window.location.href = "/"
        },
        onError(error) {
            console.error(error)
            window.alert("An error occurred while deleting your account")
        }
    })

    const { discordProvider, twitchProvider, twitterProvider, youtubeProvider } = useMemo(
        () => ({
            discordProvider: providers.get("discord"),
            twitchProvider: providers.get("twitch"),
            twitterProvider: providers.get("twitter"),
            youtubeProvider: providers.get("youtube")
        }),
        [providers]
    )

    const initial = session.user.name?.trim().charAt(0).toUpperCase() ?? "?"

    return (
        <div className="mx-auto max-w-3xl space-y-10 pb-16">
            <SpeedrunAPIKeyDialog ref={speedrunDialogRef} refetchSocials={refreshConnections} />

            <Card className="rounded-xl border-border/60 shadow-sm">
                <CardHeader className="gap-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <Avatar className="border-border/50 size-20 border-2 shadow-md">
                            {session.user.image ? (
                                <AvatarImage src={session.user.image} alt="" />
                            ) : null}
                            <AvatarFallback className="text-lg font-semibold">{initial}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 space-y-2">
                            <div>
                                <CardTitle className="text-2xl font-semibold tracking-tight">
                                    {session.user.name}
                                </CardTitle>
                                <CardDescription className="mt-1.5 text-pretty">
                                    Signed in with Bungie. Open a profile, tweak your icon, and link social
                                    accounts below.
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {session.user.profiles.map(profile => {
                                    const label =
                                        bungieMembershipTypeLabel[profile.destinyMembershipType] ??
                                        "Profile"
                                    return (
                                        <Button key={profile.destinyMembershipId} variant="outline" size="sm" asChild>
                                            <Link href={`/profile/${profile.destinyMembershipId}`}>
                                                View profile
                                                <Badge variant="secondary" className="ml-1.5 font-normal">
                                                    {label}
                                                </Badge>
                                            </Link>
                                        </Button>
                                    )
                                })}
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => signIn("bungie", {}, "reauth=true")}>
                                    Switch Bungie account
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => signOut({ callbackUrl: "/" })}>
                                    Sign out
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <section className="space-y-3">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">Profile icon</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Shown on RaidHub for your primary Destiny profile.
                    </p>
                </div>
                <ProfileIconForm />
            </section>

            <section className="space-y-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">Linked accounts</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Connect services for your profile. For Discord role sync, use{" "}
                        <strong className="text-foreground">Connect</strong> and approve{" "}
                        <span className="font-mono text-xs">role_connections.write</span> when prompted.
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                    {discordProvider ? (
                        <AccountConnectionCard
                            unlink={() => unlinkAccountFromUser({ providerId: "discord" })}
                            link={() => signIn("discord", {}, { prompt: "consent" })}
                            serviceName={discordProvider.name}
                            username={socialNames?.get("discord") ?? null}
                            Icon={DiscordIconOld}
                            footer={<DiscordLinkedRolesPanel variant="embedded" />}
                        />
                    ) : null}
                    {twitterProvider ? (
                        <AccountConnectionCard
                            unlink={() => unlinkAccountFromUser({ providerId: "twitter" })}
                            link={() => signIn("twitter", {}, { force_login: "true" })}
                            serviceName={twitterProvider.name}
                            username={socialNames?.get("twitter") ?? null}
                            Icon={TwitterIcon}
                        />
                    ) : null}
                    {twitchProvider ? (
                        <AccountConnectionCard
                            unlink={() => unlinkAccountFromUser({ providerId: "twitch" })}
                            link={() => signIn("twitch", {}, { force_verify: "true" })}
                            serviceName={twitchProvider.name}
                            username={socialNames?.get("twitch") ?? null}
                            Icon={TwitchIcon}
                        />
                    ) : null}
                    {youtubeProvider ? (
                        <AccountConnectionCard
                            unlink={() => unlinkAccountFromUser({ providerId: "youtube" })}
                            link={() => signIn("youtube", {}, { prompt: "select_account" })}
                            serviceName={youtubeProvider.name}
                            username={socialNames?.get("youtube") ?? null}
                            Icon={YoutubeIcon}
                        />
                    ) : null}
                    <AccountConnectionCard
                        unlink={() => unlinkAccountFromUser({ providerId: "speedrun" })}
                        link={() => speedrunDialogRef.current?.showModal()}
                        serviceName="Speedrun.com"
                        username={socialNames?.get("speedrun") ?? null}
                        Icon={props => <SpeedrunIcon {...props} />}
                    />
                </div>
            </section>

            <Separator className="bg-border/60" />

            <section className="space-y-3">
                <div>
                    <h2 className="text-destructive text-lg font-semibold tracking-tight">Danger zone</h2>
                    <p className="text-muted-foreground mt-1 text-sm text-pretty">
                        Permanently delete your RaidHub account and associated data. This cannot be undone.
                    </p>
                </div>
                <Card className="rounded-xl border-destructive/30 bg-card shadow-sm">
                    <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-muted-foreground text-sm">Delete your RaidHub account</p>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="shrink-0"
                            onClick={() => {
                                if (
                                    window.confirm(
                                        "Are you sure you want to permanently delete your RaidHub account?"
                                    )
                                ) {
                                    deleteUserMutation()
                                }
                            }}>
                            Delete account
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}
