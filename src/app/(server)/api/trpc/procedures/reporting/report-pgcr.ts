import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { zPgcrReport } from "~/lib/reporting"
import { protectedProcedure } from "../.."

export const reportPGCR = protectedProcedure
    .input(
        zPgcrReport.extend({
            instanceId: z.string().regex(/^\d+$/).min(9).max(12),
            selfParticipation: z.boolean()
        })
    )
    .mutation(async ({ input, ctx }) => {
        const existingReports = await ctx.prisma.pgcrReport.findMany({
            where: {
                instanceId: input.instanceId,
                reporterId: ctx.session.user.id
            }
        })

        if (existingReports.length >= 3) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You have already reported this PGCR the maximum number of times."
            })
        }

        const createdReport = await ctx.prisma.pgcrReport.create({
            data: {
                pgcr: {
                    connectOrCreate: {
                        where: {
                            instanceId: input.instanceId
                        },
                        create: {
                            instanceId: input.instanceId
                        }
                    }
                },
                categories: input.categories.join(", "),
                heuristics: input.heuristics.join(", "),
                explanation: input.explanation,
                isReporterInInstance: input.selfParticipation,
                players: input.suspectedPlayers.join(", "),
                reporter: {
                    connect: {
                        id: ctx.session.user.id
                    }
                }
            }
        })

        return createdReport
    })
