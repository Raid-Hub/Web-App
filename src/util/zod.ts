import { z } from "zod"
import { Role, Prisma } from "@prisma/client"
import { BungieMembershipType } from "bungie-net-core/models"
import { UrlPathsToRaid } from "./destiny/raidUtils"

// rather than importing the full enum, we make it ourselves
const BungieMembershipEnum = z.nativeEnum({
    None: 0,
    TigerXbox: 1,
    TigerPsn: 2,
    TigerSteam: 3,
    TigerBlizzard: 4,
    TigerStadia: 5,
    TigerEgs: 6,
    TigerDemon: 10,
    BungieNext: 254,
    All: -1
})

export const zProfile = z.object({
    name: z.string(),
    image: z.string(),
    userId: z.string(),
    vanity: z.nullable(z.string()),
    destinyMembershipId: z.string(),
    destinyMembershipType: BungieMembershipEnum,
    twitterUsername: z.nullable(z.string()),
    pinnedActivityId: z.nullable(z.string().regex(/^\d+$/)),
    profileDecoration: z.nullable(z.string().max(500, "CSS String too long, maximum length: 500"))
}) satisfies {
    _output: Omit<Prisma.ProfileUpdateInput, "id">
}

export const zUser = z.object({
    bungieMembershipId: z.string(),
    role: z.nativeEnum(Role),
    email: z.string().nullable().default(null),
    emailVerified: z.nullable(z.date())
}) satisfies {
    _output: Omit<Prisma.UserUpdateInput, "id">
}

const zProfileDecoration = z.string().regex(/^#[A-Fa-f0-9]{8}$/, "Invalid color code")

export const zModifiableProfile = z
    .object({
        pinnedActivityId: z.nullable(z.string().regex(/^\d+$/)),
        profileDecoration: zProfileDecoration.nullable()
    })
    .partial() satisfies {
    _output: Partial<z.infer<typeof zProfile>>
}

export const zUsernames = z.object({
    bungieUsername: z.string(),
    discordUsername: z.string().nullable().default(null),
    twitterUsername: z.string().nullable().default(null),
    twitchUsername: z.string().nullable().default(null),
    youtubeUsername: z.string().nullable().default(null)
}) satisfies {
    _output: Partial<z.infer<typeof zProfile>>
}

export const zUniqueDestinyProfile = z.object({
    destinyMembershipType: z.union([
        BungieMembershipEnum,
        z
            .string()
            .regex(/^\d+$/)
            .transform(str => BungieMembershipEnum.parse(Number(str)))
    ]),
    destinyMembershipId: z.string().regex(/^\d+$/)
}) satisfies {
    _output: {
        destinyMembershipId: string
        destinyMembershipType: BungieMembershipType
    }
}

export const zRaidURIComponent = z
    .string()
    .refine((key): key is keyof typeof UrlPathsToRaid => key in UrlPathsToRaid)
    .transform(key => UrlPathsToRaid[key])

export const zCreateVanity = z.object({
    destinyMembershipId: z.string().transform(s => s.toLowerCase()),
    destinyMembershipType: BungieMembershipEnum,
    string: z.string()
})

export const numberString = z.coerce.string().regex(/^\d+$/)
export const booleanString = z
    .string()
    .transform(s => JSON.parse(s))
    .pipe(z.boolean())
