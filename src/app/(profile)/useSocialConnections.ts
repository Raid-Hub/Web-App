import { useMemo } from "react"
import { type SVGWrapperProps } from "~/components/SVG"
import { DiscordIconOld } from "~/components/icons/DiscordIcon"
import SpeedrunIcon from "~/components/icons/SpeedrunIcon"
import TwitchIcon from "~/components/icons/TwitchIcon"
import TwitterIcon from "~/components/icons/TwitterIcon"
import YoutubeIcon from "~/components/icons/YoutubeIcon"
import { usePageProps } from "~/components/layout/PageWrapper"
import { trpc } from "~/lib/trpc"
import type { ProfileProps } from "./types"

enum Socials {
    Twitter,
    Discord,
    YouTube,
    Twitch,
    Speedrun
}

export const useSocialConnections = () => {
    const { destinyMembershipId, ready } = usePageProps<ProfileProps>()

    const appProfileQuery = trpc.profile.getUnique.useQuery(
        {
            destinyMembershipId: destinyMembershipId
        },
        {
            // Required to prevent the query from running before the page is ready
            enabled: ready
        }
    )

    return useMemo(() => {
        if (!appProfileQuery.data) return null
        const socials = new Array<{
            id: Socials
            Icon: React.FC<SVGWrapperProps>
            displayName: string
            url: string | null
        }>()
        const connections = appProfileQuery.data.connections
        const discord = connections?.find(c => c.provider === "discord")
        if (discord?.displayName) {
            socials.push({
                id: Socials.Discord,
                Icon: DiscordIconOld,
                url: discord.url,
                displayName: discord.displayName
            })
        }
        const twitter = connections?.find(c => c.provider === "twitter")
        if (twitter?.displayName) {
            socials.push({
                id: Socials.Twitter,
                Icon: TwitterIcon,
                url: twitter.url,
                displayName: twitter.displayName
            })
        }

        const youtube = connections?.find(c => c.provider === "youtube")
        if (youtube?.displayName) {
            socials.push({
                id: Socials.YouTube,
                Icon: YoutubeIcon,
                url: youtube.url,
                displayName: youtube.displayName
            })
        }

        const twitch = connections?.find(c => c.provider === "twitch")
        if (twitch?.displayName) {
            socials.push({
                id: Socials.Twitch,
                Icon: TwitchIcon,
                url: twitch.url,
                displayName: twitch.displayName
            })
        }

        const speedrun = connections?.find(c => c.provider === "speedrun")
        if (speedrun?.displayName) {
            socials.push({
                id: Socials.Speedrun,
                Icon: SpeedrunIcon,
                url: speedrun.url,
                displayName: speedrun.displayName
            })
        }

        return socials
    }, [appProfileQuery.data])
}
