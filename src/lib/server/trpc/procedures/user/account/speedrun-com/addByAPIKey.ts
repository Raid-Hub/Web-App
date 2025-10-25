import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { saferFetch } from "~/lib/server/saferFetch"
import { protectedProcedure } from "../../../.."

export const addByAPIKey = protectedProcedure
    .input(
        z.object({
            apiKey: z.string()
        })
    )
    .mutation(async ({ input, ctx }) => {
        const url = "https://www.speedrun.com/api/v1/profile"
        const headers = {
            Accept: "application/json",
            "X-API-Key": input.apiKey
        }

        const data = await saferFetch(url, {
            method: "GET",
            headers: headers
        }).then(async res => {
            const json = (await res.json()) as {
                data: {
                    id: string
                    weblink: string
                    names: { international: string }
                }
            }
            if (res.ok) {
                return json
            } else if (res.status === 403) {
                throw new TRPCError({
                    message: "Invalid API key.",
                    code: "BAD_REQUEST"
                })
            } else {
                throw new Error(`[${res.status}] Something went wrong.`)
            }
        })

        const {
            data: {
                id,
                weblink,
                names: { international: username }
            }
        } = z
            .object({
                data: z.object({
                    id: z.string(),
                    weblink: z.string().url(),
                    names: z.object({
                        international: z.string()
                    })
                })
            })
            .parse(data)

        await ctx.prisma.account.create({
            data: {
                displayName: username,
                provider: "speedrun",
                providerAccountId: id,
                type: "api-key",
                url: weblink,
                user: {
                    connect: {
                        id: ctx.session.user.id
                    }
                }
            }
        })

        return {
            username: username
        }
    })
