import { type inferRouterOutputs } from "@trpc/server"
import { type AppRouter } from "~/lib/server/trpc"

export type RouterOutput = inferRouterOutputs<AppRouter>

/** tRPC `user.discordLinkedRolesStatus` — use from client UI instead of importing server procedure types. */
export type DiscordLinkedRoleSyncHealth = RouterOutput["user"]["discordLinkedRolesStatus"]["syncHealth"]

export type AppProfile = RouterOutput["profile"]["getUnique"]
export type AppUserUpdate = RouterOutput["user"]["update"]
export type AppRole = "ADMIN" | "USER"

export { type PGCRReportDetails } from "~/lib/server/trpc/procedures/admin/reports"
