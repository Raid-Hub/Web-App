"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Loader2, Search, TriangleAlert } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { cn } from "~/lib/tw"
import type { InstancePlayerFlag, RaidHubPlayerStandingResponse } from "~/services/raidhub/types"
import { usePlayerStanding } from "~/services/raidhub/usePlayerStanding"
import { useRaidHubUpdatePlayer } from "~/services/raidhub/useRaidHubUpdatePlayer"
import { Button } from "~/shad/button"
import { Input } from "~/shad/input"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger
} from "~/shad/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/shad/table"
import { bungieIconUrl, getBungieDisplayName } from "~/util/destiny"
import { getRelativeTime } from "~/util/presentation/pastDates"
import { AdminPageHeader } from "../admin-page-header"
import { ReportPanelItemBox } from "../reporting/report-panel-item-box"

const cheatLevelStrings = {
    0: "None",
    1: "Suspicious",
    2: "Moderate",
    3: "Extreme",
    4: "Blacklisted"
}

const CheatFlags: Record<number, string> = {
    33: "Bit 33",
    34: "Bit 34",
    35: "Bit 35",
    36: "Bit 36",
    37: "Bit 37",
    38: "Bit 38",
    39: "Bit 39",
    40: "Bit 40",
    41: "Bit 41",
    42: "Bit 42",
    43: "Bit 43",
    44: "Bit 44",
    45: "Bit 45",
    46: "Bit 46",
    47: "Bit 47",
    48: "Bit 48",
    49: "Bit 49",
    50: "Bit 50",
    51: "Bit 51",
    52: "Bit 52",
    53: "Solo",
    54: "Total Instance Kills",
    55: "Two Plus Cheaters",
    56: "Player Total Kills",
    57: "Player Weapon Diversity",
    58: "Player Super Kills",
    59: "Player Grenade Kills",
    60: "Too Fast",
    61: "Too Few Players Fresh",
    62: "Too Few Players Checkpoint"
}

function getCheatCheckReasonsFromBitmask(bitmask: string): string[] {
    const reasons: string[] = []
    const bitmaskNumber = BigInt(bitmask)
    for (let i = 0; i < 64; i++) {
        const flag = BigInt(1) << BigInt(i)
        if ((bitmaskNumber & flag) === flag) {
            const reason = CheatFlags[i]
            if (reason) {
                reasons.push(reason)
            }
        }
    }

    if (reasons.length === 0) {
        return ["Unspecified"]
    }

    return reasons
}

export function PlayerStandingDashboard() {
    const [searchInput, setSearchInput] = useState("")
    const [membershipId, setMembershipId] = useState<string | null>(null)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchInput.trim()) {
            setMembershipId(searchInput.trim())
        }
    }

    const { data, isLoading, error } = usePlayerStanding(membershipId)

    return (
        <div className="flex h-full flex-col">
            <AdminPageHeader
                title="Player Standing"
                description="Look up a player by membership ID to view their standing, recent flags, and blacklisted instances"
            />

            <div className="flex-1 space-y-6 p-4">
                {/* Search Section */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Enter player membership ID (e.g., 4611686018488107374)"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Search className="size-4" />
                        )}
                        Search
                    </Button>
                </form>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="size-8 animate-spin text-white/60" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="rounded-sm border border-red-400/30 bg-red-900/20 p-4 text-red-400">
                        <p className="font-medium">Error loading player data</p>
                        <p className="text-sm">{error.message}</p>
                    </div>
                )}

                {/* Empty State */}
                {!membershipId && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Search className="mb-4 size-12 text-white/40" />
                        <p className="text-lg font-medium text-white/80">
                            Enter a membership ID to get started
                        </p>
                        <p className="text-sm text-white/60">
                            Search for a player to view their standing and history
                        </p>
                    </div>
                )}

                {/* Player Standing Display */}
                {data && !isLoading && (
                    <div className="space-y-6">
                        <PlayerInfoCard data={data} membershipId={membershipId!} />
                        <RecentFlagsTable flags={data.recentFlags} />
                        <BlacklistedInstancesTable instances={data.blacklistedInstances} />
                    </div>
                )}
            </div>
        </div>
    )
}

function PlayerInfoCard({
    data,
    membershipId
}: {
    data: RaidHubPlayerStandingResponse
    membershipId: string
}) {
    const [selectedCheatLevel, setSelectedCheatLevel] = useState(data.playerInfo.cheatLevel)
    const queryClient = useQueryClient()

    const updatePlayer = useRaidHubUpdatePlayer(membershipId, {
        onSuccess: () => {
            toast.success("Player updated successfully", {
                description: `Player ${getBungieDisplayName(data.playerInfo)} updated`
            })
            queryClient.setQueryData<RaidHubPlayerStandingResponse>(
                ["raidhub", "player-standing", membershipId],
                old => {
                    if (!old) return old
                    return {
                        ...old,
                        playerInfo: {
                            ...old.playerInfo,
                            cheatLevel: selectedCheatLevel
                        }
                    }
                }
            )
        },
        onError: error => {
            toast.error("Failed to update player", {
                description: error.message
            })
        }
    })

    const handleSave = () => {
        updatePlayer.mutate({
            cheatLevel: selectedCheatLevel
        })
    }

    return (
        <ReportPanelItemBox title="Player Information">
            <div className="space-y-4">
                {/* Player Header */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3">
                        {data.playerInfo.iconPath && (
                            <Image
                                unoptimized
                                src={bungieIconUrl(data.playerInfo.iconPath)}
                                alt="Player icon"
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-sm"
                            />
                        )}
                        <div>
                            <h3 className="text-lg font-medium">
                                {getBungieDisplayName(data.playerInfo)}
                            </h3>
                            <Link
                                href={`/profile/${data.playerInfo.membershipId}`}
                                target="_blank"
                                className="text-sm text-hyperlink">
                                {data.playerInfo.membershipId}
                            </Link>
                        </div>
                    </div>

                    {/* Cheat Level Selector */}
                    <div className="flex items-center gap-2">
                        <Select
                            onValueChange={value =>
                                setSelectedCheatLevel(
                                    parseInt(value, 10) as keyof typeof cheatLevelStrings
                                )
                            }
                            defaultValue={data.playerInfo.cheatLevel.toString()}>
                            <SelectTrigger
                                size="sm"
                                className={cn("rounded-sm px-2 py-1 text-xs", {
                                    "border-red-400/30 bg-red-900/20 text-red-400":
                                        selectedCheatLevel >= 3,
                                    "border-orange-400/30 bg-orange-800/20 text-orange-500":
                                        selectedCheatLevel === 2,
                                    "border-yellow-400/30 bg-yellow-900/20 text-yellow-400":
                                        selectedCheatLevel === 1,
                                    "border-green-400/30 bg-green-900/20 text-green-400":
                                        selectedCheatLevel === 0
                                })}
                                chevronClassName={cn({
                                    "text-red-400": selectedCheatLevel >= 3,
                                    "text-orange-400": selectedCheatLevel === 2,
                                    "text-yellow-400": selectedCheatLevel === 1,
                                    "text-green-400": selectedCheatLevel === 0
                                })}>
                                Cheat Level: {cheatLevelStrings[selectedCheatLevel]}
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Cheat Level</SelectLabel>
                                    {Object.entries(cheatLevelStrings).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {selectedCheatLevel !== data.playerInfo.cheatLevel && (
                            <Button
                                size="sm"
                                onClick={handleSave}
                                className="h-8 text-sm"
                                disabled={updatePlayer.isLoading}>
                                <TriangleAlert className="size-4" />
                                Save Cheat Level
                            </Button>
                        )}
                    </div>
                </div>

                {/* Player Details */}
                <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                    <div className="flex justify-start gap-2">
                        <span className="text-white/60">Last Seen:</span>
                        <span>{new Date(data.playerInfo.lastSeen).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-start gap-2">
                        <span className="text-white/60">Private Profile:</span>
                        <span>{data.playerInfo.isPrivate ? "Yes" : "No"}</span>
                    </div>
                </div>
            </div>
        </ReportPanelItemBox>
    )
}

function RecentFlagsTable({
    flags
}: {
    flags: readonly (InstancePlayerFlag & { readonly instanceDate: string })[]
}) {
    return (
        <ReportPanelItemBox title="Recent Flags">
            {flags.length > 0 ? (
                <div className="overflow-hidden rounded-sm bg-black/20">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10">
                                <TableHead className="text-white/60">Instance ID</TableHead>
                                <TableHead className="text-white/60">Instance Date</TableHead>
                                <TableHead className="text-white/60">Flagged At</TableHead>
                                <TableHead className="text-white/60">Probability</TableHead>
                                <TableHead className="text-white/60">Detection</TableHead>
                                <TableHead className="text-white/60">Check Version</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {flags.map((flag, idx) => (
                                <TableRow key={idx} className="border-white/10">
                                    <TableCell className="text-sm">
                                        <Link
                                            className="text-hyperlink"
                                            href={`/pgcr/${flag.instanceId}`}
                                            target="_blank">
                                            {flag.instanceId}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {new Date(flag.instanceDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {getRelativeTime(new Date(flag.flaggedAt))}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        <span
                                            className={cn(
                                                flag.cheatProbability > 0.7
                                                    ? "text-red-600"
                                                    : flag.cheatProbability > 0.4
                                                      ? "text-red-400"
                                                      : flag.cheatProbability > 0.15
                                                        ? "text-yellow-400"
                                                        : "text-green-400"
                                            )}>
                                            {(flag.cheatProbability * 100).toFixed(2)}%
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {getCheatCheckReasonsFromBitmask(flag.cheatCheckBitmask).join(
                                            ", "
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm">{flag.cheatCheckVersion}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-sm text-white/60">No recent flags for this player</p>
            )}
        </ReportPanelItemBox>
    )
}

function BlacklistedInstancesTable({
    instances
}: {
    instances: readonly {
        readonly instanceId: string
        readonly instanceDate: string
        readonly reason: string
        readonly individualReason: string | null
        readonly createdAt: string
    }[]
}) {
    return (
        <ReportPanelItemBox title="Blacklisted Instances">
            {instances.length > 0 ? (
                <div className="overflow-hidden rounded-sm bg-black/20">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10">
                                <TableHead className="text-white/60">Instance ID</TableHead>
                                <TableHead className="text-white/60">Instance Date</TableHead>
                                <TableHead className="text-white/60">Reason</TableHead>
                                <TableHead className="text-white/60">Individual Reason</TableHead>
                                <TableHead className="text-white/60">Blacklisted At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {instances.map((instance, idx) => (
                                <TableRow key={idx} className="border-white/10">
                                    <TableCell className="text-sm">
                                        <Link
                                            className="text-hyperlink"
                                            href={`/pgcr/${instance.instanceId}`}
                                            target="_blank">
                                            {instance.instanceId}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {new Date(instance.instanceDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-sm">{instance.reason}</TableCell>
                                    <TableCell className="text-sm">
                                        {instance.individualReason ?? "-"}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {new Date(instance.createdAt).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-sm text-white/60">No blacklisted instances for this player</p>
            )}
        </ReportPanelItemBox>
    )
}
