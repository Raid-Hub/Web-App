import { User } from "lucide-react"
import { cn } from "~/lib/tw"
import type { InstancePlayerStanding } from "~/services/raidhub/types"
import { Badge } from "~/shad/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/shad/table"

interface PlayersTabProps {
    players: InstancePlayerStanding[]
}

export function PlayersTab({ players }: PlayersTabProps) {
    return (
        <div className="space-y-4">
            {players.map((player, index) => (
                <PlayerCard key={index} player={player} />
            ))}
        </div>
    )
}

function PlayerCard({ player }: { player: InstancePlayerStanding }) {
    return (
        <div className="overflow-hidden rounded-sm border border-white/10 bg-black/40">
            <div className="border-b border-white/10 p-4">
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-base font-medium">
                        <User className="h-4 w-4" />
                        {player.playerInfo.bungieGlobalDisplayName}
                        <Badge variant="outline" className="ml-2 rounded-sm text-xs">
                            {player.playerInfo.membershipType}
                        </Badge>
                    </h3>
                    <Badge
                        variant="outline"
                        className={cn(
                            "rounded-sm text-xs",
                            player.cheatLevel >= 3
                                ? "border-red-400/30 bg-red-900/20 text-red-400"
                                : player.cheatLevel >= 2
                                  ? "border-yellow-400/30 bg-yellow-900/20 text-yellow-400"
                                  : player.cheatLevel >= 1
                                    ? "border-blue-400/30 bg-blue-900/20 text-blue-400"
                                    : "border-green-400/30 bg-green-900/20 text-green-400"
                        )}>
                        Cheat Level: {player.cheatLevel}
                    </Badge>
                </div>
                <p className="mt-1 text-sm text-white/60">
                    Player ID: {player.playerInfo.membershipId} • Clears: {player.clears}
                </p>
            </div>

            <div className="space-y-4 p-4">
                <PlayerFlags flags={player.flags} />
                <PlayerBlacklistedInstances instances={player.blacklistedInstances} />
                <PlayerOtherFlags flags={player.otherRecentFlags} />
            </div>
        </div>
    )
}

function PlayerFlags({ flags }: { flags: any[] }) {
    return (
        <div>
            <h4 className="mb-2 text-sm font-medium">Current Instance Flags</h4>
            {flags.length > 0 ? (
                <div className="space-y-2">
                    {flags.map((flag, flagIndex) => (
                        <div
                            key={flagIndex}
                            className="rounded-sm border border-white/10 bg-black/30 p-2 text-sm">
                            <div className="mb-1 flex justify-between">
                                <span className="text-white/60">Flagged At:</span>
                                <span>{flag.flaggedAt}</span>
                            </div>
                            <div className="mb-1 flex justify-between">
                                <span className="text-white/60">Cheat Probability:</span>
                                <span
                                    className={cn(
                                        flag.cheatProbability > 0.8
                                            ? "text-red-400"
                                            : flag.cheatProbability > 0.5
                                              ? "text-yellow-400"
                                              : "text-green-400"
                                    )}>
                                    {(flag.cheatProbability * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/60">Detection:</span>
                                <span>{flag.cheatCheckBitmask.description}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-white/60">No flags detected for this player</p>
            )}
        </div>
    )
}

function PlayerBlacklistedInstances({ instances }: { instances: any[] }) {
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
                                    <TableCell className="text-sm">{instance.instanceId}</TableCell>
                                    <TableCell className="text-sm">
                                        {instance.instanceDate}
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

function PlayerOtherFlags({ flags }: { flags: any[] }) {
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {flags.map((flag, flagIndex) => (
                                <TableRow key={flagIndex} className="border-white/10">
                                    <TableCell className="text-sm">{flag.instanceId}</TableCell>
                                    <TableCell className="text-sm">{flag.flaggedAt}</TableCell>
                                    <TableCell className="text-sm">
                                        <span
                                            className={cn(
                                                flag.cheatProbability > 0.8
                                                    ? "text-red-400"
                                                    : flag.cheatProbability > 0.5
                                                      ? "text-yellow-400"
                                                      : "text-green-400"
                                            )}>
                                            {(flag.cheatProbability * 100).toFixed(1)}%
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {flag.cheatCheckBitmask.description}
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
