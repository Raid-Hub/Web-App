import "server-only"
import { saferFetch } from "~/lib/server/saferFetch"

export async function getTwitterProfile(access_token: string) {
    const res = await saferFetch("https://api.twitter.com/2/users/me?user.fields=url", {
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    })

    const data = (await res.json()) as {
        data: {
            name: string
            id: string
            username: string
        }
    }

    if (res.ok) {
        return data.data
    } else {
        throw data
    }
}
