import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { TRPCError } from "@trpc/server"
import { getLinkedProfiles } from "bungie-net-core/endpoints/Destiny2"
import { revalidatePath, revalidateTag } from "next/cache"
import { z } from "zod"
import ServerBungieClient from "~/services/bungie/ServerBungieClient"
import { adminProcedure } from "../.."

export const createVanity = adminProcedure
    .input(
        z.object({
            destinyMembershipId: z
                .string()
                .regex(/^\d+$/)
                .refine(s => s.length === 19),
            vanity: z.string().transform(s => s.toLowerCase())
        })
    )
    .mutation(async ({ ctx, input }) => {
        async function updateProfileWithVanity() {
            const profile = await ctx.prisma.profile.findUnique({
                where: {
                    destinyMembershipId: input.destinyMembershipId
                }
            })

            if (profile) {
                return await ctx.prisma.profile.update({
                    where: {
                        destinyMembershipId: input.destinyMembershipId
                    },
                    data: {
                        vanity: input.vanity
                    },
                    select: {
                        vanity: true,
                        destinyMembershipId: true,
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                })
            } else {
                // Ensure the profile exists according to Bungie
                const d2Profile = await getLinkedProfiles(
                    new ServerBungieClient({
                        timeout: 10000
                    }),
                    {
                        membershipId: input.destinyMembershipId,
                        membershipType: -1
                    }
                ).then(res =>
                    res.Response.profiles.find(
                        p =>
                            p.membershipType > 0 &&
                            p.membershipType < 254 &&
                            p.membershipId === input.destinyMembershipId
                    )
                )

                if (!d2Profile) {
                    throw new TRPCError({
                        message: "Destiny profile not found",
                        code: "BAD_REQUEST"
                    })
                }

                return await ctx.prisma.profile.create({
                    data: {
                        destinyMembershipId: d2Profile.membershipId,
                        destinyMembershipType: d2Profile.membershipType,
                        vanity: input.vanity,
                        isPrimary: false
                    },
                    select: {
                        vanity: true,
                        destinyMembershipId: true,
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                })
            }
        }

        try {
            const updated = await updateProfileWithVanity()

            revalidatePath(`/profile/${updated.destinyMembershipId}`)
            revalidatePath(`/user/${updated.vanity}`)
            revalidateTag("vanity")

            return updated
        } catch (err) {
            if (
                err instanceof PrismaClientKnownRequestError &&
                err.code === "P2002" &&
                err.meta &&
                err.meta.modelName === "Profile" &&
                Array.isArray(err.meta.target) &&
                err.meta.target.length === 1 &&
                err.meta.target.includes("vanity")
            ) {
                throw new TRPCError({
                    message: "Vanity already exists",
                    code: "BAD_REQUEST"
                })
            } else {
                throw err
            }
        }
    })

export const removeVanity = adminProcedure
    .input(
        z.object({
            vanity: z.string().transform(s => s.toLowerCase())
        })
    )
    .mutation(async ({ ctx, input }) => {
        try {
            await ctx.prisma.profile.findUniqueOrThrow({
                where: {
                    vanity: input.vanity
                }
            })
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
                throw new TRPCError({
                    message: err.message,
                    code: "BAD_REQUEST"
                })
            } else {
                throw err
            }
        }

        const updated = await ctx.prisma.profile.update({
            where: {
                vanity: input.vanity
            },
            data: {
                vanity: null
            },
            select: {
                destinyMembershipId: true,
                user: {
                    select: {
                        name: true
                    }
                }
            }
        })

        revalidatePath(`/profile/${updated.destinyMembershipId}`)
        revalidatePath(`/user/${input.vanity}`)
        revalidateTag("vanity")

        return updated
    })
