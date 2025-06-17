"use client"

import { type Collection } from "@discordjs/collection"
import { type Session } from "next-auth"
import { signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { useMemo, useRef } from "react"
import { DiscordIconOld } from "~/components/icons/DiscordIcon"
import { SpeedrunIcon } from "~/components/icons/SpeedrunIcon"
import TwitchIcon from "~/components/icons/TwitchIcon"
import TwitterIcon from "~/components/icons/TwitterIcon"
import YoutubeIcon from "~/components/icons/YoutubeIcon"
import { trpc } from "~/lib/trpc"
import styles from ".//account.module.css"
import Connection from "./Connection"
import IconUploadForm from "./IconUploadForm"
import SpeedrunAPIKeyModal from "./SpeedrunAPIKeyModal"

type AccountProps = {
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

const bungieMembershipTypeMap = {
    "-1": "???",
    0: "???",
    1: "Xbox",
    2: "PSN",
    3: "Steam",
    4: "Blizzard",
    5: "Stadia",
    6: "Epic",
    10: "Demon",
    254: "Bungie.net"
}

const Account = ({ session, providers }: AccountProps) => {
    const { data: socialNames, refetch: refetchSocials } = trpc.user.getConnections.useQuery()
    const { mutate: unlinkAccountFromUser } = trpc.user.removeByAccount.useMutation({
        onSuccess() {
            void refetchSocials()
        }
    })
    const { mutate: deleteUserMutation } = trpc.user.delete.useMutation({
        onSuccess() {
            window.location.href = "/"
        },
        onError(error) {
            console.error(error)
            alert("An error occurred while deleting your account")
        }
    })
    const speedrunAPIKeyModalRef = useRef<HTMLDialogElement | null>(null)

    const { discordProvider, twitchProvider, twitterProvider, youtubeProvider } = useMemo(
        () => ({
            discordProvider: providers?.get("discord"),
            twitchProvider: providers?.get("twitch"),
            twitterProvider: providers?.get("twitter"),
            youtubeProvider: providers?.get("youtube")
        }),
        [providers]
    )

    return (
        <>
            <SpeedrunAPIKeyModal refetchSocials={refetchSocials} ref={speedrunAPIKeyModalRef} />
            <section className={[styles.section, styles.flex].join(" ")}>
                <div className={[styles.buttons, styles["glossy-bg"]].join(" ")}>
                    {session?.user.profiles.map(profile => (
                        <Link
                            key={profile.destinyMembershipId}
                            href={`/profile/${profile.destinyMembershipId}`}>
                            <button>
                                View Profile (
                                {bungieMembershipTypeMap[profile.destinyMembershipType]})
                            </button>
                        </Link>
                    ))}
                    <button onClick={() => signIn("bungie", {}, "reauth=true")}>
                        Sign in with a different bungie account
                    </button>
                    <button onClick={() => signOut({ callbackUrl: "/" })}>Log Out</button>
                    <button
                        onClick={() => {
                            if (
                                window.confirm(
                                    "Are you sure you want to delete your RaidHub account?"
                                )
                            ) {
                                deleteUserMutation()
                            }
                        }}
                        className={styles.destructive}>
                        {"Delete Account"}
                    </button>
                </div>
            </section>
            <section className={[styles.section, styles.flex].join(" ")}>
                <h2>Manage Account</h2>
                <IconUploadForm />
            </section>
            <section className={styles.section}>
                <h2>Manage Connections</h2>
                <div className={styles.connections}>
                    {discordProvider && (
                        <Connection
                            unlink={() => unlinkAccountFromUser({ providerId: "discord" })}
                            link={() => signIn("discord", {}, { prompt: "consent" })}
                            serviceName={discordProvider.name}
                            username={socialNames?.get("discord") ?? null}
                            Icon={DiscordIconOld}
                        />
                    )}
                    {twitterProvider && (
                        <Connection
                            unlink={() => unlinkAccountFromUser({ providerId: "twitter" })}
                            link={() => signIn("twitter", {}, { force_login: "true" })}
                            serviceName={twitterProvider.name}
                            username={socialNames?.get("twitter") ?? null}
                            Icon={TwitterIcon}
                        />
                    )}
                    {twitchProvider && (
                        <Connection
                            unlink={() => unlinkAccountFromUser({ providerId: "twitch" })}
                            link={() => signIn("twitch", {}, { force_verify: "true" })}
                            serviceName={twitchProvider.name}
                            username={socialNames?.get("twitch") ?? null}
                            Icon={TwitchIcon}
                        />
                    )}
                    {youtubeProvider && (
                        <Connection
                            unlink={() => unlinkAccountFromUser({ providerId: "youtube" })}
                            link={() => signIn("youtube", {}, { prompt: "select_account" })}
                            serviceName={youtubeProvider.name}
                            username={socialNames?.get("youtube") ?? null}
                            Icon={YoutubeIcon}
                        />
                    )}
                    <Connection
                        unlink={() => unlinkAccountFromUser({ providerId: "speedrun" })}
                        link={() => speedrunAPIKeyModalRef.current?.showModal()}
                        serviceName="Speedrun.com"
                        username={socialNames?.get("speedrun") ?? null}
                        Icon={props => <SpeedrunIcon {...props} />}
                    />
                </div>
            </section>
        </>
    )
}

export default Account
