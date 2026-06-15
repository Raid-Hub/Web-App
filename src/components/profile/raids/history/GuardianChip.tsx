"use client"

import Link from "next/link"
import { useGetCharacterClass } from "~/hooks/pgcr/useCharacterClass"
import { type ClusterGuardian } from "~/lib/activity/guardians"
import { Avatar, AvatarFallback, AvatarImage } from "~/shad/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/shad/tooltip"
import { bungieProfileIconUrl, getBungieDisplayName } from "~/util/destiny"

export const GuardianChip = ({ guardian }: { guardian: ClusterGuardian }) => {
    const getCharacterIcon = useGetCharacterClass()
    const displayName = getBungieDisplayName(guardian.playerInfo, { excludeCode: true })
    const classEntries = guardian.classHashes.map(classHash => {
        const [Icon, className] = getCharacterIcon(classHash)
        return { classHash, Icon, className }
    })
    const classNamesText = classEntries.map(entry => entry.className).join(", ")

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Link
                    href={`/profile/${guardian.playerInfo.membershipId}?tab=history`}
                    className="focus-visible:ring-ring rounded-md outline-none focus-visible:ring-2"
                    onClick={event => event.stopPropagation()}>
                    <span className="border-border/40 bg-muted/25 hover:bg-muted/40 inline-flex max-w-full items-center gap-1 rounded-md border py-0.5 pr-1.5 pl-0.5 text-xs backdrop-blur-sm transition-colors">
                        <Avatar className="size-6 shrink-0 rounded-[4px]">
                            <AvatarImage
                                src={bungieProfileIconUrl(guardian.playerInfo.iconPath)}
                                alt={displayName}
                            />
                            <AvatarFallback className="rounded-[4px] text-[10px]">
                                {displayName.charAt(0).toLocaleUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {classEntries.length > 0 ? (
                            <span className="inline-flex shrink-0 items-center gap-0.5">
                                {classEntries.map(({ classHash, Icon, className }) => (
                                    <Icon
                                        key={classHash}
                                        className="text-primary size-3.5"
                                        aria-label={className}
                                    />
                                ))}
                            </span>
                        ) : null}
                        <span className="max-w-[5.5rem] truncate font-medium sm:max-w-[7rem]">
                            {displayName}
                        </span>
                    </span>
                </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">
                <span className="font-medium">{displayName}</span>
                {classNamesText ? (
                    <span className="text-muted-foreground">
                        {" · "}
                        {classNamesText}
                    </span>
                ) : null}
            </TooltipContent>
        </Tooltip>
    )
}
