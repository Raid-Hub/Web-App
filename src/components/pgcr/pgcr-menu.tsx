"use client"

import { AlertTriangle, Ban, MoreVertical, Share2, ShieldCheck } from "lucide-react"
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
import { BlacklistModal } from "./pgcr-blacklist-modal"
import { ReportModal } from "./pgcr-report-modal"

export const PGCRMenu = () => {
    const session = useSession()
    const { data, setIsBlacklisted } = usePGCRContext()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isReportModalOpen, setIsReportModalOpen] = useState(false)
    const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false)

    const isAdmin = session.data?.user.role === "ADMIN"

    const unblacklistMutation = useRaidHubBlacklist(data.instanceId, {
        onSuccess: blacklisted => {
            setIsBlacklisted(blacklisted)
            toast.success(`Instance ${data.instanceId} has been removed from the blacklist`)
        },
        onError: error => {
            toast.error(`Failed to remove instance ${data.instanceId} from the blacklist`, {
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

                        {isAdmin &&
                            (data.isBlacklisted ? (
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    disabled={unblacklistMutation.isLoading}
                                    onSelect={event => {
                                        event.preventDefault()
                                        unblacklistMutation.mutate({
                                            removeBlacklist: true,
                                            reason: "Instance cleared from blacklist"
                                        })
                                    }}>
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    <span>Remove from Blacklist</span>
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-500"
                                    onClick={() => {
                                        setIsMenuOpen(false)
                                        setIsBlacklistModalOpen(true)
                                    }}>
                                    <Ban className="mr-2 h-4 w-4" />
                                    <span>Blacklist Instance</span>
                                </DropdownMenuItem>
                            ))}
                    </>
                )}
            </DropdownMenuContent>
            <ReportModal
                reporterProfiles={session.data?.user.profiles.map(p => p.destinyMembershipId) ?? []}
                open={isReportModalOpen}
                onOpenChange={setIsReportModalOpen}
            />
            <BlacklistModal
                open={isBlacklistModalOpen}
                onOpenChange={setIsBlacklistModalOpen}
                onSuccess={blacklisted => {
                    setIsBlacklisted(blacklisted)
                    toast.success(`Instance ${data.instanceId} has been blacklisted`)
                }}
            />
        </DropdownMenu>
    )
}
