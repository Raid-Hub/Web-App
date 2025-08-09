import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { protectedProcedure } from "../.."

const zInstanceId = z.string().regex(/^\d+$/).min(9).max(12)
const zName = z.string().min(2).max(100)

const MAX_SIZE = 50

export const getMultiPGCR = protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
        const multi = await ctx.prisma.pgcrMulti.findUnique({
            where: { id: input.id },
            include: { instances: true }
        })

        if (!multi) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Multi PGCR not found"
            })
        }

        return multi
    })

export const createMultiPGCR = protectedProcedure
    .input(
        z.object({
            name: zName,
            instances: z.array(zInstanceId).min(2).max(MAX_SIZE)
        })
    )
    .mutation(async ({ input, ctx }) => {
        const createdMulti = await ctx.prisma.pgcrMulti.create({
            data: {
                name: input.name,
                owner: {
                    connect: {
                        id: ctx.session.user.id
                    }
                },
                instances: {
                    create: input.instances.map(instanceId => ({ instanceId }))
                }
            }
        })

        return createdMulti
    })

export const updateMultiPGCR = protectedProcedure
    .input(
        z.object({
            id: z.string(),
            name: zName,
            instances: z
                .object({
                    remove: z.array(zInstanceId).min(1).optional(),
                    add: z.array(zInstanceId).min(1).max(MAX_SIZE).optional()
                })
                .optional()
        })
    )
    .mutation(async ({ input, ctx }) => {
        const existingMulti = await ctx.prisma.pgcrMulti.findUnique({
            where: {
                id: input.id
            },
            select: {
                id: true,
                ownerId: true,
                _count: {
                    select: {
                        instances: true
                    }
                }
            }
        })

        if (existingMulti?.ownerId !== ctx.session.user.id) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You do not own this Multi PGCR"
            })
        }

        if (!existingMulti) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Multi PGCR not found"
            })
        }

        if (
            (!!input.instances?.add &&
                existingMulti._count.instances + input.instances.add.length > MAX_SIZE) ||
            (!!input.instances?.remove &&
                existingMulti._count.instances - input.instances.remove.length < 2)
        ) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Cannot add more than ${MAX_SIZE} instances`
            })
        }

        const updatedMulti = await ctx.prisma.pgcrMulti.update({
            where: {
                id: input.id
            },
            data: {
                name: input.name,
                instances: {
                    deleteMany: input.instances?.remove
                        ? {
                              instanceId: {
                                  in: input.instances.remove
                              }
                          }
                        : undefined,
                    create: input.instances?.add
                        ? input.instances.add.map(instanceId => ({ instanceId }))
                        : undefined
                }
            }
        })

        // TODO: revalidate

        return updatedMulti
    })
