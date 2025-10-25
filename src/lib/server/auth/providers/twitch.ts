import "server-only"
import { saferFetch } from "~/lib/server/saferFetch"

export async function getTwitchProfile(access_token: string) {
    const res = await saferFetch("https://api.twitch.tv/helix/users", {
        headers: {
            "Client-ID": process.env.TWITCH_CLIENT_ID!,
            Authorization: `Bearer ${access_token}`
        }
    })

    const data = (await res.json()) as {
        data: {
            id: string
            login: string
            display_name: string
            email: string
        }[]
    }
    if (res.ok) {
        return data.data[0]
    } else {
        throw data
    }
}
