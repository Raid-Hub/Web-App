"use client"

import { AlertTriangle, Ban, MoreVertical, Share2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useSession } from "~/hooks/app/useSession"
import { usePGCRContext } from "~/hooks/pgcr/ClientStateManager"
import { useRaidHubBlacklist } from "~/services/raidhub/useRaidHubBlacklist"
import { Button } from "~/shad/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "~/shad/dropdown-menu"
import { ReportModal } from "./pgcr-report-modal"

export const PGCRMenu = () => {
    const session = useSession()
    const { data } = usePGCRContext()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isReportModalOpen, setIsReportModalOpen] = useState(false)
    const [isBlacklisted, setIsBlacklisted] = useState(data.isBlacklisted)

    const isAdmin = session.data?.user.role === "ADMIN"

    const blacklistMutation = useRaidHubBlacklist(data.instanceId, {
        onSuccess: blacklisted => {
            setIsBlacklisted(blacklisted)
            toast.success(`Instance ${data.instanceId} has been blacklisted`)
        },
        onError: error => {
            toast.error(`Failed to blacklist instance ${data.instanceId}`, {
                description: error.message
            })
        }
    })

    return (
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-zinc-900/50">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={async () => {
                        await navigator.clipboard.writeText(window.location.href)
                        toast.success("Link copied to clipboard")
                    }}>
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Share</span>
                </DropdownMenuItem>
                {session.status === "authenticated" && (
                    <>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            className="cursor-pointer text-red-500"
                            onClick={() => {
                                setIsMenuOpen(false)
                                setIsReportModalOpen(true)
                            }}>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            <span>Report</span>
                        </DropdownMenuItem>

                        {isAdmin && (
                            <DropdownMenuItem
                                className="cursor-pointer text-red-500"
                                disabled={isBlacklisted || blacklistMutation.isLoading}
                                onSelect={event => {
                                    event.preventDefault()
                                    blacklistMutation.mutate({
                                        removeBlacklist: false,
                                        reason: "Blacklisted by an administrator from the PGCR page"
                                    })
                                }}>
                                <Ban className="mr-2 h-4 w-4" />
                                <span>
                                    {isBlacklisted ? "Blacklisted" : "Blacklist Instance"}
                                </span>
                            </DropdownMenuItem>
                        )}
                    </>
                )}
            </DropdownMenuContent>
            <ReportModal
                reporterProfiles={session.data?.user.profiles.map(p => p.destinyMembershipId) ?? []}
                open={isReportModalOpen}
                onOpenChange={setIsReportModalOpen}
            />
        </DropdownMenu>
    )
}
