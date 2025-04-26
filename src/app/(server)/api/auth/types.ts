import { type AdapterUser } from "@auth/core/adapters"
import { type Awaitable, type User } from "@auth/core/types"
import { type Session as PrismaSession } from "@prisma/client"
import {
    type BungieMembershipType,
    type DestinyLinkedProfilesResponse
} from "bungie-net-core/models"

declare module "@auth/core/types" {
    interface Session {
        errors: AuthError[]
        user: AdapterUser
        primaryDestinyMembershipId?: string
        bungieAccessToken?: {
            value: string
            expires: string
        }
        raidHubAccessToken?: {
            value: string
            expires: string
        }
        expires: Date
    }

    interface Account {
        refresh_expires_in?: number
    }
}

declare module "@auth/core/adapters" {
    interface AdapterUser {
        id: string
        name: string | null
        image: string | null
        createdAt: Date
        role: "USER" | "ADMIN"
        bungieAccount: BungieAccount
        raidHubAccessToken: {
            value: string
            expiresAt: Date
        } | null
        profiles: {
            isPrimary: boolean
            vanity: string | null
            destinyMembershipId: string
            destinyMembershipType: BungieMembershipType
        }[]
    }
    interface AdapterSession extends PrismaSession {
        expires: Date
    }

    interface Adapter {
        createUser?(user: User | BungieUser): Awaitable<AdapterUser>
    }
}

export interface BungieUser extends User {
    userMembershipData: DestinyLinkedProfilesResponse
}

export type AuthToken = {
    value: string
    expires: Date
}

export type BungieAccount = {
    refreshToken: string | null
    accessToken: string | null
    expiresAt: number | null
    refreshExpiresAt: number | null
}

export type AuthError =
    | "BungieAPIOffline"
    | "AccessTokenError"
    | "ExpiredRefreshTokenError"
    | "RaidHubAuthorizationError"
    | "PrismaError"
