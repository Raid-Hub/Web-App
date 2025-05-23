import { createTRPCReact } from "@trpc/react-query"
import { type AppRouter } from "~/lib/server/trpc"

export const trpc = createTRPCReact<AppRouter>()
