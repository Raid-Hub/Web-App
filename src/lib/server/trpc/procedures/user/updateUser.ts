import { revalidatePath } from "next/cache"
import { z } from "zod"
import { protectedProcedure } from "../.."

export const updateUser = protectedProcedure
    .input(
        z.object({
            destinyMembershipId: z.string(),
            data: z.object({
                name: z.string().optional(),
                image: z.string().nullable().optional()
            })
        })
    )
    .mutation(async ({ input, ctx }) => {
        const updated = await ctx.prisma.user.update({
            where: {
                id: ctx.session.user.id
            },
            data: {
                name: input.data.name,
                image: input.data.image
            },
            include: {
                profiles: {
                    select: {
                        destinyMembershipId: true,
                        vanity: true
                    }
                }
            }
        })

        updated.profiles.forEach(p => {
            if (p.vanity) {
                revalidatePath(`/user/${p.vanity}`)
            }
            revalidatePath(`/profile/${p.destinyMembershipId}`)
        })

        return updated
    })
