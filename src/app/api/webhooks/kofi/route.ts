import { NextResponse, type NextRequest } from "next/server"

export const runtime = "edge"

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const { verification_token, url, from_name, ...data } = JSON.parse(
            formData.get("data") as string
        ) as {
            type: "Donation" | "Subscription" | "Commission" | "Shop Order"
            from_name: string
            verification_token: string
            url: string
        } & Record<string, unknown>

        if (
            typeof verification_token !== "string" ||
            verification_token !== process.env.KOFI_VERIFICATION_TOKEN
        ) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Prevents the webhook from sending sensitive data
        delete data.shipping

        return fetch(process.env.KOFI_WEBHOOK_URL!, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                embeds: [
                    {
                        author: {
                            name: from_name
                        },
                        title: data.type,
                        url,
                        description: "A new Ko-Fi payment was made.",
                        color: 16735835,
                        fields: Object.entries(data).map(([key, value]) => ({
                            name: snakeToText(key),
                            value: JSON.stringify(value),
                            inline: true
                        }))
                    }
                ]
            })
        }).catch(e => {
            console.error(e)
            return NextResponse.json({ status: "discord error" }, { status: 500 })
        })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ status: "error" }, { status: 400 })
    }
}

const snakeToText = (key: string) =>
    key
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
