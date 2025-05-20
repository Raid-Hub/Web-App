import { Check, Shield, TriangleAlert, User, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRaidHubManifest } from "~/app/layout/wrappers/RaidHubManifestManager"
import { cn } from "~/lib/tw"
import type { InstancePlayerFlag, InstancePlayerStanding } from "~/services/raidhub/types"
import { InstanceFlag, type RaidHubInstanceStandingResponse } from "~/services/raidhub/types"
import { Badge } from "~/shad/badge"
import { Button } from "~/shad/button"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "~/shad/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/shad/table"
import { getBungieDisplayName } from "~/util/destiny"
import { secondsToHMS } from "~/util/presentation/formatting"
import { getRelativeTime } from "~/util/presentation/pastDates"

interface InstanceInfoTabProps {
    standing: RaidHubInstanceStandingResponse
}

export function InstanceInfoTab({ standing }: InstanceInfoTabProps) {
    const { getDefinitionFromHash } = useRaidHubManifest()
    const defs = getDefinitionFromHash(standing.instanceDetails.hash)
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 rounded-sm border border-white/10 bg-black/40 p-4">
                    <h3 className="mb-3 text-base font-medium">Instance Information</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-start gap-2">
                            <span className="text-white/60">Instance ID:</span>
                            <Link
                                className="text-hyperlink"
                                href={`/pgcr/${standing.instanceDetails.instanceId}`}
                                target="_blank">
                                {standing.instanceDetails.instanceId}
                            </Link>
                        </div>
                        <div className="flex justify-start gap-2">
                            <span className="text-white/60">Date:</span>
                            <span>
                                {new Date(standing.instanceDetails.dateStarted).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-start gap-2">
                            <span className="text-white/60">Activity:</span>
                            <span>
                                {defs?.activity?.name ?? "Unknown"}:{" "}
                                {defs?.version?.name ?? "Unknown"}
                                {", "}
                                {standing.instanceDetails.fresh ? "Fresh" : "Checkpoint"}
                            </span>
                            {standing.instanceDetails.completed ? (
                                <Check className="size-4 text-green-400" />
                            ) : (
                                <X className="size-4 text-red-400" />
                            )}
                        </div>
                        <div className="flex justify-start gap-2">
                            <span className="text-white/60">Players:</span>
                            <span>{standing.instanceDetails.playerCount}</span>
                        </div>
                        <div className="flex justify-start gap-2">
                            <span className="text-white/60">Duration:</span>
                            <span>{secondsToHMS(standing.instanceDetails.duration, false)}</span>
                        </div>
                        {standing.blacklist && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Blacklist Status:</span>
                                    <Badge
                                        variant="outline"
                                        className="rounded-sm border-red-400/30 bg-red-900/20 text-red-400">
                                        Blacklisted
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Report Source:</span>
                                    <span>{standing.blacklist.reportSource}</span>
                                </div>
                                {standing.blacklist.cheatCheckVersion && (
                                    <div className="flex justify-between">
                                        <span className="text-white/60">CheatCheck Version:</span>
                                        <span>{standing.blacklist.cheatCheckVersion}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="flex-1 rounded-sm border border-white/10 bg-black/40 p-4">
                    <h3 className="mb-3 text-base font-medium">Instance Flags</h3>
                    {standing.flags.length > 0 ? (
                        <div className="space-y-2">
                            {standing.flags.map((flag, idx) => (
                                <InstanceFlag key={idx} {...flag} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-white/60">No flags detected for this instance</p>
                    )}
                </div>
            </div>

            {standing.blacklist && (
                <div className="rounded-sm border border-white/10 bg-black/40 p-4">
                    <h3 className="mb-3 text-base font-medium">Blacklist Reason</h3>
                    <div className="rounded-sm border border-white/10 bg-black/40 p-4">
                        {standing.blacklist.reason}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {standing.players.map((player, index) => (
                    <PlayerCard key={index} player={player} />
                ))}
            </div>
        </div>
    )
}

function InstanceFlag(flag: InstanceFlag) {
    return (
        <div className="space-y-1 rounded-sm border border-white/10 bg-black/30 p-2 text-sm">
            <div className="flex justify-start gap-2">
                <span className="text-white/60">Flagged At:</span>
                <span>{new Date(flag.flaggedAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-start gap-2">
                <span className="text-white/60">Cheat Probability:</span>
                <span
                    className={cn(
                        flag.cheatProbability > 0.4
                            ? "text-red-400"
                            : flag.cheatProbability > 0.15
                              ? "text-yellow-400"
                              : "text-green-400"
                    )}>
                    {(flag.cheatProbability * 100).toFixed(2)}%
                </span>
            </div>
            <div className="flex justify-start gap-2">
                <span className="text-white/60">Detection:</span>
                <span>{getCheatCheckReasonsFromBitmask(flag.cheatCheckBitmask).join(", ")}</span>
            </div>
            <div className="flex justify-start gap-2">
                <span className="text-white/60">Check Cheat Version:</span>
                <span>{flag.cheatCheckVersion}</span>
            </div>
        </div>
    )
}

const cheatLevelStrings = {
    0: "None",
    1: "Suspicious",
    2: "Moderate",
    3: "Extreme",
    4: "Blacklisted"
}

function PlayerCard({ player }: { player: InstancePlayerStanding }) {
    const [selectedCheatLevel, setSelectedCheatLevel] = useState(player.cheatLevel)

    const handleSave = () => {
        // optionally update state/UI or show a toast
        // TODO!!
    }

    return (
        <div className="overflow-hidden rounded-sm border border-white/10 bg-black/40">
            <div className="border-b border-white/10 p-4">
                <div className="flex items-center justify-start gap-4">
                    <h3 className="flex items-center gap-2 text-base font-medium">
                        <User className="h-4 w-4" />
                        {getBungieDisplayName(player.playerInfo)}
                    </h3>
                    <Badge
                        variant="outline"
                        className={cn("rounded-sm text-xs", {
                            "border-red-400/30 bg-red-900/20 text-red-400": player.cheatLevel >= 3,
                            "border-blue-400/30 bg-blue-900/20 text-blue-400":
                                player.cheatLevel == 2,
                            "border-yellow-400/30 bg-yellow-900/20 text-yellow-400":
                                player.cheatLevel == 1,
                            "border-green-400/30 bg-green-900/20 text-green-400":
                                player.cheatLevel == 0
                        })}>
                        Cheat Level: {cheatLevelStrings[player.cheatLevel]}
                    </Badge>
                </div>
                <p className="text-primary/90 text-sm">
                    <Link
                        href={`/profile/${player.playerInfo.membershipId}`}
                        target="_blank"
                        className="text-hyperlink">
                        {player.playerInfo.membershipId}
                    </Link>{" "}
                    • {player.clears} clears
                </p>
                <div className="mt-2 flex w-48 gap-2">
                    <Button
                        variant="outline"
                        className="w-min justify-start rounded-sm border-white/10 bg-black/40 hover:bg-black/60"
                        disabled>
                        <Shield className="mr-2 size-4" />
                        Blacklist Instance-Player
                    </Button>
                    <Select
                        onValueChange={value =>
                            setSelectedCheatLevel(
                                parseInt(value, 10) as keyof typeof cheatLevelStrings
                            )
                        }
                        defaultValue={player.cheatLevel.toString()}>
                        <SelectTrigger className="h-9 w-full">
                            <SelectValue />
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

                    {selectedCheatLevel !== player.cheatLevel && (
                        <Button size="sm" onClick={handleSave} className="h-9 text-sm" disabled>
                            <TriangleAlert className="size-4" />
                            Save Cheat Level
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-4 p-4">
                <CurrentFlag flags={player.flags} />
                <PlayerBlacklistedInstances instances={player.blacklistedInstances} />
                <PlayerOtherFlags flags={player.otherRecentFlags} />
            </div>
        </div>
    )
}

function CurrentFlag({ flags }: { flags: readonly InstancePlayerFlag[] }) {
    return (
        <div>
            {flags.length > 0 ? (
                <div className="space-y-2">
                    {flags.map((flag, flagIndex) => (
                        <InstanceFlag key={flagIndex} {...flag} />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-white/60">No flags detected for this player</p>
            )}
        </div>
    )
}

function PlayerBlacklistedInstances({
    instances
}: {
    instances: readonly {
        readonly instanceId: string
        readonly instanceDate: string
        readonly reason: string
        readonly individualReason: string
        readonly createdAt: string
    }[]
}) {
    return (
        <div>
            <h4 className="mb-2 text-sm font-medium">Blacklisted Instances</h4>
            {instances.length > 0 ? (
                <div className="overflow-hidden rounded-sm bg-black/20">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10">
                                <TableHead className="text-white/60">Instance ID</TableHead>
                                <TableHead className="text-white/60">Date</TableHead>
                                <TableHead className="text-white/60">Reason</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {instances.map((instance, instanceIndex) => (
                                <TableRow key={instanceIndex} className="border-white/10">
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
                                    <TableCell className="text-sm">
                                        {instance.individualReason}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-sm text-white/60">No blacklisted instances for this player</p>
            )}
        </div>
    )
}

function PlayerOtherFlags({ flags }: { flags: readonly InstancePlayerFlag[] }) {
    return (
        <div>
            <h4 className="mb-2 text-sm font-medium">Other Recent Flags</h4>
            {flags.length > 0 ? (
                <div className="overflow-hidden rounded-sm bg-black/20">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10">
                                <TableHead className="text-white/60">Instance ID</TableHead>
                                <TableHead className="text-white/60">Date</TableHead>
                                <TableHead className="text-white/60">Probability</TableHead>
                                <TableHead className="text-white/60">Detection</TableHead>
                                <TableHead className="text-white/60">Cheat Check Version</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {flags.map((flag, flagIndex) => (
                                <TableRow key={flagIndex} className="border-white/10">
                                    <TableCell className="text-sm">
                                        <Link
                                            className="text-hyperlink"
                                            href={`/pgcr/${flag.instanceId}`}
                                            target="_blank">
                                            {flag.instanceId}
                                        </Link>
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
                                        {getCheatCheckReasonsFromBitmask(
                                            flag.cheatCheckBitmask
                                        ).join(", ")}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {flag.cheatCheckVersion}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-sm text-white/60">No other recent flags for this player</p>
            )}
        </div>
    )
}

const CheatFlags: Record<number, string> = {
    // 0: "Manual",
    // 1: "Leviathan",
    // 2: "Eater Of Worlds",
    // 3: "Spire Of Stars",
    // 4: "Last Wish",
    // 5: "Scourge Of The Past",
    // 6: "Crown Of Sorrow",
    // 7: "Garden Of Salvation",
    // 8: "Deep Stone Crypt",
    // 9: "Vault Of Glass",
    // 10: "Vow Of The Disciple",
    // 11: "Kings Fall",
    // 12: "Root Of Nightmares",
    // 13: "Crotas End",
    // 14: "Salvations Edge",
    // 15: "Raid 15",
    // 16: "Raid 16",
    // 17: "Raid 17",
    // 18: "Raid 18",
    // 19: "Raid 19",
    // 20: "Raid 20",
    // 21: "Raid 21",
    // 22: "Raid 22",
    // 23: "Raid 23",
    // 24: "Raid 24",
    // 25: "Raid 25",
    // 26: "Raid 26",
    // 27: "Raid 27",
    // 28: "Raid 28",
    // 29: "Raid 29",
    // 30: "Raid 30",
    // 31: "Raid 31",
    // 32: "Pantheon",
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
    53: "Bit 53",
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

    return reasons
}
