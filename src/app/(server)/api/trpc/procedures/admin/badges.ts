import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { adminProcedure } from "../.."

const badgeExtension = adminProcedure.use(({ ctx, next }) => {
    return next({
        ctx: {
            ...ctx,
            getBadge: async (id: string) => ctx.prisma.badge.findUnique({ where: { id } }),
            updateBadges: async (
                {
                    destinyMembershipId,
                    badgeId
                }: {
                    destinyMembershipId: string
                    badgeId: string
                },
                type: "connect" | "disconnect"
            ) =>
                ctx.prisma.profile
                    .update({
                        where: {
                            destinyMembershipId: destinyMembershipId
                        },
                        data: {
                            user: {
                                update: {
                                    badges: {
                                        [type]: {
                                            id: badgeId
                                        }
                                    }
                                }
                            }
                        },
                        select: {
                            user: {
                                select: {
                                    badges: true,
                                    name: true
                                }
                            }
                        }
                    })
                    .then(result => result.user)
        }
    })
})

export const listBadges = adminProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.badge.findMany()
})

export const addBadge = badgeExtension
    .input(
        z.object({
            destinyMembershipId: z
                .string()
                .regex(/^\d+$/)
                .refine(s => s.length === 19),
            badgeId: z.string()
        })
    )
    .mutation(async ({ ctx, input }) => {
        const badge = await ctx.getBadge(input.badgeId)

        if (!badge) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Badge with id ${input.badgeId} not found`
            })
        }

        const updatedUser = await ctx.updateBadges(input, "connect")

        if (!updatedUser) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: `User with destinyMembershipId ${input.destinyMembershipId} not found`
            })
        }

        return updatedUser
    })

export const removeBadge = badgeExtension
    .input(
        z.object({
            destinyMembershipId: z
                .string()
                .regex(/^\d+$/)
                .refine(s => s.length === 19),
            badgeId: z.string()
        })
    )
    .mutation(async ({ ctx, input }) => {
        const badge = await ctx.getBadge(input.badgeId)

        if (!badge) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Badge with id ${input.badgeId} not found`
            })
        }

        const updatedUser = await ctx.updateBadges(input, "disconnect")

        if (!updatedUser) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: `User with destinyMembershipId ${input.destinyMembershipId} not found`
            })
        }

        return updatedUser
    })

export const createBadge = badgeExtension
    .input(
        z.object({
            name: z.string(),
            description: z.string(),
            id: z.string(),
            iconFileName: z.string().regex(/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/)
        })
    )
    .mutation(async ({ ctx, input }) => {
        return await ctx.prisma.badge.create({
            data: {
                id: input.id,
                name: input.name,
                description: input.description,
                icon: "/icons/badges/" + input.iconFileName
            }
        })
    })
