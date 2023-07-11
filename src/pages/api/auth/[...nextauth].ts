import NextAuth, { DefaultSession, DefaultUser, NextAuthOptions, Profile, User } from "next-auth"
import { BungieToken, BungieTokens, getAccessTokenFromRefreshToken } from "bungie-net-core/lib/auth"
import { getMembershipDataForCurrentUser } from "bungie-net-core/lib/endpoints/User"
import {
    BungieMembershipType,
    GeneralUser as BungieUser,
    GroupUserInfoCard
} from "bungie-net-core/lib/models"
import { OAuthConfig, OAuthProvider } from "next-auth/providers/oauth"
import BungieClient from "../../../services/bungie/client"

type AuthError = "RefreshAccessTokenError" | "ExpiredRefreshTokenError"

declare module "next-auth" {
    interface Profile extends BungieUser, GroupUserInfoCard {}
    interface User extends DefaultUser {
        membershipType: BungieMembershipType
    }
    interface Session extends DefaultSession {
        user?: User
        error?: AuthError
        token?: BungieToken
    }
}

declare module "next-auth/jwt" {
    interface JWT extends BungieTokens {
        error?: AuthError
        user?: User
    }
}

const BungieProvider: OAuthProvider = options => {
    return {
        id: "bungie",
        name: "Bungie",
        type: "oauth",
        authorization: {
            url: "https://www.bungie.net/en/OAuth/Authorize",
            params: { scope: "" }
        },
        token: "https://www.bungie.net/platform/app/oauth/token/",
        // Correctly gets the current user info so that the existing `profile` definition works
        userinfo: {
            // passed to profile(profile)
            // accessed from jwt ({ profile })
            request: async ({ tokens }) => getBungieMembershipData(tokens.access_token!)
        },
        profile(profile: Profile) {
            // accessed from jwt ({ user })
            return {
                id: profile.membershipId,
                name: profile.displayName,
                membershipType: profile.membershipType,
                email: null,
                image: `https://www.bungie.net${
                    profile.profilePicturePath.startsWith("/") ? "" : "/"
                }${profile.profilePicturePath}`
            } as User
        },
        options: options as Required<Pick<OAuthConfig<any>, "clientId" | "clientSecret">>
    }
}

export const authOptions: NextAuthOptions = {
    callbacks: {
        async jwt({ token, account, profile: bungieMembership, user }) {
            if (account && account.access_token && account.refresh_token) {
                console.log("Logging in user", bungieMembership)
                // Save the access token and refresh token in the JWT on the initial login
                const now = Date.now()
                return {
                    user,
                    bungieMembershipId: account.providerAccountId,
                    access: {
                        value: account.access_token,
                        type: "access",
                        created: now,
                        expires: Math.round((account.expires_at ?? now / 1000) * 1000)
                    },
                    refresh: {
                        value: account.refresh_token,
                        type: "refresh",
                        created: now,
                        expires: now + 3600 * 24 * 90 * 1000
                    }
                }
            } else if (Date.now() + 1000 < token.access.expires) {
                // If the access token has not expired yet, return it
                return token
            } else if (Date.now() < token.refresh.expires) {
                console.log("Refreshing access token", token.user)
                try {
                    return {
                        ...token,
                        ...(await getAccessTokenFromRefreshToken(token.refresh.value))
                    }
                } catch (e) {
                    return { ...token, error: "RefreshAccessTokenError" as const }
                }
            } else {
                return { ...token, error: "ExpiredRefreshTokenError" as const }
            }
        },
        async session({ session, token }) {
            session.error = token.error
            session.user = token.user
            if (token.error) {
                session.token = undefined
            } else {
                session.token = token.access
            }
            return session
        }
    },
    providers: [
        BungieProvider({
            clientId: process.env.BUNGIE_CLIENT_ID,
            clientSecret: process.env.BUNGIE_CLIENT_SECRET,
            httpOptions: { headers: { "X-API-Key": process.env.BUNGIE_API_KEY } }
        })
    ]
}

export default NextAuth(authOptions)

async function getBungieMembershipData(accessToken: string): Promise<Profile> {
    const client = new BungieClient()
    client.setToken(accessToken)

    const { bungieNetUser, destinyMemberships, primaryMembershipId } =
        await getMembershipDataForCurrentUser(client).then(res => res.Response)
    console.log({ bungieNetUser, destinyMemberships, primaryMembershipId })

    return {
        ...bungieNetUser,
        ...(destinyMemberships.find(
            membership => membership.membershipId === primaryMembershipId
        ) ?? destinyMemberships[0])
    }
}
