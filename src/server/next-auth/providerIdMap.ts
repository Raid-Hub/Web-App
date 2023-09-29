import { z } from "zod"
import { zUsernames } from "~/util/zod"

export const providerIdToUsernamePropMap = {
    bungie: "bungieUsername",
    discord: "discordUsername",
    twitter: "twitterUsername",
    twitch: "twitchUsername",
    google: "youtubeUsername"
} satisfies Record<string, keyof z.infer<typeof zUsernames>>
