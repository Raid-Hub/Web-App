import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { z } from "zod"
import { protectedProcedure } from "../../.."

// delete account from user
export const removeProvider = protectedProcedure
    .input(
        z.object({
            providerId: z.enum(["discord", "twitch", "twitter", "youtube", "speedrun"])
        })
    )
    .mutation(async ({ input, ctx }) => {
        const userId = ctx.session.user.id
        const providerId = input.providerId

        try {
            await ctx.prisma.account.delete({
                where: {
                    uniqueProviderUser: {
                        provider: providerId,
                        userId: userId
                    }
                }
            })
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
                return
            }

            throw e
        }
    })
