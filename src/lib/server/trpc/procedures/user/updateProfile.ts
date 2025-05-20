import { TRPCError } from "@trpc/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { protectedProcedure } from "../.."

export const updateProfile = protectedProcedure
    .input(
        z.object({
            destinyMembershipId: z.string(),
            data: z.object({
                pinnedActivityId: z.string().nullable().optional()
            })
        })
    )
    .mutation(async ({ input, ctx }) => {
        if (
            !ctx.session.user.profiles.some(
                p => p.destinyMembershipId === input.destinyMembershipId
            )
        ) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You do not have access to this profile."
            })
        }

        const updated = await ctx.prisma.profile.update({
            where: {
                destinyMembershipId: input.destinyMembershipId
            },
            data: {
                pinnedActivityId: input.data.pinnedActivityId
            }
        })

        if (updated.vanity) {
            revalidatePath(`/user/${updated.vanity}`)
        }
        revalidatePath(`/profile/${updated.destinyMembershipId}`)

        return updated
    })
