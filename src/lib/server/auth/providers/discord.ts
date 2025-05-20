import type { DiscordProfile } from "next-auth/providers/discord"
import "server-only"

export async function getDiscordProfile(access_token: string) {
    const res = await fetch("https://discord.com/api/users/@me", {
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    })
    const data = (await res.json()) as DiscordProfile
    if (res.ok) {
        return data
    } else {
        throw data
    }
}
