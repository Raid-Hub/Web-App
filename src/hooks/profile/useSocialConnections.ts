import { TwitchIcon, TwitterIcon, YoutubeIcon, type LucideProps } from "lucide-react"
import { useMemo } from "react"
import { usePageProps } from "~/components/PageWrapper"
import { DiscordIcon } from "~/components/icons/DiscordIcon"
import { SpeedrunIcon } from "~/components/icons/SpeedrunIcon"
import type { ProfileProps } from "~/lib/profile/types"
import { trpc } from "~/lib/trpc"

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
            Icon: React.ForwardRefExoticComponent<
                Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
            >
            displayName: string
            url: string | null
        }>()
        const connections = appProfileQuery.data.connections
        const discord = connections?.find(c => c.provider === "discord")
        if (discord?.displayName) {
            socials.push({
                id: Socials.Discord,
                Icon: DiscordIcon,
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
