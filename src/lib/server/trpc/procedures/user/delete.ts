import { protectedProcedure } from "../.."

export const deleteUser = protectedProcedure.mutation(async ({ ctx }) => {
    const [, deleted] = await ctx.prisma.$transaction([
        // disconnect all profiles before deleting the user
        ctx.prisma.profile.updateMany({
            where: {
                bungieMembershipId: ctx.session.user.id
            },
            data: {
                bungieMembershipId: null
            }
        }),
        ctx.prisma.user.delete({
            where: {
                id: ctx.session.user.id
            }
        })
    ])

    await ctx.signOut({
        redirect: false
    })

    return deleted
})
