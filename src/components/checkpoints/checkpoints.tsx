import { Collection } from "@discordjs/collection"
import { Circle } from "lucide-react"
import { unstable_noStore } from "next/cache"
import Image from "next/image"
import { ErrorCard } from "~/components/ErrorCard"
import { cn } from "~/lib/tw"
import { getCheckpoints } from "~/services/d2checkpoint/http"
import { prefetchManifest } from "~/services/raidhub/prefetchRaidHubManifest"
import { Card, CardContent, CardHeader, CardTitle } from "~/shad/card"
import { TooltipProvider } from "~/shad/tooltip"
import { ClientControls } from "./controls"
import { CopyButton } from "./copy-button"
export const Checkpoints = async () => {
    unstable_noStore()
    const [checkpoints, manifest] = await Promise.all([getCheckpoints(), prefetchManifest()])
    const refreshedAt = new Date()

    const groupedCheckpoints = new Collection<
        string,
        {
            title: string
            image: string
            checkpoints: {
                key: number
                maxPlayers: number
                currentPlayers: number
                encounterName: string
                botBungieName: string
                versionName: string
            }[]
        }
    >()

    checkpoints.checkpoints.forEach(checkpoint => {
        const ids = manifest.hashes[checkpoint.activityHash]
        if (!ids) return

        const checkpointData = {
            key: checkpoint.key,
            maxPlayers: checkpoint.maxPlayers,
            currentPlayers: checkpoint.currentPlayers,
            encounterName: checkpoint.encounterName,
            versionName: manifest.versionDefinitions[ids.versionId]?.name ?? "Unknown",
            botBungieName: checkpoint.botBungieName
        }

        if (!groupedCheckpoints.has(checkpoint.encounterName)) {
            groupedCheckpoints.set(checkpoint.encounterName, {
                title: `${manifest.activityDefinitions[ids.activityId]?.name ?? "Unknown"}: ${checkpoint.encounterName}`,
                image: checkpoint.encounterImageURL,
                checkpoints: [checkpointData]
            })
        } else {
            groupedCheckpoints.get(checkpoint.encounterName)!.checkpoints.push(checkpointData)
        }
    })

    return (
        <TooltipProvider>
            <div>
                <div className="flex w-full flex-col items-start pb-5">
                    {checkpoints.alert.active && <ErrorCard>{checkpoints.alert.message}</ErrorCard>}
                    <ClientControls refreshedAt={refreshedAt} />
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-3">
                    {groupedCheckpoints.map(group => (
                        <Card key={group.title} className="overflow-hidden">
                            <CardHeader className="relative min-h-40 p-0 md:p-0">
                                <CardTitle className="text-shadow-accent z-1 row-start-2 mt-auto p-6 pb-2 text-2xl font-bold text-shadow-lg">
                                    {group.title}
                                </CardTitle>
                                <Image
                                    unoptimized
                                    src={group.image || "/placeholder.svg"}
                                    alt={group.title}
                                    fill
                                    className="object-cover brightness-80"
                                />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {group.checkpoints.map(checkpoint => (
                                    <div key={checkpoint.key}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col items-start">
                                                <h3
                                                    className="text-sm font-extrabold whitespace-nowrap uppercase"
                                                    style={{
                                                        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.9)"
                                                    }}>
                                                    {checkpoint.versionName}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">
                                                    {checkpoint.currentPlayers}/
                                                    {checkpoint.maxPlayers}
                                                </span>
                                                <Circle
                                                    className={cn("h-4 w-4 stroke-5 text-red-500", {
                                                        "text-yellow-500":
                                                            checkpoint.currentPlayers < 6,
                                                        "text-green-500":
                                                            checkpoint.currentPlayers < 3
                                                    })}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <span className="space-x-1.5">
                                                <h3 className="text-muted-foreground inline">|</h3>
                                                <span className="text-sm">
                                                    {checkpoint.botBungieName}
                                                </span>
                                            </span>
                                            <CopyButton text={checkpoint.botBungieName} />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </TooltipProvider>
    )
}
