import { protectedProcedure } from "../.."

export const getConnections = protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const data = await ctx.prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        },
        select: {
            accounts: {
                select: {
                    provider: true,
                    displayName: true
                },
                where: {
                    provider: {
                        in: ["discord", "twitch", "twitter", "youtube", "speedrun"]
                    }
                }
            }
        }
    })

    return new Map(data.accounts.map(({ provider, displayName }) => [provider, displayName]))
})
