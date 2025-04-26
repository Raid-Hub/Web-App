import "server-only"

import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import TwitchProvider from "next-auth/providers/twitch"
import TwitterProvider from "next-auth/providers/twitter"
import { prisma } from "~/server/prisma"
import { reactRequestDedupe } from "~/util/react-cache"
import { PrismaAdapter } from "./adapter"
import BungieProvider from "./providers/bungie"
import { YouTubeProvider } from "./providers/youtube"
import { sessionCallback } from "./sessionCallback"
import { signInCallback } from "./signInCallback"

const {
    auth,
    handlers: { GET, POST },
    signOut
} = NextAuth({
    trustHost: true,
    providers: getProviders(),
    adapter: PrismaAdapter(prisma),
    pages: {
        error: "/auth/error",
        signIn: "/auth/login",
        signOut: "/auth/logout",
        newUser: "/account" // New users will be directed here on first sign in
    },
    session: {
        strategy: "database",
        maxAge: 7776000 // 90 days
    },
    callbacks: {
        session: sessionCallback,
        signIn: signInCallback
    },
    logger: {
        error(err) {
            console.error(err)
        },
        warn(code) {
            console.warn(code)
        },
        debug(code, ...message) {
            if (process.env.NODE_ENV !== "production") console.debug(code, message)
        }
    }
})

export { GET, POST, signOut }

// We cache the session for each request to avoid unnecessary database calls
export const getServerSession = reactRequestDedupe(auth)

type ProviderType =
    | ReturnType<typeof BungieProvider>
    | ReturnType<typeof DiscordProvider>
    | ReturnType<typeof TwitchProvider>
    | ReturnType<typeof TwitterProvider>
    | ReturnType<typeof YouTubeProvider>

export function getProviders(): ProviderType[] {
    const providers = new Array<ProviderType>()

    providers.push(
        BungieProvider({
            clientId: process.env.BUNGIE_CLIENT_ID!,
            clientSecret: process.env.BUNGIE_CLIENT_SECRET!,
            apiKey: process.env.BUNGIE_API_KEY!
        })
    )

    if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
        // typescript complains when I inline this
        const discordProvider = DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            // removes the email scope
            authorization: "https://discord.com/api/oauth2/authorize?scope=identify"
        })
        providers.push(discordProvider)
    }

    if (process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET) {
        providers.push(
            TwitchProvider({
                clientId: process.env.TWITCH_CLIENT_ID,
                clientSecret: process.env.TWITCH_CLIENT_SECRET
            })
        )
    }

    if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
        providers.push(
            TwitterProvider({
                name: "Twitter",
                clientId: process.env.TWITTER_CLIENT_ID,
                clientSecret: process.env.TWITTER_CLIENT_SECRET
            })
        )
    }

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        providers.push(
            YouTubeProvider({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET
            })
        )
    }

    return providers
}
