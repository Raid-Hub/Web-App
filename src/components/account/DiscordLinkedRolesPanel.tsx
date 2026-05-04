"use client"

import { trpc } from "~/lib/trpc"
import { cn } from "~/lib/tw"
import { Button } from "~/components/ui/button"
import type { DiscordLinkedRoleSyncHealth } from "~/types/api"

type DiscordLinkedRolesPanelProps = {
    /** Nested under the Discord connection card (no duplicate outer chrome). */
    variant?: "standalone" | "embedded"
}

function syncHealthBanner(health: DiscordLinkedRoleSyncHealth): { tone: "muted" | "amber" | "destructive"; text: string } | null {
    switch (health) {
        case "not_linked":
            return null
        case "needs_scope":
            return {
                tone: "amber",
                text: "Reconnect Discord above and include consent for linked roles (scope role_connections.write)."
            }
        case "needs_reconnect":
            return {
                tone: "amber",
                text: "Discord rejected the last metadata update. Disconnect and reconnect Discord above, then try Sync now."
            }
        case "pending":
            return {
                tone: "muted",
                text: "RaidHub has not recorded a successful push yet. After your next qualifying raid completes—or if you use Sync now—status should update here when the worker finishes."
            }
        case "ok":
            return {
                tone: "muted",
                text: "RaidHub last pushed your stats to Discord successfully. Each server applies linked roles on its own schedule; allow a few minutes before expecting a role change."
            }
        case "error":
            return {
                tone: "destructive",
                text: "The last push did not succeed. Try Sync now. If it keeps failing, try reconnecting Discord or check back later."
            }
        default:
            return null
    }
}

export function DiscordLinkedRolesPanel({ variant = "standalone" }: DiscordLinkedRolesPanelProps) {
    const { data, refetch, isLoading } = trpc.user.discordLinkedRolesStatus.useQuery()
    const push = trpc.user.pushDiscordLinkedRoles.useMutation({
        onSuccess() {
            void refetch()
        }
    })

    if (isLoading || !data?.linked) {
        return null
    }

    const embedded = variant === "embedded"
    const banner = syncHealthBanner(data.syncHealth)
    const bannerClass =
        banner?.tone === "destructive"
            ? "text-destructive"
            : banner?.tone === "amber"
              ? "text-amber-300/90"
              : "text-muted-foreground"

    return (
        <div
            className={cn(
                embedded
                    ? "border-border/50 mt-4 border-t pt-4"
                    : "bg-card text-card-foreground mt-3 rounded-xl border border-border/60 p-4 shadow-sm"
            )}>
            <h3 className="text-foreground text-base font-semibold tracking-tight">Discord linked roles</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                RaidHub sends your linked-role metadata (for example clear totals) to Discord. Server admins map those
                fields to roles in Discord; RaidHub does not assign Discord roles directly.
            </p>
            {banner ? <p className={cn("mt-3 text-sm leading-relaxed", bannerClass)}>{banner.text}</p> : null}
            {data.lastSyncedAt ? (
                <p className="text-muted-foreground mt-2 text-xs">
                    Last synced: {new Date(data.lastSyncedAt).toLocaleString()}
                </p>
            ) : null}
            {data.lastError ? (
                <p className="text-destructive mt-2 text-xs">Error code: {data.lastError}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
                <Button
                    type="button"
                    size="sm"
                    disabled={push.isLoading || !data.roleConnectionsScopeGranted}
                    onClick={() => push.mutate()}>
                    {push.isLoading ? "Syncing…" : "Sync now"}
                </Button>
            </div>
            {push.data && !push.data.ok ? (
                <p className="text-destructive mt-3 text-xs" role="alert">
                    Sync failed: {push.data.code}
                    {push.data.code === "enqueue_failed"
                        ? " — the queue may be full. Try again in a few minutes."
                        : push.data.detail
                          ? ` — ${push.data.detail}`
                          : ""}
                </p>
            ) : null}
        </div>
    )
}
