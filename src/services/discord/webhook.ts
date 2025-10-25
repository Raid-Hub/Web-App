import "server-only"
import { saferFetch } from "~/lib/server/saferFetch"

export interface DiscordWebhookData {
    embeds: [
        {
            color?: number
            title?: string
            description?: string
            fields?: {
                name: string
                value: string
                inline: boolean
            }[]
        }
    ]
}

export enum DiscordColors {
    RED = 0xef0c09
}

export const sendDiscordWebhook = async (url: string, data: DiscordWebhookData) => {
    const webhookResponse = await saferFetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            embeds: data.embeds.slice(0, 10).map(embed => ({
                ...embed,
                fields: embed.fields?.slice(0, 25).map(field => ({
                    ...field,
                    name: field.name.slice(0, 256),
                    value: field.value.slice(0, 1024)
                }))
            }))
        })
    })
    if (!webhookResponse.ok) {
        throw new Error(`[${webhookResponse.status}] ${await webhookResponse.text()}`)
    }
}
