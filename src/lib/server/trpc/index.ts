import "server-only"

import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { ZodError } from "zod"
import { getServerSession, signOut } from "~/lib/server/auth"
import { prisma } from "~/lib/server/prisma"
import { type appRouter } from "./router"

// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter

const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
            }
        }
    }
})

export const createTRPCRouter = t.router

export const createTRPCContext = () => ({ prisma: prisma })

// Procedures
export const publicProcedure = t.procedure

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
    const session = await getServerSession()

    if (!session) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    return next({
        ctx: {
            ...ctx,
            session,
            signOut: signOut
        }
    })
})

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
    if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" })
    }

    return next({
        ctx
    } as {
        ctx: typeof ctx & { session: { user: { role: "ADMIN" } } }
    })
})
