import { type MetadataRoute } from "next"

const OpenGraphUserAgents = [
    "Discordbot",
    "Twitterbot",
    "facebookexternalhit",
    "WhatsApp",
    "AppleBot",
    "LinkedInBot",
    "Slackbot",
    "redditbot"
]

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            ...OpenGraphUserAgents.map(userAgent => ({ userAgent })),
            {
                userAgent: "*",
                disallow: "/pgcr/"
            }
        ]
    }
}
